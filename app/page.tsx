import { AuditForm } from "@/components/audit-form";

function PulseMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M2 21h8l4-11 7 21 5-14 3 4h9" />
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

function SignalConsole() {
  return (
    <aside className="signal-console" aria-label="Page Pulse signal preview">
      <div className="signal-console__top">
        <span>Request trace</span>
        <span className="ready-pill">
          <i aria-hidden="true" />
          Ready
        </span>
      </div>

      <div className="trace-url" aria-hidden="true">
        <span>GET</span>
        <p>https://your-site.com</p>
        <i />
      </div>

      <div className="pulse-stage" aria-hidden="true">
        <div className="orbit orbit--outer" />
        <div className="orbit orbit--inner" />
        <div className="pulse-core">
          <PulseMark />
          <span />
        </div>
        <div className="signal-chip signal-chip--status">
          <i />
          HTTP status
        </div>
        <div className="signal-chip signal-chip--meta">
          <i />
          Metadata
        </div>
        <div className="signal-chip signal-chip--content">
          <i />
          Page structure
        </div>
      </div>

      <div className="signal-console__footer">
        <div>
          <span>01</span>
          <p>Response</p>
        </div>
        <div>
          <span>02</span>
          <p>Metadata</p>
        </div>
        <div>
          <span>03</span>
          <p>Content</p>
        </div>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Page Pulse home">
          <span className="brand__mark">
            <PulseMark />
          </span>
          <span>Page Pulse</span>
        </a>

        <div className="header-actions">
          <span className="header-status">
            <i aria-hidden="true" />
            Audit service online
          </span>
          <a
            className="source-link"
            href="https://github.com/Johnkothapalli/page-pulse-digital-heroes"
            target="_blank"
            rel="noreferrer"
          >
            View source
            <ArrowUpRight />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">
              <span>Fast page intelligence</span>
              <i aria-hidden="true" />
              <b>No sign-up</b>
            </p>
            <h1>
              Read the page
              <br />
              <em>behind</em> the page.
            </h1>
            <p className="hero__intro">
              See the response, structure, and metadata your server actually
              sends&mdash;before guessing at a score.
            </p>
            <div className="hero__facts" aria-label="Product facts">
              <span>
                <b>08</b> useful signals
              </span>
              <span>
                <b>00</b> data stored
              </span>
              <span>
                <b>08s</b> fetch guardrail
              </span>
            </div>
          </div>

          <SignalConsole />
        </section>

        <AuditForm />

        <section className="principles" aria-labelledby="principles-title">
          <div className="principles__intro">
            <span className="section-kicker">Product thinking</span>
            <h2 id="principles-title">
              Useful signals,
              <br />
              clearly framed.
            </h2>
          </div>

          <div className="principles__list">
            <article>
              <span>01</span>
              <div>
                <h3>Facts before scores</h3>
                <p>
                  Exact measurements stay primary, so you can make your own
                  call.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Defensive by default</h3>
                <p>
                  Timeouts, response limits, redirects, and private targets are
                  handled.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Honest about scope</h3>
                <p>
                  A focused server snapshot, not a replacement for field
                  performance data.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <p>
          Built for{" "}
          <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
            Digital Heroes Training Task
          </a>
        </p>
        <span>Designed &amp; developed by John Kothapalli / 2026</span>
      </footer>
    </div>
  );
}
