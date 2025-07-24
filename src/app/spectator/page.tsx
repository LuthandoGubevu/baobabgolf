import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const leaderboardData = [
  { rank: 1, team: 'The Code Crushers', score: -18, through: '18' },
  { rank: 2, team: 'API Aces', score: -15, through: '18' },
  { rank: 3, team: 'Divot Dynamos', score: -14, through: '16', hot: true },
  { rank: 4, team: 'The Hackers', score: -12, through: '18' },
  { rank: 5, team: 'Frontend Fairway', score: -10, through: '15' },
];

const liveGame = {
    name: "Front 9 Challenge",
    teams: [
        { name: "Divot Dynamos", score: -14, currentHole: 17, players: ["Player A", "Player B", "Player C", "Player D"]},
        { name: "Frontend Fairway", score: -10, currentHole: 16, players: ["Player E", "Player F", "Player G", "Player H"]},
    ]
}

export default function SpectatorDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Summary</h1>
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
                  {leaderboardData.map((row) => (
                      <TableRow key={row.rank}>
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

        <div className="md:col-span-2">
          <Card className="h-full bg-card/50 backdrop-blur-lg border-white/20">
              <CardHeader>
              <CardTitle>Live Game Tracking</CardTitle>
              <CardDescription>Follow the action as it happens on the course.</CardDescription>
              </CardHeader>
              <CardContent className='space-y-8'>
                  {liveGame.teams.map((team, index) => (
                      <div key={index} className="space-y-2">
                          <div className='flex justify-between items-baseline'>
                              <h3 className='text-lg font-semibold'>{team.name}</h3>
                              <Badge variant="outline">On Hole {team.currentHole}</Badge>
                          </div>
                          <div className="text-right">
                            <p className='text-3xl font-bold font-mono text-primary'>{team.score > 0 ? `+${team.score}` : team.score === 0 ? 'E' : team.score}</p>
                            <p className="text-sm text-muted-foreground">Total Score</p>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
