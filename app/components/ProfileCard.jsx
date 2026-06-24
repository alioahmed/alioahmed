import { SITE, mail, book } from "../lib/site";
import { XIcon, LinkedInIcon, BlueskyIcon, GitHubIcon, MailIcon } from "./icons";

// Native, on-brand version of the Gravatar profile card.
// Content is the locked identity; social links are the entity "sameAs" set.
export default function ProfileCard() {
  return (
    <aside className="pcard" aria-label="Ali Ahmed — profile card">
      <a className="pcard__avatar-link" href={SITE.gravatar} target="_blank" rel="noopener noreferrer">
        <img className="pcard__avatar" src="/ali-ahmed.jpeg" width="96" height="96" alt={SITE.name} />
      </a>
      <h3 className="pcard__name">{SITE.name}</h3>
      <p className="pcard__role">{SITE.headline}</p>
      <p className="pcard__loc">{SITE.location}</p>
      <p className="pcard__bio">{SITE.bio}</p>

      <div className="pcard__socials">
        <a className="pcard__social" aria-label="X" href={SITE.x} target="_blank" rel="noopener noreferrer"><XIcon /></a>
        <a className="pcard__social" aria-label="LinkedIn" href={SITE.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /></a>
        <a className="pcard__social" aria-label="Bluesky" href={SITE.bluesky} target="_blank" rel="noopener noreferrer"><BlueskyIcon /></a>
        <a className="pcard__social" aria-label="GitHub" href={SITE.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /></a>
        <a className="pcard__social" aria-label="Email" href={mail("Hello Ali")}><MailIcon /></a>
      </div>

      <div className="pcard__cta">
        <a className="btn btn--primary" href={book()} target="_blank" rel="noopener noreferrer">Book a call</a>
      </div>
      <a className="pcard__profile" href={SITE.gravatar} target="_blank" rel="noopener noreferrer">alioahmed.bio →</a>
    </aside>
  );
}
