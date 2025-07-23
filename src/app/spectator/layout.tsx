import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const spectatorNavItems = [
  { href: '/spectator', label: 'Summary', icon: 'Home' },
  { href: '/spectator/leaderboard', label: 'Leaderboard', icon: 'BarChart' },
  { href: '/spectator/chat', label: 'Chat', icon: 'MessageSquare' },
  { href: '/logout', label: 'Logout', icon: 'LogOut' },
];

export default function SpectatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header title="Spectator Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav navItems={spectatorNavItems} />
    </div>
  );
}
