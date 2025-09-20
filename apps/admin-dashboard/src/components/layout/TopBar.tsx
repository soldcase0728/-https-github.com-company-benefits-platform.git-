import { useState } from 'react';
import { logEvent } from '../../lib/analytics';

export function TopBar() {
  const [dark, setDark] = useState(false);
  const toggle = () => {
    setDark(d => {
      const next = !d;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark');
      }
      logEvent({ type: 'theme_toggled', dark: next });
      return next;
    });
  };
  return (
    <header className="h-14 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/70 backdrop-blur-xl flex items-center px-4 gap-4 sticky top-0 z-40">
      <div className="flex-1 text-xs tracking-wide text-[var(--color-text-secondary)] uppercase">Admin Environment</div>
      <button onClick={toggle} className="text-xs px-3 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border-strong)] transition">
        {dark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </header>
  );
}
