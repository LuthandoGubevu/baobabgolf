'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Play, Users, Loader2, Trophy, BarChart, User, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, where, Timestamp, limit } from 'firebase/firestore';
import { useAuth } from '@/components/AuthProvider';

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
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { teamId } = useAuth(); // Get teamId from Auth context

  useEffect(() => {
    const fetchData = async () => {
        if (!teamId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch the current user's team
            const teamDocRef = doc(db, 'teams', teamId);
            const teamSnapshot = await getDoc(teamDocRef);

            let currentTeam: Team | null = null;
            if (teamSnapshot.exists()) {
                currentTeam = { id: teamSnapshot.id, ...teamSnapshot.data() } as Team;
                setTeam(currentTeam);
            }

            // Fetch games for that specific team
            if (currentTeam) {
                const gamesCollection = collection(db, 'games');
                const gamesQuery = query(
                    gamesCollection,
                    where('teams', 'array-contains', currentTeam.id),
                    limit(10) // Limit to most recent 10 games
                );
                const gameSnapshot = await getDocs(gamesQuery);
                const gamesList = gameSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as Game));

                // Sort games by creation date client-side
                gamesList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                
                setGames(gamesList);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [teamId]);

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
      ) : !team ? (
          <Card className="bg-card/50 backdrop-blur-lg border-white/20">
              <CardHeader>
                  <CardTitle>No Team Found</CardTitle>
                  <CardDescription>It seems you haven't created a team yet or there was an error loading it.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => router.push('/auth/signup')}>Create a Team</Button>
              </CardContent>
          </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Team Members Card */}
            <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Overview</CardTitle>
                    <CardDescription>{team.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {team.players.map((player) => (
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
                    {mostRecentGame && team ? (
                        <Button className="w-full" onClick={() => router.push(`/scorekeeper/team/${team.id}`)}>
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
                </CardHeader>
                 <CardContent className="text-center text-muted-foreground">
                    <p>Coming Soon</p>
                </CardContent>
            </Card>
            
            {/* Best Game */}
            <Card className="bg-card/50 backdrop-blur-lg border-white/20">
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
