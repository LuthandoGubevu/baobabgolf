
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Play, Users, Loader2, Trophy, BarChart, User, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Game {
    id: string;
    name: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    holes: 9 | 18;
    teams: string[];
    createdAt: any;
    teamsCount: number;
}

interface Team {
    id: string;
    teamName: string;
    players: string[];
}

export default function ScorekeeperDashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // Fetch team associated with the current user
                    const teamsCollection = collection(db, "teams");
                    const teamQuery = query(teamsCollection, where("scorekeeperId", "==", user.uid), limit(1));
                    const teamSnapshot = await getDocs(teamQuery);

                    let teamId: string | null = null;
                    if (!teamSnapshot.empty) {
                        const teamDoc = teamSnapshot.docs[0];
                        const teamData = { id: teamDoc.id, ...teamDoc.data() } as Team;
                        setUserTeam(teamData);
                        teamId = teamDoc.id;
                    }

                    // Fetch games that include the user's team
                    if (teamId) {
                        const gamesCollection = collection(db, 'games');
                        const gamesQuery = query(
                            gamesCollection, 
                            where('teams', 'array-contains', teamId),
                            orderBy('createdAt', 'desc')
                        );
                        const gameSnapshot = await getDocs(gamesQuery);
                        const gamesList = gameSnapshot.docs.map(doc => ({ 
                            id: doc.id, 
                            ...doc.data(),
                            teamsCount: doc.data().teams.length
                        } as Game));
                        setGames(gamesList);
                    } else {
                        setGames([]);
                    }

                } catch (error) {
                    console.error("Error fetching data: ", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
            router.push('/auth/login');
        }
    });
    
    return () => unsubscribe();
  }, [auth, router]);

  const mostRecentGame = games.length > 0 ? games[0] : null;

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Team Members Card */}
              <Card className="lg:col-span-1 bg-card/50 backdrop-blur-lg border-white/20">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Overview</CardTitle>
                      {userTeam ? <CardDescription>{userTeam.teamName}</CardDescription> : <CardDescription>No team found. Register one first!</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-2">
                      {userTeam?.players.map((player) => (
                           <div key={player} className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{player}</span>
                          </div>
                      ))}
                      {!userTeam && <Button onClick={() => router.push('/auth/signup')}>Register a Team</Button>}
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
                              {mostRecentGame.teamsCount} Team(s)
                              </div>
                               <Badge variant={
                                  mostRecentGame.status === 'In Progress' ? 'default' :
                                  mostRecentGame.status === 'Completed' ? 'secondary' : 'outline'
                                  }>{mostRecentGame.status}</Badge>
                          </div>
                       </CardContent>
                  )}
                   <CardFooter>
                      {mostRecentGame && userTeam ? (
                          <Button className="w-full" onClick={() => router.push(`/scorekeeper/team/${userTeam.id}`)}>
                              <Play className="mr-2 h-4 w-4" />
                              {mostRecentGame.status === 'In Progress' ? 'Continue Scoring' : 'View Game'}
                          </Button>
                      ) : (
                           <Button className="w-full" onClick={() => router.push('/scorekeeper/new-game')} disabled={!userTeam}>
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
        </>
      )}
    </>
  );
}
