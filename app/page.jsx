const EMAIL = "a.aliahmeedd1@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/alioahmed";
const GITHUB = "https://github.com/alioahmed";

const stats = [
  { num: "8+ yrs", label: "Shipping across hardware, software & AI", src: "2017 — present" },
  { num: "~1 GWh", label: "Energy monitored on Wattey in 3 months", src: "Bijli Bachao" },
  { num: "47 plants", label: "Solar fleet monitored · 2.2 MW", src: "Solar Performance Cloud" },
  { num: "10,000", label: "Women trained, Digital Literacy Programme", src: "Gates Foundation · CIRCLE" },
  { num: "70+", label: "Founders mobilised in 9 days, no budget", src: "UNIDO PAIDAR" },
];

const partners = [
  "Procter & Gamble", "Engro", "Aga Khan University Hospital", "Gates Foundation",
  "UNIDO", "GIZ", "HEC", "Cognilium", "Bijli Bachao",
];

const moat = [
  { cap: "Codes in production", proof: "Next.js, React Native, PostgreSQL, MQTT, Supabase, AWS — deployed, secured, and monitored." },
  { cap: "Designs products", proof: "Full PRDs, architecture, edge cases, UX flows, monetisation, and pricing frameworks." },
  { cap: "Closes enterprise deals", proof: "P&G, Engro, Aga Khan University Hospital, NETSOL, Sapphire, Devsinc, Arbisoft." },
  { cap: "Runs institutional programmes", proof: "Gates Foundation (10,000 women), UNIDO (EU-funded), GIZ (German federal government), HEC seed fund." },
  { cap: "Mobilises ecosystems", proof: "EWC Pakistan — 5,000+ applicants. SEE Pakistan — 1,500 startups, 81 cities, 25,000+ attendees." },
];

const paths = [
  { aud: "Clients — founders / CTOs", offer: "Fractional product leadership & 0→1 builds.", cta: "Book a 20-min intro", subject: "Fractional product leadership" },
  { aud: "Board & Advisory", offer: "Operator credibility across product, technology & growth.", cta: "Advisory enquiries", subject: "Advisory enquiry" },
  { aud: "Investors", offer: "Traction across shipped ventures, in AI and IoT.", cta: "Investor intro", subject: "Investor introduction" },
  { aud: "Institutions", offer: "Programme delivery, BI infrastructure & outreach at scale.", cta: "Institutional enquiries", subject: "Institutional enquiry" },
];

const mail = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

