'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flame, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  teamName: string;
  scores: { [hole: string]: { [player: string]: number | null } };
  players: string[];
}

interface LeaderboardRow {
  rank: number;
  team: string;
  score: number;
  through: string;
  hot?: boolean;
}

interface LiveTeam {
    name: string;
    score: number;
    currentHole: string;
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
        return hole && Object.values(hole).some(s => s !== null);
    });
    const maxHole = Math.max(0, ...holesPlayed.map(h => parseInt(h, 10)));
    return maxHole === 18 ? 'F' : maxHole.toString();
};

const calculateCurrentHole = (scores: Team['scores']) => {
    const maxHolePlayed = calculateThrough(scores);
    if (maxHolePlayed === 'F' || maxHolePlayed === '18') return 'F';
    const nextHole = parseInt(maxHolePlayed, 10) + 1;
    return nextHole > 18 ? 'F' : nextHole.toString();
};

export default function SpectatorDashboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
  const [liveTeams, setLiveTeams] = useState<LiveTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamsCollection = collection(db, "teams");
    const q = query(teamsCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData: Team[] = [];
      querySnapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as Team);
      });

      // Leaderboard processing
      const processedLeaderboard = teamsData.map(team => ({
        team: team.teamName,
        score: calculateTotalScore(team.scores),
        through: calculateThrough(team.scores),
      })).sort((a, b) => a.score - b.score);

      const rankedLeaderboard = processedLeaderboard.map((team, index) => ({
        ...team,
        rank: index + 1,
      }));
      setLeaderboardData(rankedLeaderboard);

      // Live game tracking processing
      const processedLiveTeams = teamsData.map(team => ({
        name: team.teamName,
        score: calculateTotalScore(team.scores),
        currentHole: calculateCurrentHole(team.scores),
      }))
      .filter(team => team.currentHole !== '1' && team.currentHole !== 'F') // Only show teams that have started but not finished
      .sort((a, b) => a.score - b.score)
      .slice(0, 5); // Show top 5 live teams

      setLiveTeams(processedLiveTeams);

      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-96">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
      )
  }

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
                  {liveTeams.length > 0 ? liveTeams.map((team, index) => (
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
                  )) : (
                    <p className="text-muted-foreground text-center">No games currently in progress.</p>
                  )}
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
