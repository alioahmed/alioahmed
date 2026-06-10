import Link from "next/link";

const EMAIL = "a.aliahmeedd1@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/alioahmed";
const GITHUB = "https://github.com/alioahmed";
const mail = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

const building = ["Cognilium AI", "Paralegent AI", "Bijli Bachao", "Build Buy Software"];
const clients = [
  "Procter & Gamble", "Engro", "Aga Khan University Hospital",
  "Gates Foundation", "UNIDO", "GIZ", "HEC",
];

const whatIDo = [
  { title: "Build the product", body: "I design and ship digital products end to end: the specs, the architecture, the code, the deployment. AI tools, IoT platforms, and web apps." },
  { title: "Run the programmes", body: "I run institutional programmes and startup ecosystems at scale, for the Gates Foundation, UNIDO, and Pakistan's largest startup competitions." },
  { title: "Close the deals", body: "I open doors and close enterprise partnerships: Procter & Gamble, Engro, and Aga Khan University Hospital among them." },
];

const work = [
  { slug: "bijli-bachao", tag: "Bijli Bachao · IoT energy", span: "span-3", title: "Three production energy platforms", body: "Wattey (real-time IoT electricity monitoring), Solar Performance Cloud (multi-brand solar diagnostics), and Ready Billing (photo-verified OCR billing).", flag: "~1 GWh · 47 plants · OCR 50→95%" },
  { slug: "cognilium", tag: "Cognilium AI · product lead", span: "span-3", title: "Five AI products + the company site", body: "Product lead for VectorHire, VORTA, ProspectVox, Paralegent AI and ProProspect; built cognilium.ai end to end (76 pages, Sanity, Vercel).", flag: "5 products shipped" },
  { slug: "paralegent", tag: "Paralegent AI", span: "span-2", title: "Agentic contract review", body: "18+ AI agents review contracts against a customer's own playbook and return redlines inside Microsoft Word, deployed in the customer's own cloud.", flag: "Paying clients under NDA" },
  { slug: "build-buy-software", tag: "Build Buy Software", span: "span-2", title: "Independent legal-tech directory", body: "420 products scored by a published, sponsorship-proof formula; ~2,000 pages where every figure is computed from the database.", flag: "Pre-launch" },
  { slug: "wonder-women", tag: "Wonder Women · co-founder", span: "span-2", title: "FemTech, hardware to health", body: "Pakistan's first locally-assembled IoT sanitary-napkin vending machine. Closed P&G, Engro and Aga Khan University Hospital; PKR 3.7M in 12 months.", flag: "2022–2024" },
];

const arc = [
  { n: "1.0", title: "The polymath start", body: "2017–2021. Freelance developer, community manager, corporate trainer (Philip Morris, Trimegah), and product coordinator across Pakistan and Sweden. I learned the whole stack of building a company in parallel, not in sequence." },
  { n: "2.0", title: "National-scale operator", body: "2021–2024. Ran EWC Pakistan and SEE Pakistan, the country's largest startup competitions. Managed the Gates Foundation's Digital Literacy Programme for 10,000 women. Co-founded Wonder Women and closed P&G, Engro and AKU." },
  { n: "3.0", title: "Production builder", body: "2024–now. I lead AI product at Cognilium, built three production platforms at Bijli Bachao, ran UNIDO PAIDAR's outreach across two cities in nine days, and launched Build Buy Software." },
];

const stats = [
  { num: "8+ yrs", label: "Across hardware, software & AI" },
  { num: "~1 GWh", label: "Energy monitored on Wattey" },
  { num: "47 plants", label: "Solar fleet · 2.2 MW" },
  { num: "10,000", label: "Women trained (Gates Foundation)" },
  { num: "70+", label: "Founders mobilised in 9 days" },
];

const paths = [
  { aud: "Founders & teams", offer: "Drop me into your product, from strategy through shipped code, or build a new one from zero.", cta: "Start a conversation", subject: "Working together: product" },
  { aud: "Boards & advisory", offer: "Operator judgment on product, technology and growth, without the full-time seat.", cta: "Advisory enquiry", subject: "Advisory enquiry" },
  { aud: "Investors", offer: "A look at what I've shipped across AI and IoT, and where I'm placing the next bet.", cta: "Get in touch", subject: "Investor introduction" },
  { aud: "Institutions", offer: "Outreach, BI infrastructure and delivery for foundations, UN and government programmes.", cta: "Institutional enquiry", subject: "Institutional enquiry" },
];

