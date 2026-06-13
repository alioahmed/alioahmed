import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { mail, book, SITE } from "../lib/site";

export const metadata = {
  title: "About · Ali Ahmed",
  description: "Eight years across AI, IoT, and national-scale programmes — the operator who writes the specs, closes the deals, and ships the code.",
};

const arc = [
  { yr: "2017–21", title: "The polymath start", body: "Freelance developer, community manager, corporate trainer (Philip Morris, Trimegah), and product coordinator across Pakistan and Sweden. I learned the whole stack of building a company in parallel, not in sequence." },
  { yr: "2021–24", title: "National-scale operator", body: "Ran EWC Pakistan and SEE Pakistan, the country's largest startup competitions. Managed the Gates Foundation's Digital Literacy Programme for 10,000 women. Co-founded Wonder Women and closed Procter & Gamble, Engro and Aga Khan University Hospital." },
  { yr: "2024–now", title: "Production builder", body: "I lead AI product at Cognilium, built three production platforms at Bijli Bachao, ran UNIDO PAIDAR's outreach across two cities in nine days, and launched Build Buy Software." },
];

const skills = [
  { h: "Product & engineering", items: ["Product strategy, PRDs & roadmaps", "Next.js · React · React Native", "PostgreSQL · Supabase · MQTT · AWS", "IoT & data platforms", "AI / LLM products — LangGraph, RAG, agents"] },
  { h: "Growth & go-to-market", items: ["Positioning & messaging", "SEO / GEO (AI-citation) engineering", "Cold-email & outbound systems", "Enterprise sales & partnerships", "Pricing & packaging"] },
  { h: "Programmes & operations", items: ["Institutional programme delivery", "Ecosystem mobilisation at national scale", "BI & reporting (Power BI)", "HR, ops & compliance", "Stakeholder management"] },
];

const awards = [
  { a: "HEC Innovator Seed Fund — USD 35,000", y: "1 of 15 from 186 · 2022" },
  { a: "Falling Walls Lab", y: "Pakistan winner" },
  { a: "Entrepreneurship World Cup — Top 100 global", y: "2021" },
  { a: "Bahria Innovation Challenge", y: "1st place" },
  { a: "SheLovesTech", y: "Regional winner" },
];

const partners = ["Procter & Gamble", "Engro", "Aga Khan University Hospital", "Gates Foundation", "UNIDO", "GIZ", "HEC", "Cognilium", "Bijli Bachao"];

export default function About() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ paddingBlock: "var(--s-4xl) var(--s-3xl)" }}>
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner" style={{ maxWidth: "var(--page-max)" }}>
            <div className="grid cols-2" style={{ alignItems: "center" }}>
              <div>
                <span className="eyebrow rise">About</span>
                <h1 className="t-xl rise-2" style={{ margin: "var(--s-md) 0", maxWidth: "14ch" }}>The operator behind the work.</h1>
                <p className="hero__sub rise-3">
                  I&apos;m Ali Ahmed, a product and innovation operator. I write the specs, close the deals, and ship the
                  code, in one person, at production scale. Built Pakistan&apos;s first IoT sanitary-napkin vending machine,
                  ran the Gates Foundation&apos;s programme for 10,000 women, and today lead AI products at Cognilium and
                  IoT energy platforms at Bijli Bachao.
                </p>
              </div>
              <div style={{ display: "grid", placeItems: "center" }}>
                <div aria-hidden="true" style={{ width: "clamp(7rem, 20vw, 12rem)", height: "clamp(7rem, 20vw, 12rem)", borderRadius: "50%", background: "linear-gradient(135deg, var(--c-primary-soft), var(--mesh-ruby))", color: "#fff", display: "grid", placeItems: "center", fontSize: "clamp(2.5rem, 8vw, 4rem)", fontWeight: 300, letterSpacing: "-0.03em", boxShadow: "var(--sh-2)" }}>AA</div>
              </div>
            </div>
          </div>
        </section>

        {/* story */}
        <section className="section section--soft">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">The story</span>
              <h2 className="t-lg">Three chapters, one through-line.</h2>
            </div>
            <div>
              {arc.map((a) => (
                <div className="tl__step" key={a.yr}>
                  <span className="tl__yr tnum">{a.yr}</span>
                  <div>
                    <h3 className="tl__title">{a.title}</h3>
                    <p className="tl__body">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* skills */}
        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Capabilities</span>
              <h2 className="t-lg">What I can actually do.</h2>
            </div>
            <div className="skills">
              {skills.map((s) => (
                <div key={s.h}>
                  <h3>{s.h}</h3>
                  <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* recognition */}
        <section className="section section--soft">
          <div className="wrap grid cols-2" style={{ alignItems: "start" }}>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Recognition</span>
              <h2 className="t-lg">Awards &amp; grants.</h2>
              <p>Backed by institutions that fund serious work, not slideware.</p>
            </div>
            <ul className="awards">
              {awards.map((aw) => (
                <li key={aw.a}><span>{aw.a}</span><span className="tnum">{aw.y}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* partners */}
        <section className="section">
          <div className="wrap">
            <span className="eyebrow">Worked with &amp; delivered for</span>
            <div className="logos__row" style={{ marginTop: "var(--s-lg)" }}>
              {partners.map((p, i) => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: "var(--s-xl)" }}>
                  {i > 0 && <span className="logos__sep" aria-hidden="true" />}
                  <span>{p}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="wrap">
            <div className="panel-dark">
              <div className="panel-dark__glow" aria-hidden="true" />
              <h2 style={{ marginBottom: "var(--s-lg)" }}>Let&apos;s build something that ships.</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-md)" }}>
                <a className="btn btn--ondark" href={book()}>Book a call</a>
                <Link className="btn btn--secondary" href="/work" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>See the work</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
