import Header from "../components/Header";
import Footer from "../components/Footer";
import { mail, book } from "../lib/site";

export const metadata = {
  title: "Services · Ali Ahmed",
  description: "How Ali Ahmed works with founders, boards, investors, and institutions — fractional product leadership, advisory, 0→1 builds, and programme delivery.",
};

const services = [
  { aud: "Founders & teams", offer: "Fractional product leadership and 0→1 builds.", items: ["Drop in as fractional product lead", "Take an idea from spec to shipped code", "AI, IoT, and web — full-stack delivery", "Set up the growth engine alongside it"], cta: "Start a conversation", subject: "Working together: product" },
  { aud: "Boards & advisory", offer: "Operator judgment without the full-time seat.", items: ["Product, technology & growth advisory", "Board-level operating reviews", "Diligence on technical bets", "Discreet, senior, hands-on"], cta: "Advisory enquiry", subject: "Advisory enquiry" },
  { aud: "Investors", offer: "Founder signal and real traction.", items: ["What I've shipped across AI & IoT", "Where I'm placing the next bet", "Operator references on request"], cta: "Investor intro", subject: "Investor introduction" },
  { aud: "Institutions", offer: "Programme delivery at scale.", items: ["Outreach & ecosystem mobilisation", "BI infrastructure & reporting", "Delivery for foundations, UN, government", "Proven: Gates, UNIDO, GIZ"], cta: "Institutional enquiry", subject: "Institutional enquiry" },
];

const process = [
  { n: "01", t: "Understand", b: "We get clear on the outcome, the constraints, and what “done” actually looks like." },
  { n: "02", t: "Spec", b: "I write the product spec, the architecture, and the plan. You see exactly what will ship." },
  { n: "03", t: "Build & ship", b: "I build it to production — secured, monitored, real users — not a prototype or a deck." },
  { n: "04", t: "Hand over", b: "Documented and maintainable, so your team can run and extend it without me." },
];

export default function Services() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ paddingBlock: "var(--s-4xl) var(--s-2xl)" }}>
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner">
            <span className="eyebrow rise">Services</span>
            <h1 className="t-xl rise-2" style={{ margin: "var(--s-md) 0", maxWidth: "16ch" }}>How I can help.</h1>
            <p className="hero__sub rise-3">One operator across product, engineering, growth, and delivery. Pick the way that fits how you want to work.</p>
          </div>
        </section>

        <section className="section section--soft" style={{ paddingTop: "var(--s-3xl)" }}>
          <div className="wrap">
            <div className="grid cols-2">
              {services.map((s) => (
                <div className="card" key={s.aud}>
                  <div className="svc">
                    <div>
                      <h3 className="svc__aud">{s.aud}</h3>
                      <p className="svc__offer">{s.offer}</p>
                    </div>
                    <ul className="svc__list">
                      {s.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                    <div className="svc__cta">
                      <a className="link" href={mail(s.subject)}>{s.cta} <span className="arr">→</span></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">How I work</span>
              <h2 className="t-lg">Spec, ship, hand over.</h2>
            </div>
            <div className="grid cols-2">
              {process.map((p) => (
                <div className="feat" key={p.n}>
                  <span className="feat__icon tnum">{p.n}</span>
                  <h3>{p.t}</h3>
                  <p>{p.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="panel-dark">
              <div className="panel-dark__glow" aria-hidden="true" />
              <span className="eyebrow">Ready when you are</span>
              <h2 style={{ marginBottom: "var(--s-lg)" }}>Tell me the outcome. I&apos;ll bring the rest.</h2>
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
