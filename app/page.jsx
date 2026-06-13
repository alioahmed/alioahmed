import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WorkCard from "./components/WorkCard";
import { mail, book } from "./lib/site";
import { work } from "./work/work-data";

const stats = [
  { num: "8+", label: "Years across hardware, software & AI" },
  { num: "~1 GWh", label: "Energy monitored on Wattey" },
  { num: "47", label: "Solar plants monitored · 2.2 MW" },
  { num: "10,000", label: "Women trained (Gates Foundation)" },
];

const partners = ["Procter & Gamble", "Engro", "Aga Khan", "Gates Foundation", "UNIDO", "GIZ", "HEC"];

const whatIDo = [
  { icon: "01", title: "Build the product", body: "Design and ship digital products end to end: specs, architecture, code, deployment. AI tools, IoT platforms, web apps." },
  { icon: "02", title: "Run the programmes", body: "Run institutional programmes and startup ecosystems at scale, for the Gates Foundation, UNIDO, and Pakistan's largest competitions." },
  { icon: "03", title: "Close the deals", body: "Open doors and close enterprise partnerships: Procter & Gamble, Engro, and Aga Khan University Hospital among them." },
];

const featured = ["bijli-bachao", "cognilium", "paralegent"];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* hero */}
        <section className="hero">
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner">
            <span className="eyebrow rise">Product &amp; Innovation Operator</span>
            <h1 className="rise-2">I build and ship digital products, <span className="accent">end to end.</span></h1>
            <p className="hero__sub rise-3">
              I&apos;m Ali, a product and innovation operator in Lahore. For eight years I&apos;ve helped founders,
              companies, and institutions turn ideas into something real and running: writing the specs, building
              the software, closing the deals, and running delivery.
            </p>
            <div className="hero__actions rise-3">
              <a className="btn btn--primary" href={book()}>Book a call</a>
              <Link className="btn btn--secondary" href="/work">See my work</Link>
            </div>
            <div className="hero__meta rise-3">
              <span>Lahore, PK · Worldwide</span>
              <span className="dot" aria-hidden="true" />
              <span>Fractional · Advisory · 0→1 builds</span>
            </div>
          </div>
        </section>

        {/* proof stats */}
        <section className="section section--soft">
          <div className="wrap">
            <div className="stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="stat__num tnum">{s.num}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* trust line */}
        <section className="section" style={{ paddingBlock: "var(--s-3xl)" }}>
          <div className="wrap">
            <span className="eyebrow">Worked with &amp; delivered for</span>
            <div className="logos__row">
              {partners.map((p, i) => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: "var(--s-xl)" }}>
                  {i > 0 && <span className="logos__sep" aria-hidden="true" />}
                  <span>{p}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* what I do */}
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">What I do</span>
              <h2 className="t-lg">The specs, the code, and the deals, in one person.</h2>
            </div>
            <div className="grid cols-3">
              {whatIDo.map((w) => (
                <div className="feat" key={w.title}>
                  <span className="feat__icon tnum">{w.icon}</span>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* featured work */}
        <section className="section section--soft">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Selected work</span>
              <h2 className="t-lg">Proof, not promises.</h2>
              <p>A few things I&apos;ve built and shipped. Open any for the full story and the numbers.</p>
            </div>
            <div className="grid cols-3">
              {featured.map((slug) => <WorkCard key={slug} slug={slug} p={work[slug]} />)}
            </div>
            <div style={{ marginTop: "var(--s-2xl)" }}>
              <Link className="link" href="/work">View all work <span className="arr">→</span></Link>
            </div>
          </div>
        </section>

        {/* about teaser */}
        <section className="section">
          <div className="wrap grid cols-2" style={{ alignItems: "center" }}>
            <div>
              <span className="eyebrow">About</span>
              <h2 className="t-lg" style={{ marginBottom: "var(--s-lg)" }}>From freelance code to national-scale programmes.</h2>
              <p className="lede">
                Eight years across three chapters: the polymath freelancer, the national-scale operator, and the
                production builder. Today I lead AI products at Cognilium and IoT energy platforms at Bijli Bachao.
              </p>
              <div style={{ marginTop: "var(--s-xl)" }}>
                <Link className="link" href="/about">Read my story <span className="arr">→</span></Link>
              </div>
            </div>
            <div className="card">
              <span className="tag">In numbers</span>
              <ul className="awards" style={{ marginTop: "var(--s-lg)" }}>
                <li><span>Enterprise partners closed</span><span className="tnum">P&amp;G · Engro · AKU</span></li>
                <li><span>Institutional programmes</span><span className="tnum">Gates · UNIDO · GIZ</span></li>
                <li><span>Products shipped</span><span className="tnum">10+</span></li>
                <li><span>HEC Innovator Seed Fund</span><span className="tnum">USD 35K</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="wrap">
            <div className="panel-dark">
              <div className="panel-dark__glow" aria-hidden="true" />
              <span className="eyebrow">Work with me</span>
              <h2 style={{ marginBottom: "var(--s-lg)" }}>Tell me the outcome. I&apos;ll bring the rest.</h2>
              <p style={{ maxWidth: "48ch", marginBottom: "var(--s-2xl)" }}>
                Fractional product leadership, advisory, 0→1 builds, or programme delivery. Pick the way that fits.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-md)" }}>
                <a className="btn btn--ondark" href={book()}>Book a call</a>
                <a className="btn btn--secondary" href={mail("Hello Ali")} style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Email me</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
