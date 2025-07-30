
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, Trophy } from 'lucide-react';
import { onSnapshot, collection, query, where, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamScore {
  id: string; // Team ID
  name: string;
  totalScore: number;
}

interface PlayerScore {
  id: string; // Composite key: `${gameId}-${playerId}`
  playerName: string;
  teamName: string;
  totalScore: number;
}

export default function SpectatorLeaderboardPage() {
  const [teamLeaderboard, setTeamLeaderboard] = useState<TeamScore[]>([]);
  const [playerLeaderboard, setPlayerLeaderboard] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const gamesRef = collection(db, 'games');
    const activeGamesQuery = query(gamesRef, where('active', '==', true));
    
    const unsubscribe = onSnapshot(activeGamesQuery, async (gameSnapshot) => {
      setLoading(true);
      try {
        if (gameSnapshot.empty) {
          setTeamLeaderboard([]);
          setPlayerLeaderboard([]);
          setLoading(false);
          return;
        }

        const teamsData: Record<string, TeamScore> = {};
        const allPlayers: PlayerScore[] = [];

        for (const gameDoc of gameSnapshot.docs) {
          const gameData = gameDoc.data();
          const gameId = gameDoc.id;
          const teamId = gameData.teamId;
          
          if (!teamId) continue;

          const teamDocRef = doc(db, 'teams', teamId);
          const teamSnap = await getDoc(teamDocRef);
          
          let teamName = "Unknown Team";
          if (teamSnap.exists()) {
            teamName = teamSnap.data().name;
          }

          const scoresRef = collection(db, 'games', gameId, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);

          let teamTotalScore = 0;
          scoresSnapshot.forEach(playerDoc => {
              const playerData = playerDoc.data();
              const playerTotal = playerData.total || 0;
              teamTotalScore += playerTotal;
              allPlayers.push({
                  id: `${gameId}-${playerDoc.id}`, // Create a unique composite key
                  playerName: playerData.playerName,
                  teamName: teamName,
                  totalScore: playerTotal
              });
          });

          if (teamsData[teamId]) {
            teamsData[teamId].totalScore += teamTotalScore;
          } else {
            teamsData[teamId] = {
              id: teamId,
              name: teamName,
              totalScore: teamTotalScore,
            };
          }
        }

        const teamsList = Object.values(teamsData).sort((a, b) => a.totalScore - b.totalScore);
        const playersList = allPlayers.sort((a, b) => a.totalScore - b.totalScore);

        setTeamLeaderboard(teamsList);
        setPlayerLeaderboard(playersList);

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
       <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Trophy /> Live Leaderboard</h1>
        <Card className="bg-card/50 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle>Tournament Standings</CardTitle>
            <CardDescription>Live team and player standings from active games.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teams">Team Rankings</TabsTrigger>
                <TabsTrigger value="players">Player Rankings</TabsTrigger>
              </TabsList>
              
              {loading ? (
                 <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <>
                  <TabsContent value="teams">
                      {teamLeaderboard.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No active games being tracked.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Rank</TableHead>
                              <TableHead>Team Name</TableHead>
                              <TableHead className="text-right">Total Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teamLeaderboard.map((team, index) => (
                              <TableRow key={team.id}>
                                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell className="text-right font-mono text-lg">{team.totalScore}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                  </TabsContent>

                  <TabsContent value="players">
                      {playerLeaderboard.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No player scores available.</p>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Rank</TableHead>
                              <TableHead>Player</TableHead>
                              <TableHead>Team</TableHead>
                              <TableHead className="text-right">Total Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {playerLeaderboard.map((player, index) => (
                               <TableRow key={player.id}>
                                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                <TableCell className="font-medium">{player.playerName}</TableCell>
                                <TableCell className="text-muted-foreground">{player.teamName}</TableCell>
                                <TableCell className="text-right font-mono text-lg">{player.totalScore}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
    </div>
  );
}
