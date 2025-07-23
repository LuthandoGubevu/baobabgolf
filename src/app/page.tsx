import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Logo, GolfBallIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <Image
        src="https://placehold.co/1920x1080.png"
        alt="Lush green golf course"
        data-ai-hint="golf course"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-background/80" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-primary-foreground p-4">
        <header className="absolute top-0 left-0 p-4 md:p-8">
            <Logo className="h-10 w-auto"/>
        </header>

        <main className="flex flex-col items-center space-y-8">
          <div className="relative w-40 h-40">
            <GolfBallIcon className="w-full h-full animate-rotate" />
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl font-headline">
              Welcome to the Baobab Golf Tournament
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              The premier corporate golf challenge. Register your team, track scores, and follow the leaderboard live.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
            <Link href="/register" passHref>
              <Card className="bg-card/50 backdrop-blur-lg border-white/20 hover:border-primary transition-colors group cursor-pointer h-full flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold mb-2 font-headline">Register a Team</h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up your team of four to compete for the championship.
                  </p>
                  <Button variant="link" className="text-primary-foreground mt-auto">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/scorekeeper" passHref>
              <Card className="bg-card/50 backdrop-blur-lg border-white/20 hover:border-primary transition-colors group cursor-pointer h-full flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold mb-2 font-headline">Scorekeeper</h3>
                  <p className="text-muted-foreground mb-4">
                    Designated scorekeepers can manage games and input scores.
                  </p>
                  <Button variant="link" className="text-primary-foreground mt-auto">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/spectator" passHref>
              <Card className="bg-card/50 backdrop-blur-lg border-white/20 hover:border-primary transition-colors group cursor-pointer h-full flex flex-col">
                <CardContent className="p-6 flex-grow flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-semibold mb-2 font-headline">Spectator View</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow the action live with real-time leaderboards and game updates.
                  </p>
                   <Button variant="link" className="text-primary-foreground mt-auto">
                    View Leaderboard <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
