
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { onSnapshot, collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LiveTeam {
  id: string;
  name: string;
  totalScore: number;
  currentHole: number;
  gameId: string;
}

export default function SpectatorLivePage() {
  const [liveTeams, setLiveTeams] = useState<LiveTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gamesRef = collection(db, 'games');
    const activeGamesQuery = query(gamesRef, where('active', '==', true));

    const unsubscribe = onSnapshot(activeGamesQuery, async (snapshot) => {
      try {
        const teamsPromises = snapshot.docs.map(async (gameDoc) => {
          const gameData = gameDoc.data();
          const gameId = gameDoc.id;

          // Use gameData.teamId to fetch the team document
          const teamDocRef = doc(db, 'teams', gameData.teamId);
          const teamSnap = await getDoc(teamDocRef);

          if (!teamSnap.exists()) {
            console.error(`Team document not found for teamId: ${gameData.teamId}`);
            return null;
          }

          const teamName = teamSnap.data().name;
          
          const scoresRef = collection(db, 'games', gameId, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);
          let totalScore = 0;
          scoresSnapshot.forEach(doc => {
              totalScore += doc.data().total || 0;
          });

          return {
            id: gameData.teamId,
            name: teamName,
            totalScore: totalScore,
            currentHole: gameData.currentHole,
            gameId: gameId,
          };
        });

        const teams = (await Promise.all(teamsPromises)).filter((t): t is LiveTeam => t !== null);
        teams.sort((a, b) => a.totalScore - b.totalScore);
        setLiveTeams(teams);
      } catch (error) {
        console.error("Error fetching live game data:", error);
      } finally {
        setLoading(false);
      }
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
                  <div key={team.gameId} className="space-y-2">
                      <div className='flex justify-between items-baseline'>
                          <h3 className='text-lg font-semibold'>{team.name}</h3>
                          <Badge variant="outline">On Hole {team.currentHole}</Badge>
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
