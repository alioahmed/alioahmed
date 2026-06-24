import Header from "../components/Header";
import Footer from "../components/Footer";
import { SITE, mail, book } from "../lib/site";
import { CalIcon, MailIcon, LinkedInIcon } from "../components/icons";
import ProfileCard from "../components/ProfileCard";

export const metadata = {
  title: "Contact · Ali Ahmed",
  description: "Book a call, email, or connect on LinkedIn with Ali Ahmed — product & innovation operator.",
};

const methods = [
  { icon: <CalIcon />, label: "Book a call", val: "A 30-minute intro", href: book(), ext: true },
  { icon: <MailIcon />, label: "Email", val: SITE.email, href: mail("Hello Ali"), ext: false },
  { icon: <LinkedInIcon />, label: "LinkedIn", val: "in/alioahmed", href: SITE.linkedin, ext: true },
];

export default function Contact() {
  return (
    <>
      <Header />
      <main>
        <section className="hero" style={{ paddingBlock: "var(--s-4xl) var(--s-2xl)" }}>
          <div className="mesh" aria-hidden="true" />
          <div className="wrap hero__inner">
            <span className="eyebrow rise">Contact</span>
            <h1 className="t-xl rise-2" style={{ margin: "var(--s-md) 0" }}>Let&apos;s talk.</h1>
            <p className="hero__sub rise-3">
              Whether it&apos;s a product to build, an advisory seat, or a programme to run, the fastest path is a short
              call or an email. I read everything that comes in.
            </p>
          </div>
        </section>

        <section className="section section--soft" style={{ paddingTop: "var(--s-3xl)" }}>
          <div className="wrap">
            <div className="contact__grid">
              <div className="contact__methods">
                {methods.map((m) => (
                  <a
                    className="contact__method"
                    key={m.label}
                    href={m.href}
                    target={m.ext ? "_blank" : undefined}
                    rel={m.ext ? "noopener noreferrer" : undefined}
                  >
                    <span className="contact__icon">{m.icon}</span>
                    <span>
                      <span className="contact__label">{m.label}</span><br />
                      <span className="contact__val">{m.val}</span>
                    </span>
                  </a>
                ))}

                <div className="card">
                  <span className="tag">Good to know</span>
                  <h3 className="t-md" style={{ margin: "var(--s-lg) 0" }}>What to expect</h3>
                  <ul className="svc__list">
                    <li>Based in {SITE.location}; work with teams worldwide.</li>
                    <li>{SITE.available}.</li>
                    <li>A line on the outcome you want is enough to start — I&apos;ll come back with how I&apos;d approach it.</li>
                    <li>For diligence or advisory, references available on request.</li>
                  </ul>
                  <div style={{ marginTop: "var(--s-xl)" }}>
                    <a className="btn btn--primary" href={book()}>Book a call</a>
                  </div>
                </div>
              </div>

              <ProfileCard />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
