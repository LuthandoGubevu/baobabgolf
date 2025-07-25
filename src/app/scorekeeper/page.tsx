'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Play, Users, Loader2, Trophy, BarChart, User, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, Timestamp, limit } from 'firebase/firestore';

interface Game {
    id: string;
    name: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    holes: 9 | 18;
    teams: string[];
    createdAt: Timestamp;
}

interface Team {
    id: string;
    name: string;
    players: string[];
}

export default function ScorekeeperDashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [latestTeam, setLatestTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch the most recently created team
            // In a real app with user auth, you'd fetch the team for the current user.
            const teamsCollection = collection(db, "teams");
            const teamsQuery = query(teamsCollection, limit(1)); // Simplified for now
            const teamSnapshot = await getDocs(teamsQuery);

            let team: Team | null = null;
            if (!teamSnapshot.empty) {
                const teamDoc = teamSnapshot.docs[0];
                team = { id: teamDoc.id, ...teamDoc.data() } as Team;
                setLatestTeam(team);
            }

            // Fetch games for that specific team
            if (team) {
                const gamesCollection = collection(db, 'games');
                const gamesQuery = query(
                    gamesCollection,
                    where('teams', 'array-contains', team.id)
                );
                const gameSnapshot = await getDocs(gamesQuery);
                const gamesList = gameSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Game));

                // Sort games manually after fetching to avoid needing a composite index
                gamesList.sort((a, b) => {
                    const dateA = a.createdAt?.toDate() || new Date(0);
                    const dateB = b.createdAt?.toDate() || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setGames(gamesList);
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
        await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teamsCount: 0,
            createdAt: serverTimestamp()
        });
        // This assumes we want to score for the latest team. 
        // A real implementation might need a team selection step.
        if(latestTeam) {
            router.push(`/scorekeeper/team/${latestTeam.id}`);
        } else {
             router.push(`/register`); // Or show a message to register a team first
        }
    } catch (error)
     {
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
            <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg border-white/20">
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
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Most Recent Game</CardTitle>
                    {mostRecentGame ? <CardDescription>{mostRecentGame.name}</CardDescription> : <CardDescription>No games started yet.</CardDescription>}
                </CardHeader>
                {mostRecentGame && (
                     <CardContent>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {mostRecentGame.teams.length} Teams
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
            <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Team Stats</CardTitle>
                    <CardDescription>Performance metrics for your team.</CardDescription>
                </Header>
                 <CardContent className="text-center text-muted-foreground">
                    <p>Coming Soon</p>
                </CardContent>
            </Card>
            
            {/* Best Game */}
            <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" /> Best Game</CardTitle>
                    <CardDescription>Highlight of your team's top performance.</CardDescription>
                </Header>
                <CardContent className="text-center text-muted-foreground">
                    <p>Coming Soon</p>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}
