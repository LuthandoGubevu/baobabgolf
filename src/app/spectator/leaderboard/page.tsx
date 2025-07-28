
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User } from 'lucide-react';
import { onSnapshot, collection, query, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TeamScore {
  id: string; // Team ID
  name: string;
  totalScore: number;
  players: string[];
}

export default function SpectatorLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gamesRef = collection(db, 'games');
    const activeGamesQuery = query(gamesRef, where('active', '==', true));
    
    const unsubscribe = onSnapshot(activeGamesQuery, async (gameSnapshot) => {
      setLoading(true);
      try {
        if (gameSnapshot.empty) {
          setLeaderboardData([]);
          setLoading(false);
          return;
        }

        const teamsPromises = gameSnapshot.docs.map(async (gameDoc) => {
          const gameData = gameDoc.data();
          const gameId = gameDoc.id;
          const teamId = gameData.teamId;
          
          if (!teamId) {
             console.error(`Game document ${gameId} is missing a teamId.`);
             return null;
          }

          const teamDocRef = doc(db, 'teams', teamId);
          const teamSnap = await getDoc(teamDocRef);
          
          let teamName = "Unknown Team";
          let players: string[] = [];
          if (teamSnap.exists()) {
            teamName = teamSnap.data().name;
            players = teamSnap.data().players || [];
          } else {
             console.error(`Team document not found for teamId: ${teamId}`);
          }

          const scoresRef = collection(db, 'games', gameId, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);
          let totalScore = 0;
          scoresSnapshot.forEach(doc => {
              totalScore += doc.data().total || 0;
          });

          return {
            id: teamId,
            name: teamName,
            totalScore,
            players,
          };
        });

        const teams = (await Promise.all(teamsPromises)).filter((t): t is TeamScore => t !== null);
        
        teams.sort((a, b) => a.totalScore - b.totalScore);
        setLeaderboardData(teams);
      } catch (error) {
        console.error("Error processing leaderboard snapshot:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold font-headline">Live Leaderboard</h1>
        <Card className="bg-card/50 backdrop-blur-lg border-white/20">
            <CardHeader>
            <CardTitle>Tournament Standings</CardTitle>
            <CardDescription>Live team standings based on total scores from active games.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : leaderboardData.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No active games being tracked right now.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  <Table>
                      <TableHeader>
                      <TableRow className="border-white/20">
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Total Score</TableHead>
                      </TableRow>
                      </TableHeader>
                  </Table>
                  {leaderboardData.map((team, index) => (
                    <AccordionItem value={team.id} key={team.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <Table className="w-full">
                            <TableBody>
                              <TableRow className="border-none hover:bg-transparent">
                                <TableCell className="font-bold text-lg w-16">{index + 1}</TableCell>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell className="font-mono text-lg text-right">{team.totalScore}</TableCell>
                              </TableRow>
                            </TableBody>
                        </Table>
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
