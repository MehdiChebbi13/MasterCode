export function LogoMark() {
  return (
    <>
      <div className="mkt-logo-mark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 5 L11 5 Q12 5 12 6 L12 21 Q12 20 11 20 L3 20 Z"
            stroke="#1a1612"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#fff"
          />
          <path
            d="M21 5 L13 5 Q12 5 12 6 L12 21 Q12 20 13 20 L21 20 Z"
            stroke="#1a1612"
            strokeWidth="2.2"
            strokeLinejoin="round"
            fill="#fff"
          />
        </svg>
      </div>
      <div className="mkt-logo-text">
        CS <span className="mkt-accent">Kernel</span>
      </div>
    </>
  );
}
