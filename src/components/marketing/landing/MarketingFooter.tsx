import { LogoMark } from "./LogoMark";

export function MarketingFooter() {
  return (
    <footer className="mkt-foot">
      <div className="mkt-foot-inner">
        <div className="mkt-foot-brand">
          <div className="mkt-logo">
            <LogoMark />
          </div>
          <p className="mkt-tag">
            Made by people who failed enough finals to know what works.
          </p>
        </div>
        <div className="mkt-foot-cols">
          <div className="mkt-foot-col">
            <h5>Product</h5>
            <ul>
              <li><a>Flashcards</a></li>
              <li><a>Summaries</a></li>
              <li><a>Sandbox</a></li>
              <li><a>Catalog</a></li>
            </ul>
          </div>
          <div className="mkt-foot-col">
            <h5>Resources</h5>
            <ul>
              <li><a>Blog</a></li>
              <li><a>Changelog</a></li>
              <li><a>Help center</a></li>
              <li><a>Contact</a></li>
            </ul>
          </div>
          <div className="mkt-foot-col">
            <h5>Company</h5>
            <ul>
              <li><a>About</a></li>
              <li><a>Careers</a></li>
              <li><a>Privacy</a></li>
              <li><a>Terms</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mkt-foot-bottom">
        <span>
          © 2026 CS Study Hub · Made with{" "}
          <span className="mkt-heart">♥</span> for late-night studiers
        </span>
        <span>Reviews from real students. Names slightly anonymized.</span>
      </div>
    </footer>
  );
}
