'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  teamName: string;
  scores: { [key: string]: { [key: string]: number } };
  wins: number; // This needs to be calculated or stored
}

// Function to calculate the total score for a team
const calculateTotalScore = (scores: Team['scores']) => {
  let total = 0;
  for (const hole in scores) {
    const holeScores = Object.values(scores[hole]).filter(s => s !== null).sort((a, b) => a - b);
    if (holeScores.length >= 2) {
      total += holeScores[0] + holeScores[1];
    }
  }
  return total;
};

// Function to calculate average score (for simplicity, we'll use total score for now)
const calculateAverageScore = (totalScore: number) => {
    // This is a placeholder. A real average would need number of games played.
    return totalScore;
};


export default function LeaderboardPage() {
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                const teamsCollection = collection(db, "teams");
                const teamsQuery = query(teamsCollection);
                const teamSnapshot = await getDocs(teamsQuery);

                const teams = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

                const processedData = teams.map(team => {
                    const totalScore = calculateTotalScore(team.scores);
                    return {
                        id: team.id,
                        team: team.teamName,
                        score: totalScore,
                        wins: 0, // Placeholder for wins
                        avgScore: calculateAverageScore(totalScore),
                    };
                });

                // Sort by score ascending
                processedData.sort((a, b) => a.score - b.score);
                
                // Add rank
                const rankedData = processedData.map((team, index) => ({...team, rank: index + 1}));

                setLeaderboardData(rankedData);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
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
                <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Wins</TableHead>
                    <TableHead className="text-right">Avg. Score</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {leaderboardData.map((row) => (
                    <TableRow key={row.rank}>
                    <TableCell className="font-medium text-center">{row.rank}</TableCell>
                    <TableCell className="font-medium">
                        <div className='flex items-center gap-2'>
                            {row.team}
                            {/* {row.hot && <Flame className="h-4 w-4 text-primary" />} */}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">{row.wins}</TableCell>
                    <TableCell className="text-right font-mono">{row.avgScore > 0 ? `+${row.avgScore}` : row.avgScore}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
