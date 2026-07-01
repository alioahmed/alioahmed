import Link from "next/link";

export default function WorkCard({ slug, p }) {
  const brand = p.tag.split(" · ")[0];
  const s = p.stats[0];
  return (
    <Link className="wcard" href={`/work/${slug}`}>
      <div className="wcard__thumb">
        <span className="wcard__thumblabel"><span className="tag">{brand}</span></span>
      </div>
      <div className="wcard__body">
        <h3 className="wcard__title">{p.title}</h3>
        <p className="wcard__desc">{p.summary}</p>
        <div className="wcard__foot">
          <span className="wcard__stat tnum">{s.num} · {s.label}</span>
          <span className="wcard__more">View <span className="arr">→</span></span>
        </div>
      </div>
    </Link>
  );
}
