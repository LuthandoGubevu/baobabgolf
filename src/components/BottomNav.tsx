'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/Icon';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type BottomNavProps = {
  navItems: NavItem[];
};

export function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  // Tailwind CSS requires full class names to be present at build-time.
  // We can't use dynamic string concatenation like `grid-cols-${navItems.length}`.
  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return `grid-cols-${count}`; // Fallback for more items
    }
  }

  const gridColsClass = getGridColsClass(navItems.length);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
      <div className={cn('grid h-16', gridColsClass)}>
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
                <Icon name={item.icon as any} className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
