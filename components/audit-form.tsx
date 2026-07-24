"use client";

import { FormEvent, useState } from "react";

import type { ApiErrorPayload, AuditReport } from "@/lib/types";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; report: AuditReport }
  | { status: "error"; error: ApiErrorPayload["error"] };

const SAMPLE_URLS = ["https://example.com", "https://digitalheroesco.com"];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="M4 10h11M11 5l5 5-5 5" />
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

function metricTone(value: number, ideal: (value: number) => boolean) {
  return ideal(value) ? "good" : "attention";
}

function ResultCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "good" | "attention" | "neutral";
}) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__top">
        <span>{label}</span>
        <i aria-hidden="true" />
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Report({ report }: { report: AuditReport }) {
  const statusTone =
    report.httpStatus >= 200 && report.httpStatus < 400 ? "good" : "attention";

  return (
    <section className="report" aria-labelledby="report-title">
      <div className="report__heading">
        <div>
          <span className="section-kicker">Latest snapshot</span>
          <h2 id="report-title">What the browser found</h2>
        </div>
        <span className="report__time">
          {new Intl.DateTimeFormat("en", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(report.auditedAt))}
        </span>
      </div>

      <a
        className="report__url"
        href={report.url}
        target="_blank"
        rel="noreferrer"
      >
        <span>{report.url}</span>
        <ArrowIcon />
      </a>

      <div className="metrics-grid">
        <ResultCard
          label="HTTP status"
          value={report.httpStatus}
          detail={
            statusTone === "good"
              ? "The server returned a usable response."
              : "Review the server response before indexing."
          }
          tone={statusTone}
        />
        <ResultCard
          label="Response time"
          value={`${report.responseTimeMs} ms`}
          detail="Network fetch time from the audit server."
          tone={metricTone(report.responseTimeMs, (value) => value < 800)}
        />
        <ResultCard
          label="H1 headings"
          value={report.h1Count}
          detail={
            report.h1Count === 1
              ? "One clear primary heading."
              : "Most pages benefit from one clear H1."
          }
          tone={metricTone(report.h1Count, (value) => value === 1)}
        />
        <ResultCard
          label="Words"
          value={report.wordCount.toLocaleString()}
          detail="Approximate readable on-page copy."
        />
        <ResultCard
          label="Images"
          value={report.imageCount}
          detail={`${report.imagesMissingAlt} missing or using empty alt text.`}
          tone={metricTone(report.imagesMissingAlt, (value) => value === 0)}
        />
      </div>

      <div className="metadata-grid">
        <article>
          <span>Page title</span>
          <p>{report.title ?? "No title found"}</p>
        </article>
        <article>
          <span>Meta description</span>
          <p>{report.metaDescription ?? "No meta description found"}</p>
        </article>
      </div>

      <p className="report__note">
        This is a fast HTML snapshot—not a Lighthouse score. It shows what the
        server exposed during this request.
      </p>
    </section>
  );
}

export function AuditForm() {
  const [url, setUrl] = useState("");
  const [requestState, setRequestState] = useState<RequestState>({
    status: "idle",
  });

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

  return (
    <>
      <section className="audit-panel" aria-labelledby="audit-heading">
        <div className="audit-panel__label">
          <span>01</span>
          <h2 id="audit-heading">Enter a public page</h2>
        </div>

        <form onSubmit={runAudit}>
          <label htmlFor="audit-url">URL to inspect</label>
          <div className="url-control">
            <span aria-hidden="true">↗</span>
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
              disabled={requestState.status === "loading"}
              required
            />
            <button
              type="submit"
              disabled={requestState.status === "loading"}
            >
              <span>
                {requestState.status === "loading"
                  ? "Reading page…"
                  : "Run page pulse"}
              </span>
              {requestState.status === "loading" ? (
                <i className="spinner" aria-hidden="true" />
              ) : (
                <ArrowIcon />
              )}
            </button>
          </div>
        </form>

        <div className="sample-links">
          <span>Try a sample</span>
          {SAMPLE_URLS.map((sample) => (
            <button key={sample} type="button" onClick={() => setUrl(sample)}>
              {new URL(sample).hostname}
            </button>
          ))}
        </div>

        {requestState.status === "error" && (
          <div className="error-box" role="alert">
            <strong>{requestState.error.message}</strong>
            {requestState.error.hint && <p>{requestState.error.hint}</p>}
            <span>{requestState.error.code.replaceAll("_", " ")}</span>
          </div>
        )}
      </section>

      <div aria-live="polite" aria-busy={requestState.status === "loading"}>
        {requestState.status === "success" && (
          <Report report={requestState.report} />
        )}
      </div>
    </>
  );
}
