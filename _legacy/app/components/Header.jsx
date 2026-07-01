"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE, NAV, book } from "../lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="hdr">
      <div className="hdr__inner">
        <Link className="hdr__brand" href="/" onClick={close}>
          <span className="hdr__mark" aria-hidden="true">{SITE.initials}</span>
          <span className="hdr__name">{SITE.name}</span>
        </Link>

        <nav className="hdr__nav" aria-label="Primary">
          {NAV.map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        </nav>

        <div className="hdr__actions">
          <Link className="hdr__signin" href="/contact">Contact</Link>
          <a className="btn btn--primary btn--sm" href={book()}>Book a call</a>
        </div>

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
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={close}>{n.label}</Link>)}
          <a className="btn btn--primary" href={book()} onClick={close}>Book a call</a>
        </div>
      )}
    </header>
  );
}
