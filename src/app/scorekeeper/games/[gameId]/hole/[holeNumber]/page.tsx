'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, Home, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Player {
  id: string;
  name: string;
}

interface Game {
  holes: number;
  teamId: string;
  createdBy: string;
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
    if (!user || !gameId) return;
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
      if (gameData.createdBy !== user.uid) {
         toast({ title: 'Unauthorized', description: 'You cannot edit this game.', variant: 'destructive' });
         router.push('/scorekeeper');
         return;
      }
      setGame(gameData);

      const teamDocRef = doc(db, 'teams', gameData.teamId);
      const teamSnap = await getDoc(teamDocRef);

      if (teamSnap.exists()) {
        const teamPlayers = teamSnap.data().players.map((name: string, index: number) => ({ id: `player${index + 1}`, name }));
        setPlayers(teamPlayers);

        // Fetch existing scores for the current hole to pre-fill inputs
        const initialScores: Record<string, string> = {};
        for (const player of teamPlayers) {
            const scoreDocRef = doc(db, 'games', gameId as string, 'scores', player.id);
            const scoreSnap = await getDoc(scoreDocRef);
            if (scoreSnap.exists()) {
                const scoreData = scoreSnap.data();
                if (scoreData.holeScores && scoreData.holeScores[currentHole]) {
                     initialScores[player.id] = scoreData.holeScores[currentHole];
                }
            }
        }
        setScores(initialScores);

      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load game data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [gameId, user, toast, router, currentHole]);

  useEffect(() => {
    fetchGameAndPlayers();
  }, [fetchGameAndPlayers]);

  const handleScoreChange = (playerId: string, value: string) => {
    // Allow empty string to clear the input, but treat it as 0 for calculation if needed
    setScores(prev => ({ ...prev, [playerId]: value }));
  };

  const handleSaveScores = async () => {
    if (players.some(player => scores[player.id] === '' || scores[player.id] === undefined || isNaN(Number(scores[player.id])))) {
      toast({ title: 'Invalid Scores', description: 'Please enter a valid score for all players.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
        const batch = writeBatch(db);
        const gameDocRef = doc(db, 'games', gameId as string);

        for (const player of players) {
            const scoreDocRef = doc(db, 'games', gameId as string, 'scores', player.id);
            const scoreSnap = await getDoc(scoreDocRef);
            
            const newHoleScore = Number(scores[player.id]);

            if (scoreSnap.exists()) {
              const currentHoleScores = scoreSnap.data().holeScores || {};
              currentHoleScores[currentHole] = newHoleScore;
              const total = Object.values(currentHoleScores).reduce((sum: number, val) => sum + Number(val), 0);
              batch.update(scoreDocRef, {
                holeScores: currentHoleScores,
                total: total,
                updatedAt: serverTimestamp()
              });
            } else {
              batch.set(scoreDocRef, {
                holeScores: { [currentHole]: newHoleScore },
                total: newHoleScore,
                updatedAt: serverTimestamp(),
                playerId: player.id,
                playerName: player.name
              });
            }
        }
        
        // Update current hole in the main game doc
        const nextHole = currentHole + 1;
        if (game && nextHole <= game.holes) {
            batch.update(gameDocRef, { currentHole: nextHole });
        } else {
            // If it's the last hole, we might just mark it or handle it in summary page
             batch.update(gameDocRef, { currentHole: game.holes + 1 }); // Mark as finished
        }
        
        await batch.commit();

        toast({ title: 'Scores Saved!', description: `Scores for hole ${currentHole} have been saved.` });
        
        // Navigate to next hole or summary if it's the last hole
        if (game && nextHole > game.holes) {
            router.push(`/scorekeeper/games/${gameId}`);
        } else {
            router.push(`/scorekeeper/games/${gameId}/hole/${nextHole}`);
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

  const isLastHole = currentHole === game.holes;

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
                placeholder="-"
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
          {saving ? <Loader2 className="animate-spin" /> : (
            isLastHole ? (
              <>
                <CheckCircle className="mr-2" /> Save & Finish Game
              </>
            ) : 'Save & Next Hole'
          )}
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
