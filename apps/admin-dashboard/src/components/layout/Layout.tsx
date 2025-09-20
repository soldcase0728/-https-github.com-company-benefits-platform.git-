import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full" style={{background:'var(--color-bg-base)', color:'var(--color-text-primary)'}}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
