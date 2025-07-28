'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Game {
  id: string;
  holes: number;
  teamId: string;
  currentHole: number;
  active: boolean;
}

interface PlayerScore {
  id: string;
  playerName: string;
  total: number;
}

export default function GameSummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { gameId } = params;
  const { toast } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [teamName, setTeamName] = useState('');
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const gameDocRef = doc(db, 'games', gameId as string);
    const gameUnsubscribe = onSnapshot(gameDocRef, async (gameSnap) => {
      if (!gameSnap.exists()) {
        toast({ title: 'Error', description: 'Game not found.', variant: 'destructive' });
        router.push('/scorekeeper');
        return;
      }
      const gameData = { id: gameSnap.id, ...gameSnap.data() } as Game;
      setGame(gameData);

      const teamDocRef = doc(db, 'teams', gameData.teamId);
      const teamSnap = await getDoc(teamDocRef);
      if(teamSnap.exists()) {
          setTeamName(teamSnap.data().name);
      }
    });

    const scoresQuery = query(collection(db, 'games', gameId as string, 'scores'), orderBy('total', 'asc'));
    const scoresUnsubscribe = onSnapshot(scoresQuery, (snapshot) => {
      const playerScores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlayerScore));
      setScores(playerScores);
      setLoading(false);
    });

    return () => {
      gameUnsubscribe();
      scoresUnsubscribe();
    };
  }, [gameId, toast, router]);

  if (loading || !game) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle>Game Overview: {teamName}</CardTitle>
          <CardDescription>Live scores for your {game.holes}-hole game.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-bold">{game.active ? `On Hole ${game.currentHole}` : 'Completed'}</p>
            </div>
            <Button onClick={() => router.push(`/scorekeeper/games/${game.id}/hole/${game.currentHole}`)}>
                <Pencil className="mr-2"/> Go to Current Hole
            </Button>
          </div>
          
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2"><Trophy/> Leaderboard</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                  <TableCell>{player.playerName}</TableCell>
                  <TableCell className="text-right font-mono text-lg">{player.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
