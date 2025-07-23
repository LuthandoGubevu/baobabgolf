import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const scorekeeperNavItems = [
  { href: '/scorekeeper', label: 'Home', icon: 'Home' },
  { href: '/scorekeeper/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { href: '/scorekeeper/chat', label: 'Chat', icon: 'MessageSquare' },
];

export default function ScorekeeperLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header title="Scorekeeper Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <BottomNav navItems={scorekeeperNavItems} />
    </div>
  );
}
