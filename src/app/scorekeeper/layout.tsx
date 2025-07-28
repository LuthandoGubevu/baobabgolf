import type { ReactNode } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const scorekeeperNavItems = [
  { href: '/scorekeeper', label: 'Dashboard', icon: 'Home' },
  { href: '/scorekeeper/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { href: '/scorekeeper/chat', label: 'Chat', icon: 'MessageSquare' },
  { href: '/logout', label: 'Logout', icon: 'LogOut' },
];

export default function ScorekeeperLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
       <Image
        src="/golfer.jpg"
        alt="A golfer swinging a club on a beautiful course"
        data-ai-hint="golfer course"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-background/90" />
      <div className="relative z-10 flex min-h-screen w-full flex-col bg-transparent">
        <Header title="Scorekeeper Dashboard" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        <BottomNav navItems={scorekeeperNavItems} />
      </div>
    </div>
  );
}
