export function FreeBanner() {
  return (
    <div className="mkt-free-banner" id="free">
      <div className="mkt-free-card">
        <span className="mkt-sticker">✦ Always free for students</span>
        <div>
          <h3>
            Free. <span className="em">For real.</span>
          </h3>
          <p>
            We&apos;re a small team that was tired of study apps that gate the
            good stuff behind a paywall. If you&apos;re a student, the whole
            thing is yours.
          </p>
        </div>
        <ul className="mkt-free-list">
          <li>
            <span className="mkt-check">✓</span> Unlimited courses &amp;
            flashcards
          </li>
          <li>
            <span className="mkt-check">✓</span> Java &amp; Python sandbox, no
            rate limits
          </li>
          <li>
            <span className="mkt-check">✓</span> Summaries with code blocks
            &amp; recall cards
          </li>
          <li>
            <span className="mkt-check">✓</span> Phone, tablet, laptop — synced
          </li>
          <li>
            <span className="mkt-check">✓</span> No ads. Not now, not ever.
          </li>
        </ul>
      </div>
    </div>
  );
}
