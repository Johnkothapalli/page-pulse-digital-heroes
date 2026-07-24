import { AuditFailure } from "@/lib/audit-failure";
import { validatePublicTarget } from "@/lib/url-safety";

const TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 1_500_000;
const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

interface FetchDependencies {
  fetchImpl?: typeof fetch;
  validateTarget?: (input: unknown) => Promise<URL>;
  now?: () => number;
}

export interface FetchedPage {
  html: string;
  url: string;
  httpStatus: number;
  responseTimeMs: number;
}

async function readLimitedBody(response: Response): Promise<string> {
  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new AuditFailure(
        "PAGE_TOO_LARGE",
        413,
        "The page is larger than the 1.5 MB audit limit.",
        "Try a lighter HTML page or a specific landing page.",
      );
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

function assertHtmlResponse(response: Response): void {
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    throw new AuditFailure(
      "PAGE_TOO_LARGE",
      413,
      "The page is larger than the 1.5 MB audit limit.",
    );
  }

  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (
    contentType !== "text/html" &&
    contentType !== "application/xhtml+xml"
  ) {
    throw new AuditFailure(
      "NON_HTML_RESPONSE",
      415,
      "The URL did not return an HTML page.",
      contentType
        ? `The server returned ${contentType}.`
        : "The server did not provide an HTML content type.",
    );
  }
}

export async function fetchHtmlPage(
  rawUrl: unknown,
  dependencies: FetchDependencies = {},
): Promise<FetchedPage> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const validateTarget = dependencies.validateTarget ?? validatePublicTarget;
  const now = dependencies.now ?? (() => performance.now());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = now();

  try {
    let currentUrl = await validateTarget(rawUrl);

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      const response = await fetchImpl(currentUrl, {
        method: "GET",
        headers: {
          accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
          "user-agent": "PagePulse/1.0 (Digital Heroes training task)",
        },
        redirect: "manual",
        signal: controller.signal,
        cache: "no-store",
      });

      if (REDIRECT_STATUSES.has(response.status)) {
        if (redirectCount === MAX_REDIRECTS) {
          throw new AuditFailure(
            "TOO_MANY_REDIRECTS",
            508,
            "The page redirected too many times.",
          );
        }

        const location = response.headers.get("location");
        if (!location) {
          throw new AuditFailure(
            "BROKEN_REDIRECT",
            502,
            "The server returned a redirect without a destination.",
          );
        }

        currentUrl = await validateTarget(
          new URL(location, currentUrl).toString(),
        );
        continue;
      }

      assertHtmlResponse(response);
      const html = await readLimitedBody(response);

      return {
        html,
        url: currentUrl.toString(),
        httpStatus: response.status,
        responseTimeMs: now() - startedAt,
      };
    }

    throw new AuditFailure(
      "TOO_MANY_REDIRECTS",
      508,
      "The page redirected too many times.",
    );
  } catch (error) {
    if (error instanceof AuditFailure) {
      throw error;
    }

    if (
      error instanceof Error &&
      (error.name === "AbortError" || error.name === "TimeoutError")
    ) {
      throw new AuditFailure(
        "TIMEOUT",
        504,
        "The page did not respond within 8 seconds.",
      );
    }

    throw new AuditFailure(
      "FETCH_FAILED",
      502,
      "The page could not be fetched.",
      "The site may be offline or blocking automated requests.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
