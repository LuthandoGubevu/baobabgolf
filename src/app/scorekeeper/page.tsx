'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Play, Users, Loader2, Trophy, BarChart, User, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

interface Game {
    id: string;
    name: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    holes: 9 | 18;
    teamsCount: number;
    createdAt: any;
}

interface Team {
    id: string;
    name: string;
    players: string[];
}

export default function ScorekeeperDashboard() {
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [latestTeam, setLatestTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch games
            const gamesCollection = collection(db, 'games');
            const gamesQuery = query(gamesCollection, orderBy('createdAt', 'desc'));
            const gameSnapshot = await getDocs(gamesQuery);
            const gamesList = gameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
            setGames(gamesList);

            // Fetch the most recently created team
            const teamsCollection = collection(db, "teams");
            // Assuming there's a timestamp field, if not, this will not work as expected
            // For now, let's just get the first one we find. A proper implementation would need a timestamp.
             const teamsQuery = query(teamsCollection, limit(1)); // simplified for now
             const teamSnapshot = await getDocs(teamsQuery);
             if (!teamSnapshot.empty) {
                const teamDoc = teamSnapshot.docs[0];
                setLatestTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);
             }

        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
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
        setOpen(false);
        // This assumes we want to score for the latest team. 
        // A real implementation might need a team selection step.
        if(latestTeam) {
            router.push(`/scorekeeper/team/${latestTeam.id}`);
        } else {
             router.push(`/register`); // Or show a message to register a team first
        }
    } catch (error) {
        console.error("Error starting new game: ", error);
    }
  };

  const mostRecentGame = games.length > 0 ? games[0] : null;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      </div>

      {loading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Team Members Card */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Overview</CardTitle>
                    {latestTeam ? <CardDescription>{latestTeam.name}</CardDescription> : <CardDescription>No team found. Register one first!</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-2">
                    {latestTeam?.players.map((player) => (
                         <div key={player} className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{player}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Most Recent Game Card */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Most Recent Game</CardTitle>
                    {mostRecentGame ? <CardDescription>{mostRecentGame.name}</CardDescription> : <CardDescription>No games started yet.</CardDescription>}
                </CardHeader>
                {mostRecentGame && (
                     <CardContent>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {mostRecentGame.teamsCount} Teams
                            </div>
                             <Badge variant={
                                mostRecentGame.status === 'In Progress' ? 'default' :
                                mostRecentGame.status === 'Completed' ? 'secondary' : 'outline'
                                }>{mostRecentGame.status}</Badge>
                        </div>
                     </CardContent>
                )}
                 <CardFooter>
                    {mostRecentGame && latestTeam ? (
                        <Button className="w-full" onClick={() => router.push(`/scorekeeper/team/${latestTeam.id}`)}>
                            <Play className="mr-2 h-4 w-4" />
                            {mostRecentGame.status === 'In Progress' ? 'Continue Scoring' : 'View Game'}
                        </Button>
                    ) : (
                         <Button className="w-full" onClick={() => router.push('/scorekeeper/new-game')}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Start Your First Game
                        </Button>
                    )}
                </CardFooter>
            </Card>
            
            {/* Team Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Team Stats</CardTitle>
                    <CardDescription>Performance metrics for your team.</CardDescription>
                </CardHeader>
                 <CardContent className="text-center text-muted-foreground">
                    <p>Coming Soon</p>
                </CardContent>
            </Card>
            
            {/* Best Game */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Best Game</CardTitle>
                    <CardDescription>Highlight of your team's top performance.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Coming Soon</p>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
