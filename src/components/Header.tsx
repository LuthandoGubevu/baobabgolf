import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur-xl md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-8 w-auto text-primary-foreground" />
      </Link>
      <h1 className="text-xl font-semibold text-foreground hidden md:block">{title}</h1>
      <Button variant="ghost" size="icon">
        <User className="h-5 w-5" />
        <span className="sr-only">User Profile</span>
      </Button>
    </header>
  );
}
