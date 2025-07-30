
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User } from 'lucide-react';
import { onSnapshot, collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTotalScore } from '@/lib/utils';

interface PlayerScore {
  playerId: string;
  playerName: string;
  total: number;
  holeScores: Record<string, number>;
}

interface LiveTeam {
  id: string; // Team ID
  name: string;
  totalScore: number;
  currentHole: number;
  holesInGame: number;
  gameId: string;
  players: PlayerScore[];
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

          if (!teamId) return null;
          
          const teamDocRef = doc(db, 'teams', teamId);
          const teamSnap = await getDoc(teamDocRef);

          if (!teamSnap.exists()) return null;

          const teamData = teamSnap.data();
          
          const scoresRef = collection(db, 'games', gameId, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);
          
          let totalScore = 0;
          const players: PlayerScore[] = scoresSnapshot.docs.map(doc => {
              const data = doc.data();
              totalScore += data.total || 0;
              return {
                  playerId: doc.id,
                  playerName: data.playerName,
                  total: data.total,
                  holeScores: data.holeScores || {},
              };
          });

          return {
            id: teamId,
            name: teamData.name,
            totalScore: totalScore,
            currentHole: gameData.currentHole,
            holesInGame: gameData.holes,
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
  
  const holeHeaders = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Game Tracker</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
          <CardHeader>
          <CardTitle>Now on the Course</CardTitle>
          <CardDescription>Follow the action as it happens. Click on a team to see a detailed scorecard.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveTeams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No teams are currently on the course.</p>
            ) : (
               <Accordion type="single" collapsible className="w-full space-y-4">
                {liveTeams.map((team) => (
                  <AccordionItem value={team.gameId} key={team.gameId} className="border-b-0 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                     <AccordionTrigger className="hover:no-underline p-4">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                               <h3 className='text-lg font-semibold'>{team.name}</h3>
                               <p className="text-sm text-muted-foreground">
                                {team.currentHole > team.holesInGame ? 'Finished' : `On Hole ${team.currentHole}`}
                               </p>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-bold font-mono ${team.totalScore > 0 ? 'text-destructive' : team.totalScore < 0 ? 'text-green-400' : ''}`}>
                                  {formatTotalScore(team.totalScore)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Score</p>
                            </div>
                        </div>
                     </AccordionTrigger>
                     <AccordionContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="sticky left-0 bg-muted/50">Player</TableHead>
                                {holeHeaders.slice(0, team.holesInGame).map(hole => <TableHead key={hole} className="text-center">{hole}</TableHead>)}
                                <TableHead className="text-right sticky right-0 bg-muted/50 font-bold">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {team.players.map(player => (
                                <TableRow key={player.playerId}>
                                  <TableCell className="font-medium sticky left-0 bg-muted/50">{player.playerName}</TableCell>
                                  {holeHeaders.slice(0, team.holesInGame).map(hole => (
                                    <TableCell key={hole} className="text-center font-mono">{player.holeScores[hole] || '-'}</TableCell>
                                  ))}
                                  <TableCell className="text-right sticky right-0 bg-muted/50 font-bold font-mono">{player.total}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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
