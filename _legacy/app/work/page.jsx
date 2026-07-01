import Header from "../components/Header";
import Footer from "../components/Footer";
import WorkCard from "../components/WorkCard";
import { mail, book } from "../lib/site";
import { work, order } from "./work-data";

export const metadata = {
  title: "Work · Ali Ahmed",
  description: "Selected products, platforms, and ventures Ali Ahmed has built and shipped.",
};

export default function WorkIndex() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ paddingBlock: "var(--s-4xl) var(--s-2xl)" }}>
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner">
            <span className="eyebrow rise">Work</span>
            <h1 className="t-xl rise-2" style={{ margin: "var(--s-md) 0" }}>Things I&apos;ve built and shipped.</h1>
            <p className="hero__sub rise-3">
              Production software, AI products, and ventures, built solo or as product lead. Open any for the full
              story, the numbers, and how it was made.
            </p>
          </div>
        </section>

        <section className="section section--soft" style={{ paddingTop: "var(--s-3xl)" }}>
          <div className="wrap">
            <div className="grid cols-2">
              {order.map((slug) => <WorkCard key={slug} slug={slug} p={work[slug]} />)}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="panel-dark">
              <div className="panel-dark__glow" aria-hidden="true" />
              <h2 style={{ marginBottom: "var(--s-lg)" }}>Want something like this built?</h2>
              <p style={{ maxWidth: "44ch", marginBottom: "var(--s-2xl)" }}>I take ideas to shipped products, end to end. Let&apos;s talk about yours.</p>
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
