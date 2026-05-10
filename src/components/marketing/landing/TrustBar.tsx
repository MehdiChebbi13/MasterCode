const items = [
  { type: "rating" as const },
  { type: "dot" as const },
  {
    type: "schools" as const,
    text: "Berkeley · Stanford · MIT · Carnegie Mellon · Waterloo",
  },
  { type: "dot" as const },
  { type: "flashcards" as const },
  { type: "dot" as const },
  { type: "students" as const },
  { type: "dot" as const },
];

function Item({ kind }: { kind: (typeof items)[number]["type"] }) {
  if (kind === "rating") {
    return (
      <span className="mkt-trust-item">
        <span className="mkt-star">★</span> 4.9 / 5 average rating
      </span>
    );
  }
  if (kind === "schools") {
    return (
      <span className="mkt-trust-item">
        Used at <strong>Berkeley · Stanford · MIT · Carnegie Mellon · Waterloo</strong>
      </span>
    );
  }
  if (kind === "flashcards") {
    return (
      <span className="mkt-trust-item">
        📚 <strong>180,000+ flashcards</strong> studied
      </span>
    );
  }
  if (kind === "students") {
    return (
      <span className="mkt-trust-item">
        🧠 <strong>2,400+</strong> active students
      </span>
    );
  }
  return (
    <span className="mkt-trust-item">
      <span className="mkt-uni">·</span>
    </span>
  );
}

export function TrustBar() {
  // Duplicate the list so the marquee scrolls seamlessly (-50% loop).
  const doubled = [...items, ...items];
  return (
    <div className="mkt-trust-bar">
      <div className="mkt-trust-track">
        {doubled.map((it, i) => (
          <Item key={i} kind={it.type} />
        ))}
      </div>
    </div>
  );
}
