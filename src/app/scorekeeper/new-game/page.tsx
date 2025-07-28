'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/components/AuthProvider';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function NewGamePage() {
  const router = useRouter();
  const { user, teamId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStartGame = async (holes: 9 | 18) => {
    if (!user || !teamId) {
      toast({ title: 'Error', description: 'You must be logged in and have a team.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      const gameData = {
        teamId: teamId,
        createdBy: user.uid,
        holes: holes,
        currentHole: 1,
        active: true,
        createdAt: serverTimestamp(),
      };
      const gameDocRef = await addDoc(collection(db, 'games'), gameData);
      toast({ title: 'Game Started!', description: `Your ${holes}-hole game is ready.` });
      router.push(`/scorekeeper/games/${gameDocRef.id}/hole/1`);
    } catch (error: any) {
      console.error('Error starting new game: ', error);
      toast({
        title: 'Error starting game',
        description: error.message || 'Could not start a new game. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Start a New Game</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle>Choose Game Length</CardTitle>
          <CardDescription>Select whether you're playing a 9-hole or 18-hole round.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="w-full text-2xl h-24"
            onClick={() => handleStartGame(9)}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : '9 Holes'}
          </Button>
          <Button
            size="lg"
            className="w-full text-2xl h-24"
            onClick={() => handleStartGame(18)}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : '18 Holes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
