# Three-minute Loom walkthrough

Use this as a guide rather than reading it word for word. Keep your camera bubble visible and speak naturally.

## 0:00-0:25 - Frame the problem

"This is Page Pulse, a focused URL-audit tool. I deliberately avoided an artificial score. The API returns observable facts: the upstream status and response time, page title, description, H1 count, image-alt gaps, and approximate readable words."

## 0:25-1:05 - Demonstrate the happy path

1. Open the live application in a fresh private window.
2. Audit `https://example.com`.
3. Point out the upstream HTTP status, response time, one H1, page title, and word count.
4. Open the result URL to show that the submitted and displayed page agree.

Suggested line: "A 404 HTML page would still produce a report with `httpStatus: 404`, because the audit itself succeeded. I kept transport success separate from the page's status."

## 1:05-1:35 - Deliberately trigger failures

1. Submit `not-a-url` and show the useful validation message.
2. Submit `http://localhost:3000` and show that local targets are blocked.
3. If time permits, submit `https://httpbin.org/image/png` to demonstrate the non-HTML error.

Suggested line: "The service returns typed errors and never exposes a stack trace. It also times out slow targets and caps the response body."

## 1:35-2:25 - Walk through one code path

Open `lib/fetch-page.ts` and `lib/parser.ts`.

"I separated network behavior from parsing so each part is easier to reason about and test. The fetcher validates the initial URL and every redirect, refuses private IP ranges, stops after five redirects, and enforces time and size limits. Once valid HTML arrives, the parser removes scripts, styles, templates, SVG, and iframe content before estimating readable words."

Briefly show `tests/fetch-page.test.ts`, especially redirect revalidation and the non-HTML failure.

## 2:25-2:50 - Explain one visual choice

"I treated the interface like a small diagnostic instrument rather than a generic dashboard. The result says 'snapshot' instead of inventing an SEO score. Its six baseline checks are visible rules, green and coral are only supporting cues, and the exact measurements remain primary. The search preview turns the raw title and description into something immediately understandable."

## 2:50-3:00 - Honest self-critique

"With another day, I would route outbound traffic through an egress proxy that pins the DNS-approved IP. The application checks DNS and redirects now, but network-level enforcement would close the remaining rebinding gap. I would add a small normalized-URL cache after that."

Finish: "The setup, API contract, assumptions, and three design decisions are documented in the README."
