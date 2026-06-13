import Link from "next/link";
import { SITE, NAV, WORK_LINKS, mail } from "../lib/site";
import { LinkedInIcon, GitHubIcon, MailIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__top">
          <div className="ftr__lead">
            <p className="kicker kicker--ink">Let&apos;s work together</p>
            <h2 className="ftr__head">Have something you want shipped? Let&apos;s talk.</h2>
            <a className="btn btn--invert" href={mail("Hello Ali")}>Start a conversation →</a>
            <p className="ftr__avail">{SITE.available}</p>
          </div>

          <div className="ftr__cols">
            <div className="ftr__col">
              <h3>Explore</h3>
              {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
            </div>
            <div className="ftr__col">
              <h3>Work</h3>
              {WORK_LINKS.map((w) => (
                <Link key={w.slug} href={`/work/${w.slug}`}>{w.label}</Link>
              ))}
            </div>
            <div className="ftr__col">
              <h3>Connect</h3>
              <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href={SITE.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
              <a href={mail("Hello Ali")}>Email</a>
            </div>
          </div>
        </div>

        <div className="ftr__bottom">
          <div className="ftr__sig">
            <span className="ftr__name">{SITE.name}</span>
            <span className="ftr__meta">{SITE.location} · © 2026</span>
          </div>
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
