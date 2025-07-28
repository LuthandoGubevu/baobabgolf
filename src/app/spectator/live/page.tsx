
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User } from 'lucide-react';
import { onSnapshot, collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface LiveTeam {
  id: string; // Team ID
  name: string;
  totalScore: number;
  currentHole: number;
  gameId: string;
  players: string[];
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
          const teamId = gameData.teamId;

          const teamDocRef = doc(db, 'teams', teamId);
          const teamSnap = await getDoc(teamDocRef);

          if (!teamSnap.exists()) {
            console.error(`Team document not found for teamId: ${teamId}`);
            return null;
          }

          const teamName = teamSnap.data().name;
          const players = teamSnap.data().players || [];
          
          const scoresRef = collection(db, 'games', gameId, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);
          let totalScore = 0;
          scoresSnapshot.forEach(doc => {
              totalScore += doc.data().total || 0;
          });

          return {
            id: teamId,
            name: teamName,
            totalScore: totalScore,
            currentHole: gameData.currentHole,
            gameId: gameId,
            players: players,
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
          <CardDescription>Follow the action as it happens. Click on a team to see players.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveTeams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No teams are currently on the course.</p>
            ) : (
               <Accordion type="single" collapsible className="w-full">
                {liveTeams.map((team) => (
                  <AccordionItem value={team.gameId} key={team.gameId}>
                     <AccordionTrigger className="hover:no-underline p-3 rounded-lg hover:bg-white/5">
                        <div className="w-full space-y-2">
                           <div className='flex justify-between items-baseline'>
                              <h3 className='text-lg font-semibold'>{team.name}</h3>
                              <Badge variant="outline">On Hole {team.currentHole}</Badge>
                           </div>
                           <div className="text-right">
                              <p className='text-3xl font-bold font-mono text-primary'>{team.totalScore > 0 ? `+${team.totalScore}` : team.totalScore === 0 ? 'E' : team.totalScore}</p>
                              <p className="text-sm text-muted-foreground">Total Score</p>
                           </div>
                        </div>
                     </AccordionTrigger>
                     <AccordionContent>
                        <div className="pl-6 pr-4 pb-2">
                           <h4 className="font-semibold mb-2 text-muted-foreground">Players</h4>
                           <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {team.players.map(player => (
                                <div key={player} className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-primary" />
                                  <span>{player}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                     </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
