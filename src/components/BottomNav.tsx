'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type BottomNavProps = {
  navItems: NavItem[];
};

export function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
      <div className={`grid h-16 grid-cols-${navItems.length}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                'flex h-full flex-col items-center justify-center gap-1 rounded-none text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
