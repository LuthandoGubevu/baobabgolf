import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame } from 'lucide-react';

const leaderboardData = [
  { rank: 1, team: 'The Code Crushers', score: -18, wins: 5, avgScore: -12.5 },
  { rank: 2, team: 'API Aces', score: -15, wins: 3, avgScore: -10.2 },
  { rank: 3, team: 'Divot Dynamos', score: -14, wins: 2, avgScore: -9.8, hot: true },
  { rank: 4, team: 'The Hackers', score: -12, wins: 1, avgScore: -8.1 },
  { rank: 5, team: 'Frontend Fairway', score: -10, wins: 1, avgScore: -7.4 },
];

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
        <Card>
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
                            {row.hot && <Flame className="h-4 w-4 text-primary" />}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">{row.wins}</TableCell>
                    <TableCell className="text-right font-mono">{row.avgScore > 0 ? `+${row.avgScore}` : row.avgScore.toFixed(1)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
