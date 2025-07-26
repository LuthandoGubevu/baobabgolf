import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import InstallPWA from '@/components/InstallPWA';
import { Logo } from '@/components/icons';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden text-center">
      <Image
        src="/hole-in-one.jpg"
        alt="A dramatic shot of a golf ball on the green near the hole"
        data-ai-hint="golf course green"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-background/80" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-primary-foreground p-4 w-full max-w-sm mx-auto">
        <main className="flex flex-col items-center space-y-8 w-full">
            <Logo className="h-12 w-auto"/>
            <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-headline">
                Baobab Golf
                </h1>
                <p className="text-lg text-muted-foreground">
                Your modern companion for tracking golf scores.
                </p>
            </div>
          <div className="w-full space-y-4 py-4">
             <Link href="/auth/login" passHref>
              <Button className="w-full">
                Log In
              </Button>
            </Link>
             <Link href="/auth/signup" passHref>
              <Button variant="secondary" className="w-full mt-4">
                Sign Up
              </Button>
            </Link>
          </div>
          <InstallPWA />
        </main>
      </div>
    </div>
  );
}
