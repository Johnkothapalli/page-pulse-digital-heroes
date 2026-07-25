"use client";

import {
  FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ApiErrorPayload, AuditReport } from "@/lib/types";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: AuditReport }
  | { status: "error"; error: ApiErrorPayload["error"] };

type Tone = "good" | "attention" | "neutral";

const SAMPLE_URLS = ["https://example.com", "https://digitalheroesco.com"];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M6 14 14 6M7 6h7v7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m4 10 4 4 8-9" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M10 3 2.8 16h14.4L10 3Z" />
      <path d="M10 7.4v4.1M10 14.1v.1" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" />
      <path d="M3.4 10h13.2M10 3c2 2 3 4.4 3 7s-1 5-3 7c-2-2-3-4.4-3-7s1-5 3-7Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.3l2.8 1.7" />
    </svg>
  );
}

function HeadingIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 4v12M12 4v12M4 10h8M15 7v9M14 8l2-1" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <circle cx="7.2" cy="8" r="1.3" />
      <path d="m4.5 14 3.8-3.7 2.4 2.2 1.7-1.6 3.1 3.1" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 5h12M4 8.5h12M4 12h8M4 15.5h10" />
    </svg>
  );
}

function ResultCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: Tone;
  icon: ReactNode;
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span className="metric-icon">{icon}</span>
        <span className="metric-status">
          <i aria-hidden="true" />
          {tone === "good"
            ? "Looks clear"
            : tone === "attention"
              ? "Review"
              : "Observed"}
        </span>
      </div>
      <span className="metric-card__label">{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function getFindings(report: AuditReport) {
  return [
    {
      tone:
        report.httpStatus >= 200 && report.httpStatus < 400
          ? ("good" as const)
          : ("attention" as const),
      label:
        report.httpStatus >= 200 && report.httpStatus < 400
          ? "The server returned a usable response."
          : `The server returned HTTP ${report.httpStatus}.`,
    },
    {
      tone:
        report.responseTimeMs < 800
          ? ("good" as const)
          : ("attention" as const),
      label:
        report.responseTimeMs < 800
          ? "The server fetch completed in under 800 ms."
          : "The server fetch took longer than 800 ms.",
    },
    {
      tone:
        report.h1Count === 1 ? ("good" as const) : ("attention" as const),
      label:
        report.h1Count === 1
          ? "One clear primary heading was found."
          : report.h1Count === 0
            ? "No H1 heading was found."
            : `${report.h1Count} H1 headings were found.`,
    },
    {
      tone: report.title ? ("good" as const) : ("attention" as const),
      label: report.title
        ? "A page title is available."
        : "The page title is missing.",
    },
    {
      tone: report.metaDescription
        ? ("good" as const)
        : ("attention" as const),
      label: report.metaDescription
        ? "A meta description is available."
        : "The meta description is missing.",
    },
    {
      tone:
        report.imagesMissingAlt === 0
          ? ("good" as const)
          : ("attention" as const),
      label:
        report.imagesMissingAlt === 0
          ? "No image alt-text gaps were detected."
          : `${report.imagesMissingAlt} image${report.imagesMissingAlt === 1 ? "" : "s"} need alt-text review.`,
    },
  ];
}

function AuditProgress() {
  return (
    <div className="audit-progress" role="status">
      <div className="audit-progress__visual" aria-hidden="true">
        <span className="progress-ring progress-ring--one" />
        <span className="progress-ring progress-ring--two" />
        <span className="progress-pulse">
          <svg viewBox="0 0 40 40">
            <path d="M2 21h8l4-11 7 21 5-14 3 4h9" />
          </svg>
        </span>
      </div>
      <div className="audit-progress__copy">
        <span className="section-kicker">Audit in progress</span>
        <h3>Reading what the server sends back</h3>
        <ol>
          <li>
            <i aria-hidden="true" />
            Validating public target
          </li>
          <li>
            <i aria-hidden="true" />
            Fetching page HTML
          </li>
          <li>
            <i aria-hidden="true" />
            Mapping page signals
          </li>
        </ol>
      </div>
    </div>
  );
}

function Report({ report }: { report: AuditReport }) {
  const findings = getFindings(report);
  const attentionFindings = findings.filter(
    (finding) => finding.tone === "attention",
  );
  const clearCount = findings.length - attentionFindings.length;
  const statusTone: Tone =
    report.httpStatus >= 200 && report.httpStatus < 400
      ? "good"
      : "attention";
  const responseTone: Tone =
    report.responseTimeMs < 800 ? "good" : "attention";
  const h1Tone: Tone = report.h1Count === 1 ? "good" : "attention";
  const imageTone: Tone =
    report.imagesMissingAlt === 0 ? "good" : "attention";
  const hostname = new URL(report.url).hostname;

  return (
    <section className="report" aria-labelledby="report-title">
      <div className="report__heading">
        <div className="report__title-row">
          <span className="complete-mark">
            <CheckIcon />
          </span>
          <div>
            <span className="section-kicker">Audit complete</span>
            <h2 id="report-title">{hostname}</h2>
          </div>
        </div>
        <div className="report__meta">
          <span>
            {new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(report.auditedAt))}
          </span>
          <a href="#audit">Run another audit</a>
        </div>
      </div>

      <a
        className="report__url"
        href={report.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open audited page: ${report.url}`}
      >
        <GlobeIcon />
        <span className="report__url-text">{report.url}</span>
        <span className="report__url-action">Open page</span>
        <ArrowUpRight />
      </a>

      <div
        className={`report-summary ${
          attentionFindings.length === 0
            ? "report-summary--clear"
            : "report-summary--attention"
        }`}
      >
        <div className="report-summary__copy">
          <span>
            {attentionFindings.length === 0 ? <CheckIcon /> : <AlertIcon />}
          </span>
          <div>
            <p>Snapshot summary</p>
            <h3>
              {attentionFindings.length === 0
                ? "All six baseline checks look clear."
                : `${attentionFindings.length} ${
                    attentionFindings.length === 1 ? "signal" : "signals"
                  } worth a closer look.`}
            </h3>
          </div>
        </div>
        <div className="report-summary__count">
          <strong>
            {clearCount}
            <span>/6</span>
          </strong>
          <p>checks clear</p>
        </div>
      </div>

      <div className="metrics-grid">
        <ResultCard
          label="HTTP status"
          value={report.httpStatus}
          detail={
            statusTone === "good"
              ? "Usable server response."
              : "Review the server response."
          }
          tone={statusTone}
          icon={<GlobeIcon />}
        />
        <ResultCard
          label="Response time"
          value={`${report.responseTimeMs} ms`}
          detail="Fetch time from the audit server."
          tone={responseTone}
          icon={<ClockIcon />}
        />
        <ResultCard
          label="H1 headings"
          value={report.h1Count}
          detail={
            report.h1Count === 1
              ? "One primary heading."
              : "Aim for one clear H1."
          }
          tone={h1Tone}
          icon={<HeadingIcon />}
        />
        <ResultCard
          label="Images"
          value={report.imageCount}
          detail={`${report.imagesMissingAlt} missing or empty alt text.`}
          tone={imageTone}
          icon={<ImageIcon />}
        />
        <ResultCard
          label="Readable words"
          value={report.wordCount.toLocaleString()}
          detail="Approximate on-page copy."
          icon={<TextIcon />}
        />
      </div>

      <div className="report-details">
        <article className="search-preview">
          <div className="detail-card__heading">
            <div>
              <span className="section-kicker">Search preview</span>
              <h3>How the metadata reads</h3>
            </div>
            <span className="preview-label">Preview</span>
          </div>
          <div className="search-result">
            <p className="search-result__url">{report.url}</p>
            <h4>{report.title ?? "No page title found"}</h4>
            <p>
              {report.metaDescription ??
                "No meta description was exposed by this page."}
            </p>
          </div>
          <p className="detail-footnote">
            Search engines may rewrite this copy. This preview only reflects
            the HTML returned during the audit.
          </p>
        </article>

        <article className="findings-card">
          <div className="detail-card__heading">
            <div>
              <span className="section-kicker">Baseline checks</span>
              <h3>What deserves attention</h3>
            </div>
          </div>
          <ul>
            {(attentionFindings.length > 0
              ? attentionFindings
              : findings.slice(0, 3)
            ).map((finding) => (
              <li key={finding.label} className={`finding--${finding.tone}`}>
                <span>
                  {finding.tone === "good" ? <CheckIcon /> : <AlertIcon />}
                </span>
                <p>{finding.label}</p>
              </li>
            ))}
          </ul>
          <p className="detail-footnote">
            Baseline checks are transparent rules, not a synthetic quality
            score.
          </p>
        </article>
      </div>

      <div className="report__note">
        <span>Scope note</span>
        <p>
          This is a fast HTML snapshot, not a Lighthouse score. It shows what
          the server exposed during this request.
        </p>
      </div>
    </section>
  );
}

export function AuditForm() {
  const [url, setUrl] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [requestState, setRequestState] = useState<RequestState>({
    status: "idle",
  });

  useEffect(() => {
    if (requestState.status !== "success") {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: motionQuery.matches ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [requestState.status]);

  async function runAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({ status: "loading" });

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await response.json()) as AuditReport | ApiErrorPayload;

      if (!response.ok) {
        const apiError =
          "error" in payload
            ? payload.error
            : {
                code: "UNKNOWN_ERROR",
                message: "The audit could not be completed.",
              };
        setRequestState({ status: "error", error: apiError });
        return;
      }

      setRequestState({
        status: "success",
        report: payload as AuditReport,
      });
    } catch {
      setRequestState({
        status: "error",
        error: {
          code: "NETWORK_ERROR",
          message: "Page Pulse could not reach its audit service.",
          hint: "Check your connection and try once more.",
        },
      });
    }
  }

  const isLoading = requestState.status === "loading";

  return (
    <>
      <section className="audit-panel" id="audit" aria-labelledby="audit-heading">
        <div className="audit-panel__top">
          <div className="audit-panel__label">
            <span>01</span>
            <div>
              <p>Start a new snapshot</p>
              <h2 id="audit-heading">Inspect any public page</h2>
            </div>
          </div>
          <p className="audit-panel__aside">
            Your URL is used for this request only.
            <br />
            Nothing is stored.
          </p>
        </div>

        <form onSubmit={runAudit}>
          <label htmlFor="audit-url">URL to inspect</label>
          <div className="url-control">
            <span className="url-control__icon" aria-hidden="true">
              <GlobeIcon />
            </span>
            <div className="url-control__field">
              <span>Public page URL</span>
              <input
                id="audit-url"
                name="url"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="https://your-site.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <button type="submit" disabled={isLoading}>
              <span>{isLoading ? "Reading page" : "Run page pulse"}</span>
              {isLoading ? (
                <i className="spinner" aria-hidden="true" />
              ) : (
                <ArrowIcon />
              )}
            </button>
          </div>
        </form>

        <div className="sample-links">
          <span>Or try a sample</span>
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setUrl(sample)}
              disabled={isLoading}
            >
              {new URL(sample).hostname}
              <ArrowUpRight />
            </button>
          ))}
        </div>

        {requestState.status === "error" && (
          <div className="error-box" role="alert">
            <span className="error-box__icon">
              <AlertIcon />
            </span>
            <div>
              <strong>{requestState.error.message}</strong>
              {requestState.error.hint && <p>{requestState.error.hint}</p>}
            </div>
            <span className="error-box__code">
              {requestState.error.code.replaceAll("_", " ")}
            </span>
          </div>
        )}
      </section>

      <div
        ref={resultRef}
        className="result-region"
        aria-live="polite"
        aria-busy={isLoading}
      >
        {isLoading && <AuditProgress />}
        {requestState.status === "success" && (
          <Report report={requestState.report} />
        )}
      </div>
    </>
  );
}
