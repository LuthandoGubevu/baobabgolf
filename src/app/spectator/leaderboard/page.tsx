'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { onSnapshot, collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculateTeamTotalScore } from '@/lib/utils';

interface TeamScore {
  id: string;
  name: string;
  totalScore: number;
}

export default function SpectatorLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // 1. Get all active games
        const gamesRef = collection(db, 'games');
        const activeGamesQuery = query(gamesRef, where('active', '==', true));
        
        // Use onSnapshot to listen for real-time changes to active games
        const unsubscribe = onSnapshot(activeGamesQuery, async (gameSnapshot) => {
          if (gameSnapshot.empty) {
            setLeaderboardData([]);
            setLoading(false);
            return;
          }

          // 2. For each active game, get team info and calculate score
          const teamsPromises = gameSnapshot.docs.map(async (gameDoc) => {
            const gameData = gameDoc.data();
            const gameId = gameDoc.id;
            const teamId = gameData.teamId;

            // Get team document
            const teamDocRef = doc(db, 'teams', teamId);
            const teamSnap = await getDoc(teamDocRef);
            
            let teamName = "Unknown Team";
            if (teamSnap.exists()) {
              teamName = teamSnap.data().name;
            }

            // Calculate total score for the game
            const totalScore = await calculateTeamTotalScore(gameId);

            return {
              id: teamId,
              name: teamName,
              totalScore,
            };
          });

          const teams = await Promise.all(teamsPromises);
          
          // 3. Sort and update state
          teams.sort((a, b) => a.totalScore - b.totalScore);
          setLeaderboardData(teams);
          setLoading(false);
        });

        return unsubscribe;

      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
      }
    };

    const unsubscribePromise = fetchLeaderboard();

    return () => {
        unsubscribePromise.then(unsubscribe => {
            if (unsubscribe) {
                unsubscribe();
            }
        });
    };
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
                <Table>
                    <TableHeader>
                    <TableRow className="border-white/20">
                        <TableHead>Rank</TableHead>
                        <TableHead>Team Name</TableHead>
                        <TableHead className="text-right">Total Score</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {leaderboardData.map((team, index) => (
                        <TableRow key={team.id} className="border-white/20">
                          <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell className="font-mono text-lg text-right">{team.totalScore}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              )}
            </CardContent>
        </Card>
    </div>
  );
}
