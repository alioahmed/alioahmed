import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { mail, book } from "../../lib/site";
import { work, order } from "../work-data";

export function generateStaticParams() {
  return order.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = work[slug];
  if (!p) return {};
  return { title: `${p.title} · Ali Ahmed`, description: p.summary };
}

export default async function WorkDetail({ params }) {
  const { slug } = await params;
  const p = work[slug];
  if (!p) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ paddingBlock: "var(--s-4xl) var(--s-2xl)" }}>
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner" style={{ maxWidth: "56rem" }}>
            <Link className="back" href="/work">← All work</Link>
            <span className="eyebrow" style={{ display: "block" }}>{p.tag}</span>
            <h1 className="t-xl" style={{ margin: "var(--s-md) 0" }}>{p.title}</h1>
            <p className="hero__sub">{p.summary}</p>
            <div className="detail__meta">
              <span>{p.role}</span>
              <span>{p.period}</span>
              {p.link && <a href={p.link.href} target="_blank" rel="noopener noreferrer">{p.link.label} ↗</a>}
            </div>
          </div>
        </section>

        <section className="section section--soft" style={{ paddingBlock: "var(--s-3xl)" }}>
          <div className="wrap">
            <div className="stats">
              {p.stats.map((s) => (
                <div key={s.num + s.label}>
                  <div className="stat__num tnum">{s.num}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {p.sections.map((s, i) => (
          <section className={`section ${i % 2 === 1 ? "section--soft" : ""}`} key={s.heading}>
            <div className="wrap detail__block">
              <h2 className="t-md">{s.heading}</h2>
              {s.paras && s.paras.map((para, k) => <p className="detail__p" key={k}>{para}</p>)}
              {s.bullets && (
                <ul className="detail__list">
                  {s.bullets.map((b, k) => <li key={k}>{b}</li>)}
                </ul>
              )}
            </div>
          </section>
        ))}

        <section className="section">
          <div className="wrap">
            <div className="panel-dark">
              <div className="panel-dark__glow" aria-hidden="true" />
              <span className="eyebrow">Want to go deeper?</span>
              <h2 style={{ marginBottom: "var(--s-lg)" }}>Happy to walk you through this.</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-md)" }}>
                <a className="btn btn--ondark" href={book()}>Book a call</a>
                <a className="btn btn--secondary" href={mail(`About ${p.title}`)} style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>Email me</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
