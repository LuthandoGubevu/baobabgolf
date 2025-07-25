'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { onSnapshot, collection, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTotalScore, calculateHolesPlayed } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  totalScore: number;
  holesPlayed: number;
}

export default function SpectatorDashboard() {
  const [leaderboardData, setLeaderboardData] = useState<Team[]>([]);
  const [liveTeams, setLiveTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'teams'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          totalScore: calculateTotalScore(data.scores),
          holesPlayed: calculateHolesPlayed(data.scores),
        };
      });

      teams.sort((a, b) => a.totalScore - b.totalScore);
      setLeaderboardData(teams);

      const live = teams.filter(team => team.holesPlayed > 0 && team.holesPlayed < 18);
      setLiveTeams(live);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Summary</h1>
      {loading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card className="h-full bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Live standings from across the tournament.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">Thru</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {leaderboardData.slice(0, 10).map((row, index) => (
                        <TableRow key={row.id}>
                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                            <div className='flex items-center gap-2'>
                                {row.name}
                                {/* {row.hot && <Flame className="h-4 w-4 text-primary" />} */}
                            </div>
                        </TableCell>
                        <TableCell className="text-center">{row.holesPlayed === 18 ? 'F' : row.holesPlayed}</TableCell>
                        <TableCell className="text-right font-mono">{row.totalScore > 0 ? `+${row.totalScore}` : row.totalScore === 0 ? 'E' : row.totalScore}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="h-full bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                <CardTitle>Live Game Tracking</CardTitle>
                <CardDescription>Follow the action as it happens on the course.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-8'>
                    {liveTeams.length === 0 ? (
                       <p className="text-muted-foreground text-center py-4">No teams are currently on the course.</p>
                    ): (
                        liveTeams.slice(0, 5).map((team) => (
                            <div key={team.id} className="space-y-2">
                                <div className='flex justify-between items-baseline'>
                                    <h3 className='text-lg font-semibold'>{team.name}</h3>
                                    <Badge variant="outline">On Hole {team.holesPlayed + 1}</Badge>
                                </div>
                                <div className="text-right">
                                  <p className='text-3xl font-bold font-mono text-primary'>{team.totalScore > 0 ? `+${team.totalScore}` : team.totalScore === 0 ? 'E' : team.totalScore}</p>
                                  <p className="text-sm text-muted-foreground">Total Score</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
