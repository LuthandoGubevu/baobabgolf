'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Play, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const games = [
  { id: 'game1', name: 'Front 9 Challenge', status: 'In Progress', holes: 9, teams: 12 },
  { id: 'game2', name: 'Charity Scramble', status: 'Completed', holes: 18, teams: 24 },
  { id: 'game3', name: 'Member-Guest', status: 'Not Started', holes: 18, teams: 18 },
];

export default function ScorekeeperDashboard() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleStartGame = (holes: 9 | 18) => {
    const newGameId = `game-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Starting a new ${holes}-hole game with id: ${newGameId}`);
    setOpen(false);
    router.push(`/scorekeeper/game/${newGameId}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Games</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Game
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start a New Game</DialogTitle>
              <DialogDescription>
                Choose the number of holes for the new game.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button variant="outline" size="lg" className="h-24 flex-col" onClick={() => handleStartGame(9)}>
                <span className="text-3xl font-bold">9</span>
                <span className="text-muted-foreground">Holes</span>
              </Button>
              <Button variant="outline" size="lg" className="h-24 flex-col" onClick={() => handleStartGame(18)}>
                <span className="text-3xl font-bold">18</span>
                <span className="text-muted-foreground">Holes</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id}>
            <CardHeader>
              <CardTitle>{game.name}</CardTitle>
              <CardDescription>{game.holes} Holes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {game.teams} Teams
                </div>
                <Badge variant={
                  game.status === 'In Progress' ? 'default' :
                  game.status === 'Completed' ? 'secondary' : 'outline'
                }>{game.status}</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push(`/scorekeeper/game/${game.id}`)}>
                <Play className="mr-2 h-4 w-4" />
                {game.status === 'In Progress' ? 'Continue Scoring' : 'View Game'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
