import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'OCR Extraction', href: '/admin/precision-extract' },
  // Future: Plans, Activity, Settings
];

export function Sidebar() {
  const router = useRouter();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 backdrop-blur-xl min-h-screen p-6 gap-6">
      <div className="flex items-center gap-2 font-semibold tracking-wide text-sm text-[var(--color-text-secondary)]">
        <span className="logo" style={{width:40,height:40,display:'inline-block'}} />
        <span>Benefits Admin</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(item => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2
              ${active ? 'bg-[var(--color-bg-surface-alt)] text-white' : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-surface-alt)]'}
            `}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto text-[10px] text-[var(--color-text-secondary)] opacity-60">
        v1.0.0 • Internal Build
      </div>
    </aside>
  );
}