export default function Home() {
  return (
    <>
      <header className="navwrap">
        <nav className="nav" aria-label="Primary">
          <a className="nav__brand" href="#top">Ali Ahmed</a>
          <div className="nav__links">
            <a href="#do">What I do</a>
            <a href="#work">Work</a>
            <a href="#about">About</a>
          </div>
          <a className="btn btn--sm" href={mail("Hello Ali")}>Get in touch →</a>
        </nav>
      </header>

      <main>
        {/* hero: the 2-second answer */}
        <section className="hero" id="top">
          <div className="wrap">
            <p className="kicker hero__eyebrow rise">Ali Ahmed · Product &amp; Innovation Operator</p>
            <h1 className="rise-2">I build and ship digital products, <span className="accent">end to end.</span></h1>
            <p className="hero__sub lede rise-3">
              I&apos;m Ali, a product and innovation operator in Lahore. For eight years I&apos;ve helped founders,
              companies, and institutions turn ideas into something real and running: writing the specs, building
              the software, closing the deals, and running delivery. Today I lead AI products at Cognilium and IoT
              energy platforms at Bijli Bachao.
            </p>
            <div className="hero__actions rise-3">
              <a className="btn" href={mail("Hello Ali")}>Get in touch →</a>
              <a className="btn btn--outline" href="#do">See what I do</a>
            </div>
          </div>
        </section>

        {/* trust grid: ventures + clients */}
        <section className="logos">
          <div className="wrap">
            <div className="logos__group">
              <p className="kicker">Building with</p>
              <div className="logos__grid is-4">
                {building.map((b) => <div className="logo" key={b}>{b}</div>)}
              </div>
            </div>
            <div className="logos__group">
              <p className="kicker">Delivered for</p>
              <div className="logos__grid is-7">
                {clients.map((c) => <div className="logo" key={c}>{c}</div>)}
              </div>
            </div>
          </div>
        </section>

        {/* what I do: plain */}
        <section className="section" id="do">
          <div className="wrap">
            <div className="head">
              <p className="kicker">What I do</p>
              <h2>The specs, the code, and the deals, in one person.</h2>
            </div>
            <div className="principles">
              {whatIDo.map((w) => (
                <div className="principle" key={w.title}>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* what I've built */}
        <section className="section" id="work">
          <div className="wrap">
            <div className="head">
              <p className="kicker">Selected work</p>
              <h2>A few things I&apos;ve built and shipped.</h2>
            </div>
            <div className="bento">
              {work.map((t) => (
                <Link className={`tile ${t.span}`} key={t.slug} href={`/work/${t.slug}`}>
                  <span className="tile__eyebrow">{t.tag}</span>
                  <h3 className="tile__title">{t.title}</h3>
                  <p className="tile__body">{t.body}</p>
                  <div className="tile__foot">
                    <span className="tile__flag">{t.flag}</span>
                    <span className="tile__more">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* about: the story + quiet proof */}
        <section className="section" id="about">
          <div className="wrap">
            <div className="head">
              <p className="kicker">A bit about me</p>
              <h2>How I got here.</h2>
            </div>
            {arc.map((a) => (
              <div className="arc__step" key={a.n}>
                <span className="arc__num">{a.n}</span>
                <div>
                  <h3 className="arc__title">{a.title}</h3>
                  <p className="arc__body">{a.body}</p>
                </div>
              </div>
            ))}
            <div className="about__stats">
              <div className="stats__card">
                {stats.map((s) => (
                  <div className="stat" key={s.num}>
                    <div className="stat__num">{s.num}</div>
                    <div className="stat__label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* how I can help: by who you are */}
        <section className="cta" id="contact">
          <div className="cta__panel">
            <p className="kicker">How I can help</p>
            <h2>Tell me the outcome. I&apos;ll bring the rest.</h2>
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
              <a className="btn btn--invert" href={mail("Hello Ali")}>Email me directly →</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          <h2 className="footer__lead">Let&apos;s build something that ships.</h2>
          <div className="footer__bar">
            <div>
              <div className="footer__name">Ali Ahmed</div>
              <div className="footer__tag">Product &amp; innovation operator. Lahore, Pakistan.</div>
            </div>
            <nav className="footer__links" aria-label="Footer">
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={mail("Hello Ali")}>Email</a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            </nav>
          </div>
          <p className="footer__meta">© 2026 Ali Ahmed · The specs, the code, and the deals, in one person.</p>
        </div>
      </footer>
    </>
  );
}
