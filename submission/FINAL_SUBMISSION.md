# Digital Heroes Software Development Submission

**Applicant:** John Kothapalli  
**Role:** Software Development (SDE)  
**Project:** Page Pulse

## Submission links

- **Live application:** https://page-pulse-audit.ai-coding-challenge.chatgpt.site
- **Public GitHub repository:** https://github.com/Johnkothapalli/page-pulse-digital-heroes
- **Loom walkthrough:** https://www.loom.com/share/df720dbab89246c1be955bacbafae8af

## Task A — Page Pulse

Page Pulse is a defensive webpage-audit application. A user submits a public
URL and receives a report containing the upstream HTTP status, response time,
page title, meta description, H1 count, image alt-text gaps, total images, and
approximate readable word count.

The application includes URL validation, timeout handling, response-size
limits, redirect validation, non-HTML handling, private-network protection,
typed API errors, responsive result states, and the required Digital Heroes
footer credit.

## Task B — Proof and explanation

The repository includes automated tests for parsing, URL safety, redirects,
timeouts, and non-HTML responses. It also includes setup instructions, the API
contract, parsing assumptions, three reasoned design decisions, and an honest
self-critique in the README. The Loom video demonstrates the deployed
application, important code paths, testing strategy, and next improvements.

## AI-use disclosure

I used AI to pressure-test the API error model, enumerate SSRF edge cases, and
accelerate the first drafts of tests and interface copy. I then changed the
architecture to separate fetching from parsing, added manual redirect
validation and response-size limits, rewrote the visible copy in my own voice,
and verified the final behavior with the automated suite and a production
build.
