'use client';

import { useEffect, useState } from 'react';

export function ReadingProgressBar({ show = true }: { show?: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((scrollTop / docHeight) * 100));
      setProgress(pct);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, [show]);

  if (!show) return null;
  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] no-print transition-[width] duration-100 ease-out"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, var(--gov-primary, #3a7fc7), var(--gov-secondary, #4999d6))',
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tiến trình đọc bài"
    />
  );
}
