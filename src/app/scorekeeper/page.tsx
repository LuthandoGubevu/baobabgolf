'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Play, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface Game {
    id: string;
    name: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    holes: 9 | 18;
    teamsCount: number;
    createdAt: any;
}

export default function ScorekeeperDashboard() {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGames = async () => {
        setLoading(true);
        try {
            const gamesCollection = collection(db, 'games');
            const gameSnapshot = await getDocs(gamesCollection);
            const gamesList = gameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
            // Sort games by creation date, newest first
            gamesList.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setGames(gamesList);
        } catch (error) {
            console.error("Error fetching games: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchGames();
  }, []);

  const handleStartGame = async (holes: 9 | 18) => {
    try {
        const newGameRef = await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teamsCount: 0,
            createdAt: serverTimestamp()
        });
        console.log(`Starting a new ${holes}-hole game with id: ${newGameRef.id}`);
        setOpen(false);
        router.push(`/scorekeeper/game/${newGameRef.id}`);
    } catch (error) {
        console.error("Error starting new game: ", error);
    }
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

      {loading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : games.length === 0 ? (
          <Card className="flex flex-col items-center justify-center h-64 border-dashed">
            <CardHeader>
                <CardTitle>No Games Found</CardTitle>
                <CardDescription>Start a new game to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => setOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start New Game
                </Button>
            </CardContent>
          </Card>
      ) : (
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
                    {game.teamsCount} Teams
                    </div>
                    <Badge variant={
                    game.status === 'In Progress' ? 'default' :
                    game.status === 'Completed' ? 'secondary' : 'outline'
                    }>{game.status}</Badge>
                </div>
                </CardContent>
                <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/scorekeeper/team/some-team-id`)}>
                    <Play className="mr-2 h-4 w-4" />
                    {game.status === 'In Progress' ? 'Continue Scoring' : 'View Game'}
                </Button>
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </>
  );
}
