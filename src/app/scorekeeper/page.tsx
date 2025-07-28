'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2, Trophy, BarChart, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/components/AuthProvider';

interface Team {
    id: string;
    name: string;
    players: string[];
}

export default function ScorekeeperDashboard() {
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

            if (teamSnapshot.exists()) {
                const currentTeam = { id: teamSnapshot.id, ...teamSnapshot.data() } as Team;
                setTeam(currentTeam);
            }
        } catch (error) {
            console.error("Error fetching data: ", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [teamId]);

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
            <Card className="lg:col-span-3 bg-card/50 backdrop-blur-lg border-white/20">
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
