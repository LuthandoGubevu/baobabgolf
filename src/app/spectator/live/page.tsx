'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { onSnapshot, collection, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTotalScore, calculateHolesPlayed } from '@/lib/utils';

interface Team {
  id: string;
  name: string;
  totalScore: number;
  holesPlayed: number;
}

export default function SpectatorLivePage() {
  const [liveTeams, setLiveTeams] = useState<Team[]>([]);
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
      }).filter(team => team.holesPlayed > 0 && team.holesPlayed < 18); // Only show teams on the course
      
      teams.sort((a, b) => a.totalScore - b.totalScore);
      setLiveTeams(teams);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Game Tracker</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
          <CardHeader>
          <CardTitle>Now on the Course</CardTitle>
          <CardDescription>Follow the action as it happens.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-8'>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveTeams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No teams are currently on the course.</p>
            ) : (
              liveTeams.map((team) => (
                  <div key={team.id} className="space-y-2">
                      <div className='flex justify-between items-baseline'>
                          <h3 className='text-lg font-semibold'>{team.name}</h3>
                          <Badge variant="outline">On Hole {team.holesPlayed + 1}</Badge>
                      </div>
                      <div className="text-right">
                        <p className='text-3xl font-bold font-mono text-primary'>{team.totalScore > 0 ? `+${team.totalScore}` : team.totalScore === 0 ? 'E' : team.totalScore}</p>
                        <p className="text-sm text-muted-foreground">Total Score</p>
                      </div>
                  </div>
              ))
            )}
          </CardContent>
      </Card>
    </div>
  );
}
