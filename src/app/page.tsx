import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-primary-foreground p-4 w-full max-w-sm mx-auto text-center">
        <main className="flex flex-col items-center space-y-8 w-full">
            <Image src="/logo.png" alt="Baobab Golf Logo" width={64} height={64} className="h-16 w-auto" />
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl font-headline">
                Baobab Golf
                </h1>
                <p className="text-lg text-muted-foreground">
                Your modern companion for tracking golf scores.
                </p>
            </div>
          <div className="w-full space-y-4">
             <Link href="/scorekeeper" passHref>
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6">
                Scorekeeper: Start Game
              </Button>
            </Link>
             <Link href="/spectator" passHref>
              <Button size="lg" variant="outline" className="w-full bg-input text-lg py-6 border-input">
                Spectator Dashboard
              </Button>
            </Link>

            <div className="flex items-center w-full">
              <Separator className="flex-grow bg-border" />
              <span className="px-4 text-sm text-muted-foreground">OR</span>
              <Separator className="flex-grow bg-border" />
            </div>

            <Link href="/register" passHref>
                <Button size="lg" variant="outline" className="w-full bg-input text-lg py-6 border-input">
                    Register New Team
                </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
