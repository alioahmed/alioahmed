import Link from "next/link";
import { notFound } from "next/navigation";
import { work, order } from "../work-data";

const EMAIL = "a.aliahmeedd1@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/alioahmed";
const GITHUB = "https://github.com/alioahmed";
const mail = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

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
      <header className="navwrap">
        <nav className="nav" aria-label="Primary">
          <Link className="nav__brand" href="/">Ali Ahmed</Link>
          <div className="nav__links">
            <Link href="/#do">What I do</Link>
            <Link href="/#work">Work</Link>
            <Link href="/#about">About</Link>
          </div>
          <a className="btn btn--sm" href={mail("Hello Ali")}>Get in touch →</a>
        </nav>
      </header>

      <main>
        <section className="hero detail">
          <div className="wrap">
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

        {p.sections.map((s) => (
          <section className="section" key={s.heading}>
            <div className="wrap detail__block">
              <div className="head"><h2>{s.heading}</h2></div>
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
            <p className="kicker">Want to go deeper?</p>
            <h2>Happy to walk you through this.</h2>
            <div className="cta__primary">
              <a className="btn btn--invert" href={mail(`About ${p.title}`)}>Get in touch →</a>
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
