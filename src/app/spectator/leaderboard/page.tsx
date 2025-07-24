import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame } from 'lucide-react';

const leaderboardData = [
  { rank: 1, team: 'The Code Crushers', score: -18, through: '18' },
  { rank: 2, team: 'API Aces', score: -15, through: '18' },
  { rank: 3, team: 'Divot Dynamos', score: -14, through: '16', hot: true },
  { rank: 4, team: 'The Hackers', score: -12, through: '18' },
  { rank: 5, team: 'Frontend Fairway', score: -10, through: '15' },
];

export default function SpectatorLeaderboardPage() {
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
