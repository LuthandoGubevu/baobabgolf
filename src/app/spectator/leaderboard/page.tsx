'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  teamName: string;
  scores: { [hole: string]: { [player: string]: number | null } };
}

interface LeaderboardRow {
  rank: number;
  team: string;
  score: number;
  through: string;
  hot?: boolean;
}

const calculateTotalScore = (scores: Team['scores']) => {
  let total = 0;
  for (const hole in scores) {
    if (scores[hole]) {
      const holeScores = Object.values(scores[hole])
        .filter(s => s !== null)
        .map(s => s as number)
        .sort((a, b) => a - b);
      if (holeScores.length >= 2) {
        total += holeScores[0] + holeScores[1];
      }
    }
  }
  return total;
};

const calculateThrough = (scores: Team['scores']) => {
    const holesPlayed = Object.keys(scores).filter(holeKey => {
        const hole = scores[holeKey];
        // A hole is considered played if at least one player has a score.
        return hole && Object.values(hole).some(s => s !== null);
    });
    const maxHole = Math.max(0, ...holesPlayed.map(h => parseInt(h)));
    return maxHole === 18 ? 'F' : maxHole.toString();
};

export default function SpectatorLeaderboardPage() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                const teamsCollection = collection(db, "teams");
                const teamsQuery = query(teamsCollection);
                const teamSnapshot = await getDocs(teamsQuery);
                
                const teamsData = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

                const processedData = teamsData.map(team => ({
                    team: team.teamName,
                    score: calculateTotalScore(team.scores),
                    through: calculateThrough(team.scores),
                })).sort((a, b) => a.score - b.score);

                const rankedData = processedData.map((team, index) => ({
                    ...team,
                    rank: index + 1,
                }));
                
                setLeaderboardData(rankedData);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    if(loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <Card className="bg-card/50 backdrop-blur-lg border-white/20">
            <CardHeader>
            <CardTitle>Overall Rankings</CardTitle>
            <CardDescription>See how teams stack up against each other in the tournament.</CardDescription>
            </CardHeader>
            <CardContent>
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
                {leaderboardData.map((row) => (
                    <TableRow key={row.rank} className="border-white/20">
                    <TableCell className="font-medium text-center">{row.rank}</TableCell>
                    <TableCell className="font-medium">
                        <div className='flex items-center gap-2'>
                            {row.team}
                            {row.hot && <Flame className="h-4 w-4 text-primary" />}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">{row.through}</TableCell>
                    <TableCell className="text-right font-mono">{row.score > 0 ? `+${row.score}` : row.score === 0 ? 'E' : row.score}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
