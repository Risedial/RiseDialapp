'use client';

export default function SplashScreen() {
  return (
    <>
      <style>{`
        @keyframes riseWordmarkFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .splash-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-bg, #0a0a0f);
          z-index: var(--z-overlay, 200);
        }

        .splash-wordmark {
          font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
          font-size: 48px;
          font-weight: var(--font-weight-semibold, 600);
          letter-spacing: -0.02em;
          background: linear-gradient(
            135deg,
            var(--color-accent-start, #4f8ef7),
            var(--color-accent-end, #2dd4bf)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: riseWordmarkFadeIn 300ms ease-out forwards;
          opacity: 0;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>

      <div className="splash-root" role="status" aria-label="Loading Rise">
        <span className="splash-wordmark" aria-hidden="true">
          Rise
        </span>
      </div>
    </>
  );
}
