import type { ReactNode } from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import AuthProvider from '@/components/AuthProvider';

const spectatorNavItems = [
  { href: '/spectator', label: 'Summary', icon: 'Home' },
  { href: '/spectator/live', label: 'Live Game', icon: 'Trophy' },
  { href: '/spectator/leaderboard', label: 'Leaderboard', icon: 'BarChart' },
  { href: '/spectator/chat', label: 'Chat', icon: 'MessageSquare' },
  { href: '/logout', label: 'Logout', icon: 'LogOut' },
];

export default function SpectatorLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider requiredRole="spectator">
      <div className="relative flex min-h-screen w-full flex-col">
        <Image
          src="/put.jpg"
          alt="A close up of a golf ball being putted into a hole"
          data-ai-hint="golf putting"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/90" />
        
        <div className="relative z-10 flex min-h-screen w-full flex-col bg-transparent">
          <Header title="Spectator Dashboard" />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">
            {children}
          </main>
          <BottomNav navItems={spectatorNavItems} />
        </div>
      </div>
    </AuthProvider>
  );
}
