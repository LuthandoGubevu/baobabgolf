'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTotalScore } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  players: string[];
  scores: any;
  totalScore: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const teamsQuery = query(collection(db, 'teams'));
        const querySnapshot = await getDocs(teamsQuery);
        const teams = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            totalScore: calculateTotalScore(data.scores),
          } as Team;
        });

        teams.sort((a, b) => a.totalScore - b.totalScore);
        setLeaderboardData(teams);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle>Overall Rankings</CardTitle>
          <CardDescription>See how teams stack up against each other in the tournament.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className='flex items-center gap-2'>
                        {team.name}
                        {/* {row.hot && <Flame className="h-4 w-4 text-primary" />} */}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{team.totalScore > 0 ? `+${team.totalScore}` : team.totalScore}</TableCell>
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
