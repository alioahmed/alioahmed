import Link from "next/link";
import { SITE, NAV, WORK_LINKS, mail, book } from "../lib/site";
import { LinkedInIcon, GitHubIcon, MailIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__top">
          <div>
            <div className="ftr__brand">
              <span className="hdr__mark" aria-hidden="true">{SITE.initials}</span>
              <span className="hdr__name">{SITE.name}</span>
            </div>
            <p className="ftr__tag">{SITE.tagline}</p>
            <p className="ftr__tag" style={{ marginTop: "1rem", color: "var(--c-primary)" }}>{SITE.available}</p>
            <a className="btn btn--primary" href={book()} style={{ marginTop: "1.25rem" }}>Book a call</a>
          </div>

          <div className="ftr__cols">
            <div className="ftr__col">
              <h4>Site</h4>
              <Link href="/">Home</Link>
              {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
            </div>
            <div className="ftr__col">
              <h4>Work</h4>
              {WORK_LINKS.map((w) => <Link key={w.slug} href={`/work/${w.slug}`}>{w.label}</Link>)}
            </div>
            <div className="ftr__col">
              <h4>Connect</h4>
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a href={mail("Hello Ali")}>Email</a>
            </div>
          </div>
        </div>

        <div className="ftr__bottom">
          <span className="ftr__legal">© 2026 {SITE.name} · {SITE.location}</span>
          <div className="ftr__social">
            <a aria-label="LinkedIn" href={SITE.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /></a>
            <a aria-label="GitHub" href={SITE.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /></a>
            <a aria-label="Email" href={mail("Hello Ali")}><MailIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
