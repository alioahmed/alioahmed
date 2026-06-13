"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE, NAV, mail } from "../lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="hdr">
      <div className="hdr__bar">
        <Link className="hdr__brand" href="/" onClick={close}>
          <span className="hdr__mark" aria-hidden="true">{SITE.initials}</span>
          <span className="hdr__wordmark">
            <span className="hdr__name">{SITE.name}</span>
            <span className="hdr__role">{SITE.role}</span>
          </span>
        </Link>

        <nav className="hdr__nav" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>

        <a className="btn btn--sm hdr__cta" href={mail("Hello Ali")}>Get in touch</a>

        <button
          className={`hdr__burger ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span /><span />
        </button>
      </div>

      {open && (
        <div className="hdr__menu" role="dialog" aria-label="Menu">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={close}>{n.label}</Link>
          ))}
          <a className="btn" href={mail("Hello Ali")} onClick={close}>Get in touch →</a>
        </div>
      )}
    </header>
  );
}
