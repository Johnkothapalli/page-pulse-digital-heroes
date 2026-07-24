import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AuditFailure } from "@/lib/audit-failure";
import { fetchHtmlPage } from "@/lib/fetch-page";

const publicTarget = async (input: unknown) => new URL(String(input));

describe("fetchHtmlPage", () => {
  it("fetches HTML and preserves the upstream status", async () => {
    let clock = 100;
    const result = await fetchHtmlPage("https://example.com", {
      validateTarget: publicTarget,
      now: () => {
        clock += 25;
        return clock;
      },
      fetchImpl: (async () =>
        new Response("<h1>Useful page</h1>", {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        })) as typeof fetch,
    });

    assert.equal(result.httpStatus, 404);
    assert.equal(result.html, "<h1>Useful page</h1>");
    assert.equal(result.responseTimeMs, 25);
  });

  it("returns a typed failure for non-HTML responses", async () => {
    await assert.rejects(
      fetchHtmlPage("https://example.com/report.pdf", {
        validateTarget: publicTarget,
        fetchImpl: (async () =>
          new Response("%PDF", {
            status: 200,
            headers: { "content-type": "application/pdf" },
          })) as typeof fetch,
      }),
      (error: unknown) => {
        return (
          error instanceof AuditFailure &&
          error.code === "NON_HTML_RESPONSE" &&
          error.status === 415
        );
      },
    );
  });

  it("returns a typed timeout instead of leaking a fetch error", async () => {
    await assert.rejects(
      fetchHtmlPage("https://slow.example.com", {
        validateTarget: publicTarget,
        fetchImpl: (async () => {
          throw new DOMException("aborted", "AbortError");
        }) as typeof fetch,
      }),
      (error: unknown) => {
        return (
          error instanceof AuditFailure &&
          error.code === "TIMEOUT" &&
          error.status === 504
        );
      },
    );
  });

  it("validates every redirect destination", async () => {
    const validated: string[] = [];
    let calls = 0;
    const result = await fetchHtmlPage("https://first.example", {
      validateTarget: async (input) => {
        const url = new URL(String(input));
        validated.push(url.toString());
        return url;
      },
      fetchImpl: (async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(null, {
            status: 302,
            headers: { location: "https://second.example/page" },
          });
        }
        return new Response("<title>Done</title>", {
          headers: { "content-type": "text/html" },
        });
      }) as typeof fetch,
    });

    assert.deepEqual(validated, [
      "https://first.example/",
      "https://second.example/page",
    ]);
    assert.equal(result.url, "https://second.example/page");
  });
});