export default function Home() {
  return (
    <>
      {/* N6 · masthead */}
      <header className="masthead">
        <div className="masthead__issue">Product &amp; Innovation Operator · Lahore, Pakistan</div>
        <div className="wrap masthead__bar">
          <a className="masthead__name" href="#top">Ali Ahmed</a>
          <nav className="masthead__nav" aria-label="Primary">
            <a href="#work">Work</a>
            <a href="#arc">Operating history</a>
            <a href="#moat">What I do</a>
            <a href={mail("Hello")}>Contact</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* H1 · marquee hero + HP1 rail */}
        <section className="hero">
          <div className="wrap hero__grid">
            <div className="hero__rail">Product &amp; Innovation Operator</div>
            <div>
              <p className="kicker rise">Ali Ahmed</p>
              <h1 className="hero__headline rise-2">
                I build 0→1 products and institutional programmes — <span className="accent">the specs, the code, and the deals.</span>
              </h1>
              <p className="hero__sub lede rise-3">
                In one person, at production scale. Eight years shipping across hardware, software, and AI.
                Today I lead AI products at Cognilium and IoT energy platforms at Bijli Bachao.
              </p>
              <div className="hero__meta rise-3">
                <span>Lahore, PK · Worldwide</span>
                <span>Fractional · Advisory · 0→1</span>
              </div>
            </div>
          </div>
        </section>

        {/* T4 · proof stat strip */}
        <section className="stats" aria-label="Selected proof">
          <div className="wrap stats__grid">
            {stats.map((s) => (
              <div className="stat" key={s.num}>
                <div className="stat__num">{s.num}</div>
                <div className="stat__label">{s.label}</div>
                <span className="stat__src">{s.src}</span>
              </div>
            ))}
          </div>
        </section>

        {/* T2 · partners (text logo-wall) */}
        <section className="partners">
          <div className="wrap">
            <p className="kicker">Worked with &amp; delivered for</p>
            <div className="partners__list">
              {partners.map((p) => <span key={p}>{p}</span>)}
            </div>
          </div>
        </section>

        {/* F3 · the moat */}
        <section className="section" id="moat">
          <div className="wrap">
            <div className="head">
              <p className="kicker">The combination</p>
              <h2>Five capabilities most operators split across five people.</h2>
            </div>
            {moat.map((m, i) => (
              <div className="moat__row" key={m.cap}>
                <span className="moat__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="moat__cap">{m.cap}</h3>
                <p className="moat__proof">{m.proof}</p>
              </div>
            ))}
          </div>
        </section>

        {/* F1 · what I build (bento) */}
        <section className="section" id="work">
          <div className="wrap">
            <div className="head">
              <p className="kicker">Selected work</p>
              <h2>Shipped to production — not to slides.</h2>
            </div>
            <div className="bento">
              <article className="tile span-3">
                <span className="tile__eyebrow">Bijli Bachao · IoT energy</span>
                <h3 className="tile__title">Three production energy platforms</h3>
                <p className="tile__body">Wattey (real-time IoT electricity monitoring), Solar Performance Cloud (multi-brand solar diagnostics), and Ready Billing (photo-verified OCR billing) — built across Pakistan's commercial energy lifecycle.</p>
                <span className="tile__flag">~1 GWh · 47 plants · OCR 50→95%</span>
              </article>
              <article className="tile span-3">
                <span className="tile__eyebrow">Cognilium AI · product lead</span>
                <h3 className="tile__title">Five AI products + the company site</h3>
                <p className="tile__body">AI Product Manager for VectorHire, VORTA, ProspectVox, Paralegent AI and ProProspect; built cognilium.ai end-to-end (76 pages, Sanity, Vercel) with a 34-script SEO/GEO engine.</p>
                <span className="tile__flag">5 products shipped</span>
              </article>
              <article className="tile span-2">
                <span className="tile__eyebrow">Paralegent AI</span>
                <h3 className="tile__title">Agentic contract review</h3>
                <p className="tile__body">18+ AI agents review contracts against a customer's own playbook and return GREEN/ORANGE/RED redlines inside Microsoft Word — deployed in the customer's own cloud.</p>
                <span className="tile__flag">Paying clients under NDA</span>
              </article>
              <article className="tile span-2">
                <span className="tile__eyebrow">Build Buy Software</span>
                <h3 className="tile__title">Independent legal-tech directory</h3>
                <p className="tile__body">420 products scored by a published, sponsorship-proof formula; ~2,000 statically rendered pages where every article figure is computed from the database.</p>
                <span className="tile__flag">Pre-launch</span>
              </article>
              <article className="tile span-2">
                <span className="tile__eyebrow">Wonder Women · co-founder</span>
                <h3 className="tile__title">FemTech, hardware to health</h3>
                <p className="tile__body">Pakistan's first locally-assembled IoT sanitary-napkin vending machine. Closed P&amp;G, Engro and Aga Khan University Hospital; PKR 3.7M revenue in 12 months.</p>
                <span className="tile__flag">2022–2024</span>
              </article>
            </div>
          </div>
        </section>

        {/* F4 · the arc */}
        <section className="section" id="arc">
          <div className="wrap">
            <div className="head">
              <p className="kicker">Operating history</p>
              <h2>How the operator was built.</h2>
            </div>
            <div className="arc__step">
              <span className="arc__num">1.0</span>
              <div>
                <h3 className="arc__title">The polymath freelancer</h3>
                <p className="arc__body">2017–2021. Freelance developer, community manager, corporate trainer (Philip Morris International, Trimegah Sekuritas Indonesia), and product coordinator across Pakistan and Sweden — the whole stack of building a technology company, learned in parallel.</p>
              </div>
            </div>
            <div className="arc__step">
              <span className="arc__num">2.0</span>
              <div>
                <h3 className="arc__title">The national-scale operator</h3>
                <p className="arc__body">2021–2024. Ran EWC Pakistan and SEE Pakistan — the country's largest startup competitions. Managed the Gates Foundation's Digital Literacy Programme for 10,000 women. Co-founded Wonder Women, closed P&amp;G / Engro / AKU, and won the HEC Innovator Seed Fund.</p>
              </div>
            </div>
            <div className="arc__step">
              <span className="arc__num">3.0</span>
              <div>
                <h3 className="arc__title">The production builder</h3>
                <p className="arc__body">2024–now. Leads AI product at Cognilium (US/UAE clients). Built three production platforms at Bijli Bachao. Ran UNIDO PAIDAR's outreach across two cities in nine days. Launched Build Buy Software.</p>
              </div>
            </div>
          </div>
        </section>

        {/* principles */}
        <section className="section">
          <div className="wrap">
            <div className="head">
              <p className="kicker">How I work</p>
              <h2>Three rules, held without exception.</h2>
            </div>
            <div className="principles">
              <div className="principle">
                <h3>Numbers first</h3>
                <p>Open with the metric, not the adjective. If a claim can't be verified, it doesn't ship.</p>
              </div>
              <div className="principle">
                <h3>Production, not slides</h3>
                <p>The work runs live — deployed, secured, monitored — not in a deck or a prototype.</p>
              </div>
              <div className="principle">
                <h3>One operator, whole system</h3>
                <p>Spec, build, close, and deliver under one person. Fewer handoffs, less lost in translation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA · work with me */}
        <section className="cta section" id="contact">
          <div className="wrap">
            <p className="kicker">Work with me</p>
            <h2>Tell me the outcome. I&apos;ll bring the specs, the code, and the deal.</h2>
            <div className="cta__paths">
              {paths.map((p) => (
                <div className="path" key={p.aud}>
                  <div className="path__aud">{p.aud}</div>
                  <div className="path__offer">{p.offer}</div>
                  <a href={mail(p.subject)}>{p.cta} →</a>
                </div>
              ))}
            </div>
            <div className="cta__primary">
              <a className="btn" href={mail("20-minute intro")}>Book a 20-min intro →</a>
            </div>
          </div>
        </section>
      </main>

      {/* Ft1 · footer */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__bar">
            <div>
              <div className="footer__name">Ali Ahmed</div>
              <div className="footer__tag">Product &amp; innovation operator. Lahore, Pakistan.</div>
            </div>
            <nav className="footer__links" aria-label="Footer">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={mail("Hello")}>Email</a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
            </nav>
          </div>
          <p className="footer__meta">The specs, the code, and the deals — in one person, at production scale. © 2026 Ali Ahmed.</p>
        </div>
      </footer>
    </>
  );
}
