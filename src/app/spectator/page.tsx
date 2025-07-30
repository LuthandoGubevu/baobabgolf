
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User, Trophy, Star } from 'lucide-react';
import { onSnapshot, collection, query, where, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  name: string;
  players: string[];
}

interface TopTeam {
  name: string;
  totalScore: number;
}

interface TopPlayer {
  playerName: string;
  teamName: string;
  totalScore: number;
}

export default function SpectatorDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [topTeam, setTopTeam] = useState<TopTeam | null>(null);
  const [topPlayer, setTopPlayer] = useState<TopPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamsQuery = query(collection(db, 'teams'));
    const unsubscribeTeams = onSnapshot(teamsQuery, (querySnapshot) => {
      const teamsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        players: doc.data().players || [],
      }) as Team);
      teamsData.sort((a, b) => a.name.localeCompare(b.name));
      setTeams(teamsData);
    });

    const gamesRef = collection(db, 'games');
    const activeGamesQuery = query(gamesRef, where('active', '==', true));
    
    const unsubscribeGames = onSnapshot(activeGamesQuery, async (gameSnapshot) => {
      if (gameSnapshot.empty) {
        setTopTeam(null);
        setTopPlayer(null);
        setLoading(false);
        return;
      }

      const teamsData: Record<string, TopTeam> = {};
      const allPlayers: TopPlayer[] = [];

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
                playerName: playerData.playerName,
                teamName: teamName,
                totalScore: playerTotal
            });
        });

        if (teamsData[teamId]) {
          teamsData[teamId].totalScore += teamTotalScore;
        } else {
          teamsData[teamId] = {
            name: teamName,
            totalScore: teamTotalScore,
          };
        }
      }

      const teamsList = Object.values(teamsData).sort((a, b) => a.totalScore - b.totalScore);
      const playersList = allPlayers.sort((a, b) => a.totalScore - b.totalScore);

      setTopTeam(teamsList[0] || null);
      setTopPlayer(playersList[0] || null);
      setLoading(false);
    });

    return () => {
      unsubscribeTeams();
      unsubscribeGames();
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Summary</h1>
      {loading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
            <div className="lg:col-span-2">
                <Card className="bg-card/50 backdrop-blur-lg border-white/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star className="text-yellow-400"/> Tournament Highlights</CardTitle>
                        <CardDescription>A quick look at the current leaders.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
                            <Trophy className="h-10 w-10 text-yellow-400 mb-2"/>
                            <p className="text-sm text-muted-foreground mb-1">Top Team</p>
                            {topTeam ? (
                                <>
                                    <p className="text-2xl font-bold">{topTeam.name}</p>
                                    <p className="text-xl font-mono text-primary">{topTeam.totalScore} strokes</p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No active games.</p>
                            )}
                        </div>
                         <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
                            <User className="h-10 w-10 text-yellow-400 mb-2"/>
                            <p className="text-sm text-muted-foreground mb-1">Top Player</p>
                            {topPlayer ? (
                                <>
                                    <p className="text-2xl font-bold">{topPlayer.playerName}</p>
                                    <p className="text-lg text-muted-foreground">{topPlayer.teamName}</p>
                                    <p className="text-xl font-mono text-primary">{topPlayer.totalScore} strokes</p>
                                </>
                            ) : (
                                <p className="text-muted-foreground">No player data.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
          <div className="lg:col-span-2">
            <Card className="h-full bg-card/50 backdrop-blur-lg border-white/20">
                <CardHeader>
                <CardTitle>Teams Overview</CardTitle>
                <CardDescription>A list of teams participating in the tournament.</CardDescription>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Players</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {teams.map((team) => (
                        <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                            {team.players.map(player => (
                                <div key={player} className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {player}
                                </div>
                            ))}
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
