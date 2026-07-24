import { AuditForm } from "@/components/audit-form";

function PulseMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40">
      <path d="M2 21h8l4-11 7 21 5-14 3 4h9" />
    </svg>
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
        <div className="header-status">
          <i aria-hidden="true" />
          Live audit service
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">
              <span>Fast page intelligence</span>
              <i aria-hidden="true" />
            </p>
            <h1>
              Read the page
              <br />
              <em>behind</em> the page.
            </h1>
            <p className="hero__intro">
              One URL. Eight useful signals. No account, no dashboard theatre—
              just a clean snapshot of what your page returns.
            </p>
          </div>

          <aside className="hero__aside" aria-label="Audit coverage">
            <span className="aside-number">08</span>
            <p>signals checked</p>
            <ul>
              <li>
                <span>
                  <i>01</i> Server
                </span>
                <b>status + speed</b>
              </li>
              <li>
                <span>
                  <i>02</i> Search
                </span>
                <b>title + description</b>
              </li>
              <li>
                <span>
                  <i>03</i> Structure
                </span>
                <b>H1 + words + images</b>
              </li>
            </ul>
          </aside>
        </section>

        <AuditForm />

        <section className="principles" aria-label="Product principles">
          <article>
            <span>01</span>
            <div>
              <h2>Small by design</h2>
              <p>The report answers a focused question instead of burying it.</p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h2>Defensive by default</h2>
              <p>Timeouts, content limits, and private targets are handled.</p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h2>Honest about scope</h2>
              <p>A fast server snapshot—not a substitute for field data.</p>
            </div>
          </article>
        </section>
      </main>

      <footer>
        <p>
          Built for{" "}
          <a href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
            Digital Heroes Training Task
          </a>
        </p>
        <span>Page Pulse / 2026</span>
      </footer>
    </div>
  );
}
