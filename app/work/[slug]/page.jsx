import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { mail } from "../../lib/site";
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

  const brand = p.tag.split(" · ")[0];

  return (
    <>
      <Header />
      <main>
        <section className="detail">
          <div className="wrap">
            <span className="ghost hero__ghost" aria-hidden="true">{brand}</span>
            <Link className="detail__back" href="/#work">← All work</Link>
            <p className="kicker">{p.tag}</p>
            <h1 className="detail__title">{p.title}</h1>
            <p className="lede detail__lede">{p.summary}</p>
            <div className="detail__meta">
              <span>{p.role}</span>
              <span>{p.period}</span>
              {p.link && (
                <a href={p.link.href} target="_blank" rel="noopener noreferrer">{p.link.label} ↗</a>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="stats__card">
              {p.stats.map((s) => (
                <div className="stat" key={s.num + s.label}>
                  <div className="stat__num">{s.num}</div>
                  <div className="stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {p.sections.map((s, idx) => (
          <section className={`section ${idx % 2 === 0 ? "section--lifted" : ""}`} key={s.heading}>
            <div className="wrap detail__block">
              <div className="sec-head"><h2>{s.heading}</h2></div>
              {s.paras && s.paras.map((para, i) => <p className="detail__p" key={i}>{para}</p>)}
              {s.bullets && (
                <ul className="detail__list">
                  {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          </section>
        ))}

        <section className="cta">
          <div className="cta__panel">
            <div className="cta__head">
              <p className="kicker kicker--ink">Want to go deeper?</p>
              <h2>Happy to walk you through this.</h2>
            </div>
            <div className="cta__primary">
              <a className="btn btn--invert" href={mail(`About ${p.title}`)}>Get in touch →</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
