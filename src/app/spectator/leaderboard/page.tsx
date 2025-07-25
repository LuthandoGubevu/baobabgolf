'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTotalScore, calculateHolesPlayed } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  totalScore: number;
  holesPlayed: number;
}

export default function SpectatorLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<Team[]>([]);
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <Card className="bg-card/50 backdrop-blur-lg border-white/20">
            <CardHeader>
            <CardTitle>Overall Rankings</CardTitle>
            <CardDescription>Live standings from across the tournament.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <Table>
                    <TableHeader>
                    <TableRow className="border-white/20">
                        <TableHead className="w-[50px]">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">Thru</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {leaderboardData.map((row, index) => (
                        <TableRow key={row.id} className="border-white/20">
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
              )}
            </CardContent>
        </Card>
    </div>
  );
}
