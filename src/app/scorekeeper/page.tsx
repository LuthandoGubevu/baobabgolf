'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2, Trophy, PlusCircle, List } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/components/AuthProvider';

interface Team {
    id: string;
    name: string;
    players: string[];
}

interface Game {
    id: string;
    teamId: string;
    holes: number;
    currentHole: number;
    active: boolean;
}

export default function ScorekeeperDashboard() {
  const [team, setTeam] = useState<Team | null>(null);
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, teamId } = useAuth();

  useEffect(() => {
    if (!teamId) {
      if (!user) {
        setLoading(false);
      }
      return;
    };

    setLoading(true);
    const teamDocRef = doc(db, 'teams', teamId);
    const unsubscribe = onSnapshot(teamDocRef, (teamSnapshot) => {
      if (teamSnapshot.exists()) {
        setTeam({ id: teamSnapshot.id, ...teamSnapshot.data() } as Team);
      } else {
        setTeam(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [teamId, user]);

  useEffect(() => {
    if (!teamId) return;

    const gamesQuery = query(collection(db, 'games'), where('teamId', '==', teamId), where('active', '==', true));
    const unsubscribe = onSnapshot(gamesQuery, (snapshot) => {
        const games = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
        setActiveGames(games);
    }, (error) => {
        console.error("Error fetching active games:", error);
    });

    return () => unsubscribe();
  }, [teamId]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <Button onClick={() => router.push('/scorekeeper/new-game')} className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" /> New Game
        </Button>
      </div>

      {loading ? (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : !team ? (
          <Card className="bg-card/50 backdrop-blur-lg border-white/20">
              <CardHeader>
                  <CardTitle>No Team Found</CardTitle>
                  <CardDescription>It seems you haven't created a team yet. Please sign up again to create a team.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={() => router.push('/auth/signup')}>Create a Team</Button>
              </CardContent>
          </Card>
      ) : (
        <>
            <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Overview</CardTitle>
                    <CardDescription>{team.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {team.players.map((player) => (
                         <div key={player} className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span>{player}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Active Games</CardTitle>
                     <CardDescription>Continue scoring for any of your active games.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeGames.length === 0 ? (
                        <p className="text-muted-foreground">You have no active games.</p>
                    ) : (
                        <div className="space-y-4">
                            {activeGames.map(game => (
                                <div key={game.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{game.holes}-hole game</p>
                                        <p className="text-sm text-muted-foreground">Currently on hole {game.currentHole}</p>
                                    </div>
                                    <Button onClick={() => router.push(`/scorekeeper/games/${game.id}`)}>View Summary</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
