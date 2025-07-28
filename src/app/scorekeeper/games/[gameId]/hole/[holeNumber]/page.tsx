'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Player {
  id: string;
  name: string;
}

interface Game {
  holes: number;
  teamId: string;
}

export default function HoleScoringPage() {
  const router = useRouter();
  const params = useParams();
  const { gameId, holeNumber } = params;
  
  const { user } = useAuth();
  const { toast } = useToast();

  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentHole = parseInt(holeNumber as string, 10);

  const fetchGameAndPlayers = useCallback(async () => {
    if (!gameId) return;
    setLoading(true);
    try {
      const gameDocRef = doc(db, 'games', gameId as string);
      const gameSnap = await getDoc(gameDocRef);

      if (!gameSnap.exists()) {
        toast({ title: 'Error', description: 'Game not found.', variant: 'destructive' });
        router.push('/scorekeeper');
        return;
      }
      const gameData = gameSnap.data() as Game;
      setGame(gameData);

      const teamDocRef = doc(db, 'teams', gameData.teamId);
      const teamSnap = await getDoc(teamDocRef);

      if (teamSnap.exists()) {
        const teamPlayers = teamSnap.data().players.map((name: string, index: number) => ({ id: `player${index + 1}`, name }));
        setPlayers(teamPlayers);

        // Fetch existing scores for this hole
        const scoresCollectionRef = collection(db, 'games', gameId as string, 'scores');
        const scoresSnapshot = await getDocs(scoresCollectionRef);
        const existingScores: Record<string, number | string> = {};
        scoresSnapshot.forEach(doc => {
            const data = doc.data();
            if(data.holeScores && data.holeScores[currentHole]) {
                 existingScores[doc.id] = data.holeScores[currentHole];
            }
        });
        setScores(existingScores);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load game data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [gameId, toast, router, currentHole]);

  useEffect(() => {
    fetchGameAndPlayers();
  }, [fetchGameAndPlayers]);

  const handleScoreChange = (playerId: string, value: string) => {
    setScores(prev => ({ ...prev, [playerId]: value }));
  };

  const handleSaveScores = async () => {
    if (Object.values(scores).some(score => score === '' || isNaN(Number(score)))) {
      toast({ title: 'Invalid Scores', description: 'Please enter a valid score for all players.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const gameDocRef = doc(db, 'games', gameId as string);
      
      for (const playerId of Object.keys(scores)) {
        const scoreDocRef = doc(db, 'games', gameId as string, 'scores', playerId);
        const scoreSnap = await getDoc(scoreDocRef);
        
        const newHoleScore = Number(scores[playerId]);
        
        if (scoreSnap.exists()) {
          const currentHoleScores = scoreSnap.data().holeScores || {};
          currentHoleScores[currentHole] = newHoleScore;
          const total = Object.values(currentHoleScores).reduce((sum: number, val) => sum + (val as number), 0);
          await updateDoc(scoreDocRef, {
            holeScores: currentHoleScores,
            total: total,
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(scoreDocRef, {
            holeScores: { [currentHole]: newHoleScore },
            total: newHoleScore,
            updatedAt: serverTimestamp(),
            playerId: playerId,
            playerName: players.find(p => p.id === playerId)?.name || 'Unknown'
          });
        }
      }

      // Update current hole if it's this one
      const gameSnap = await getDoc(gameDocRef);
      if (gameSnap.data()?.currentHole === currentHole) {
        await updateDoc(gameDocRef, { currentHole: Math.min(game!.holes, currentHole + 1) });
      }

      toast({ title: 'Scores Saved!', description: `Scores for hole ${currentHole} have been saved.` });
      
      // Navigate to next hole or summary if it's the last hole
      if (game && currentHole < game.holes) {
        router.push(`/scorekeeper/games/${gameId}/hole/${currentHole + 1}`);
      } else {
        router.push(`/scorekeeper/games/${gameId}`);
      }

    } catch (error: any) {
      console.error('Error saving scores:', error);
      toast({ title: 'Error', description: 'Could not save scores.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
          <CardTitle>Hole {currentHole} of {game.holes}</CardTitle>
          <CardDescription>Enter the score for each player on this hole.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {players.map(player => (
            <div key={player.id} className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor={`score-${player.id}`} className="text-lg">{player.name}</Label>
              <Input
                id={`score-${player.id}`}
                type="number"
                placeholder="E.g., 4"
                value={scores[player.id] || ''}
                onChange={e => handleScoreChange(player.id, e.target.value)}
                className="text-center text-lg"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Button onClick={handleSaveScores} disabled={saving} size="lg">
          {saving ? <Loader2 className="animate-spin" /> : 'Save Scores & Continue'}
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/scorekeeper/games/${gameId}/hole/${currentHole - 1}`)}
            disabled={currentHole <= 1}
          >
            <ArrowLeft className="mr-2" /> Previous Hole
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/scorekeeper/games/${gameId}/hole/${currentHole + 1}`)}
            disabled={currentHole >= game.holes}
          >
            Next Hole <ArrowRight className="ml-2" />
          </Button>
        </div>
         <Button variant="secondary" onClick={() => router.push(`/scorekeeper/games/${gameId}`)}>
            <Home className="mr-2" /> Game Overview
        </Button>
      </div>
    </div>
  );
}
