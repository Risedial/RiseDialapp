'use client';

const skeletonStyles = `
  @keyframes skeletonPulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0.4;
    }
  }

  .skeleton-base {
    background-color: var(--color-surface-raised, #1a1a24);
    border-radius: var(--radius-sm, 8px);
    animation: skeletonPulse 1.6s ease-in-out infinite;
  }

  .skeleton-message-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  }

  .skeleton-message-wrapper.user {
    align-items: flex-end;
  }

  .skeleton-message-wrapper.rise {
    align-items: flex-start;
  }

  .skeleton-message-line {
    background-color: var(--color-surface-raised, #1a1a24);
    border-radius: var(--radius-bubble, 20px);
    animation: skeletonPulse 1.6s ease-in-out infinite;
    height: 14px;
  }

  .skeleton-message-line.user {
    background-color: var(--color-border, #2a2a38);
  }

  .skeleton-message-line.rise {
    background-color: var(--color-surface-raised, #1a1a24);
  }

  .skeleton-button {
    background-color: var(--color-surface-raised, #1a1a24);
    border-radius: var(--radius-sm, 8px);
    animation: skeletonPulse 1.6s ease-in-out infinite;
    min-height: var(--tap-target-min, 44px);
    width: 100%;
  }
`;

interface MessageSkeletonProps {
  variant?: 'user' | 'rise';
  lineCount?: number;
}

export function MessageSkeleton({ variant = 'rise', lineCount = 2 }: MessageSkeletonProps) {
  const lineWidths =
    variant === 'user'
      ? ['72%', '48%']
      : ['88%', '64%', '80%'];

  const visibleLines = lineWidths.slice(0, lineCount);

  return (
    <>
      <style>{skeletonStyles}</style>
      <div
        className={`skeleton-message-wrapper ${variant}`}
        role="status"
        aria-label="Loading message"
        aria-busy="true"
      >
        {visibleLines.map((width, index) => (
          <div
            key={index}
            className={`skeleton-message-line ${variant}`}
            style={{ width }}
          />
        ))}
      </div>
    </>
  );
}

interface ButtonSkeletonProps {
  width?: string;
  height?: string;
}

export function ButtonSkeleton({
  width = '100%',
  height = 'var(--tap-target-min, 44px)',
}: ButtonSkeletonProps) {
  return (
    <>
      <style>{skeletonStyles}</style>
      <div
        className="skeleton-button"
        role="status"
        aria-label="Loading button"
        aria-busy="true"
        style={{ width, height }}
      />
    </>
  );
}
