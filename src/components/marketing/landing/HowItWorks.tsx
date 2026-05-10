export function HowItWorks() {
  return (
    <section className="mkt-section" id="how">
      <span className="mkt-kicker">How it works</span>
      <h2 className="mkt-section-title">
        Three steps. <span className="mkt-accent">Real fast.</span>
      </h2>
      <p className="mkt-section-deck">
        The whole point is to study, not to set up a study app. From signup to
        your first card in under a minute.
      </p>

      <div className="mkt-steps-row">
        <div className="mkt-step s1">
          <div className="mkt-step-num">1</div>
          <h4>Add your courses</h4>
          <p>
            Pick from the catalog or paste a syllabus. We handle CS 101 through
            grad-level seminars.
          </p>
        </div>
        <div className="mkt-step s2">
          <div className="mkt-step-num">2</div>
          <h4>We generate the deck</h4>
          <p>
            Flashcards, summaries, and sandbox starters appear automatically.
            Edit anything you don&apos;t like.
          </p>
        </div>
        <div className="mkt-step s3">
          <div className="mkt-step-num">3</div>
          <h4>Practice anywhere</h4>
          <p>
            Phone, laptop, between classes. Streaks reward consistency — and
            your weak spots resurface for review.
          </p>
        </div>
      </div>
    </section>
  );
}
