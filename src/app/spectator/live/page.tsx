import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const liveGame = {
    name: "Front 9 Challenge",
    teams: [
        { name: "Divot Dynamos", score: -14, currentHole: 17, players: ["Player A", "Player B", "Player C", "Player D"]},
        { name: "Frontend Fairway", score: -10, currentHole: 16, players: ["Player E", "Player F", "Player G", "Player H"]},
        { name: "The Code Crushers", score: -18, currentHole: 18, players: ["Player I", "Player J", "Player K", "Player L"]},
        { name: "API Aces", score: -15, currentHole: 18, players: ["Player M", "Player N", "Player O", "Player P"]},
    ]
}

export default function SpectatorLivePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Game Tracker</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
          <CardHeader>
          <CardTitle>Now on the Course</CardTitle>
          <CardDescription>Follow the action as it happens.</CardDescription>
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
  );
}
