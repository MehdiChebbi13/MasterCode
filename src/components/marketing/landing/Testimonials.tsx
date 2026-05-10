type Quote = {
  cls: string;
  text: React.ReactNode;
  initials: string;
  name: string;
  meta: string;
};

const quotes: Quote[] = [
  {
    cls: "q1",
    text: (
      <>
        &quot;I went from cramming for OS to actually{" "}
        <strong>understanding semaphores</strong>. The sandbox is the secret
        weapon — being able to mess with the example and immediately see output
        rewires your brain.&quot;
      </>
    ),
    initials: "MC",
    name: "Mei Chen",
    meta: "CS Junior · Berkeley",
  },
  {
    cls: "q2",
    text: (
      <>
        &quot;Best study tool I&apos;ve used since I started undergrad. The
        summaries are short enough that I&apos;ll{" "}
        <strong>actually read them</strong>, and they earn flashcards as you go.
        Genius.&quot;
      </>
    ),
    initials: "JR",
    name: "Jordan Rivera",
    meta: "CS Senior · CMU",
  },
  {
    cls: "q3",
    text: (
      <>
        &quot;I&apos;m not even gonna pretend — I used to space out reading
        textbooks. Now I do five minutes of flashcards on the bus and{" "}
        <strong>it&apos;s actually sticking</strong>.&quot;
      </>
    ),
    initials: "AK",
    name: "Alex Kowalski",
    meta: "CS Sophomore · Waterloo",
  },
  {
    cls: "q4",
    text: (
      <>
        &quot;The Java/Python toggle on every code block is so smart. I&apos;m a
        Python person but my school teaches in Java — being able to{" "}
        <strong>see both</strong> side by side is a cheat code.&quot;
      </>
    ),
    initials: "PS",
    name: "Priya Singh",
    meta: "CS Freshman · Stanford",
  },
  {
    cls: "q5",
    text: (
      <>
        &quot;Got a B+ in Algorithms last semester and an A- this one.{" "}
        <strong>The deck is the difference.</strong> Twenty minutes a day on the
        train and the patterns stop feeling like memorization.&quot;
      </>
    ),
    initials: "DO",
    name: "Daniel Okafor",
    meta: "CS Junior · MIT",
  },
  {
    cls: "q6",
    text: (
      <>
        &quot;I have ADHD and most study tools feel like homework. This one
        feels like <strong>a video game I&apos;m winning at</strong>. The streak
        counter is unhinged in the best way.&quot;
      </>
    ),
    initials: "SL",
    name: "Sam Lindqvist",
    meta: "CS Sophomore · GT",
  },
];

export function Testimonials() {
  return (
    <section className="mkt-section" id="testimonials">
      <span className="mkt-kicker">From the dorms</span>
      <h2 className="mkt-section-title">
        CS majors are <span className="mkt-accent">into it</span>.
      </h2>
      <p className="mkt-section-deck">
        The kind of feedback that keeps us going at 2 a.m. fixing a bug.
      </p>

      <div className="mkt-testimonials">
        {quotes.map((q) => (
          <div key={q.cls} className={`mkt-quote ${q.cls}`}>
            <div className="mkt-quote-stars">★ ★ ★ ★ ★</div>
            <p className="mkt-quote-text">{q.text}</p>
            <div className="mkt-quote-author">
              <div className="mkt-quote-avatar">{q.initials}</div>
              <div className="mkt-quote-author-info">
                <div className="mkt-quote-author-name">{q.name}</div>
                <div className="mkt-quote-author-meta">{q.meta}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
