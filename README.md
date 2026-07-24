# Page Pulse

Page Pulse is a small web tool that audits a public URL and returns a clean JSON report plus a readable browser view. It measures the HTTP status, response time, title, meta description, H1 count, images missing alt text, total images, and approximate readable word count.

> Built for the Digital Heroes Software Development (SDE) training task.

## Links

- Live application: https://page-pulse-audit.ai-coding-challenge.chatgpt.site
- API endpoint: `POST /api/audit`
- Loom walkthrough: add the recorded link to `submission/SUBMISSION.md`

## Run locally

Prerequisites: Node.js 20.19 or newer. Node.js 22 LTS is recommended for the Worker preview tooling.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To run all verification:

```bash
npm run check
```

That command type-checks the project, runs the test suite, and creates a production build.

To create the bundled Worker artifact used by the production host:

```bash
npm run build:sites
```

## API contract

### Request

`POST /api/audit`

```json
{
  "url": "https://example.com"
}
```

Only complete public `http://` and `https://` URLs are accepted.

### Successful response

```json
{
  "url": "https://example.com/",
  "httpStatus": 200,
  "responseTimeMs": 184,
  "title": "Example Domain",
  "metaDescription": null,
  "h1Count": 1,
  "imageCount": 0,
  "imagesMissingAlt": 0,
  "wordCount": 21,
  "auditedAt": "2026-07-25T00:00:00.000Z"
}
```

The API still returns a report when an upstream HTML page responds with an HTTP error such as 404. `httpStatus` preserves that upstream status; the Page Pulse API response itself remains 200 because the audit completed successfully.

### Error response

```json
{
  "error": {
    "code": "NON_HTML_RESPONSE",
    "message": "The URL did not return an HTML page.",
    "hint": "The server returned application/pdf."
  }
}
```

Handled cases include malformed URLs, unsupported protocols, unreachable domains, private-network targets, unsafe redirects, timeouts, oversized pages, broken redirect chains, and non-HTML content.

## Three design decisions

### 1. Separate fetching from parsing

`fetchHtmlPage` owns network concerns and `parsePage` owns deterministic HTML extraction. This makes the parser fast to test without relying on live websites, while the fetch layer can be tested using standard `Response` objects. A failed DNS lookup cannot accidentally become a parser failure.

### 2. Treat URL fetching as a security boundary

A backend that fetches arbitrary user input can become an SSRF proxy. Page Pulse accepts only HTTP(S), rejects credentials, local hostnames, and literal private/reserved IP ranges, manually follows at most five redirects, and validates every destination. The production Worker also enables strict-public outbound fetching, so DNS-resolved private targets are stopped at the network boundary. The fetcher enforces an eight-second timeout and a 1.5 MB decoded-body limit.

### 3. Return facts before opinions

The core API reports observable values instead of inventing a single “SEO score.” The interface adds light interpretation—such as flagging multiple H1s—but labels the result as a server snapshot rather than a Lighthouse replacement. This keeps the contract useful to other clients and makes uncertainty visible.

## Parsing assumptions

- Whitespace is collapsed in titles and descriptions.
- An image counts as missing alt text when `alt` is absent or empty. In a deeper accessibility audit, an empty alt may be intentional for a decorative image.
- Word count includes Unicode letters and numbers in visible body text. Scripts, styles, templates, SVG content, iframes, and `noscript` content are excluded.
- Response time measures the audit server's fetch, not a real user's full page-render experience.
- JavaScript-rendered metadata is not executed; the report reflects server-returned HTML.

## Tests

The suite uses Node's built-in test runner through `tsx` and covers:

- Complete parsing happy path
- Missing optional metadata
- Exclusion of non-readable elements
- URL syntax and protocol failures
- Local/private/reserved targets
- Non-HTML responses
- Timeout translation
- Redirect revalidation

Run `npm test`.

## If I had another day

I would add a portable egress adapter that resolves and pins an approved IP when Page Pulse runs outside its current Worker environment. Production already has a strict-public network policy, but making that protection vendor-independent would preserve the same security boundary on any host. After that, I would add streamed progress and a small cache keyed by normalized URL.

## AI use

I used AI to pressure-test the API error model, enumerate SSRF edge cases, and accelerate the first drafts of tests and interface copy. I then changed the architecture to separate fetching from parsing, added manual redirect validation and response-size limits, rewrote the visible copy in my own voice, and verified the final behavior with the automated suite and a production build.

## Project structure

```text
app/
  api/audit/route.ts   API boundary and error responses
  page.tsx             Main page
components/
  audit-form.tsx       Interactive form and report UI
lib/
  fetch-page.ts        Defensive network layer
  parser.ts            Deterministic HTML parser
  url-safety.ts        URL and private-network checks
tests/                 Parser, fetch, and validation tests
submission/            Handoff document and Loom script
```

## Credit

The required footer credit is visible on the deployed page and links to [Digital Heroes](https://digitalheroesco.com).
