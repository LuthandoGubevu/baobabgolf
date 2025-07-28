
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from './AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';


export function Header({ title }: { title: string }) {
  const { fullName } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur-xl md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="Baobab Golf Logo" width={100} height={20} className="w-auto h-5" style={{ width: 'auto' }} />
      </Link>
      <h1 className="text-xl font-semibold text-foreground hidden md:block">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User Profile</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>{fullName || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/logout')}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
