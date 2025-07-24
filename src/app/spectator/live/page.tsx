'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface Team {
  id: string;
  teamName: string;
  scores: { [hole: string]: { [player: string]: number | null } };
  players: string[];
}

interface LiveGameData {
  name: string;
  teams: {
    name: string;
    score: number;
    currentHole: string; // 'F' for finished or hole number
    players: string[];
  }[];
}

const calculateTotalScore = (scores: Team['scores']) => {
  let total = 0;
  for (const hole in scores) {
    const holeScores = Object.values(scores[hole]).filter(s => s !== null).map(s => s as number).sort((a, b) => a - b);
    if (holeScores.length >= 2) {
      total += holeScores[0] + holeScores[1];
    }
  }
  return total;
};

const calculateCurrentHole = (scores: Team['scores']) => {
    const holesPlayed = Object.keys(scores).filter(holeKey => {
        const hole = scores[holeKey];
        return hole && Object.values(hole).some(s => s !== null);
    });
    const maxHole = Math.max(0, ...holesPlayed.map(h => parseInt(h, 10)));
    return maxHole === 18 ? 'F' : (maxHole + 1).toString();
};


export default function SpectatorLivePage() {
  const [liveGame, setLiveGame] = useState<LiveGameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamsCollection = collection(db, "teams");
    const q = query(teamsCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData: Team[] = [];
      querySnapshot.forEach((doc) => {
        teamsData.push({ id: doc.id, ...doc.data() } as Team);
      });

      const processedTeams = teamsData.map(team => ({
        name: team.teamName,
        score: calculateTotalScore(team.scores),
        currentHole: calculateCurrentHole(team.scores),
        players: team.players
      })).filter(team => team.currentHole !== '1' && team.currentHole !== 'F' ); // Only show teams in progress

      // Sort by score
      processedTeams.sort((a,b) => a.score - b.score);

      setLiveGame({
        name: "Live Tournament", // You can enhance this to fetch game name
        teams: processedTeams
      });

      setLoading(false);
    }, (error) => {
      console.error("Error fetching live game data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!liveGame || liveGame.teams.length === 0) {
     return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Live Game Tracker</h1>
             <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                <CardTitle>Now on the Course</CardTitle>
                <CardDescription>No games currently in progress.</CardDescription>
                </CardHeader>
             </Card>
        </div>
    )
  }

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
