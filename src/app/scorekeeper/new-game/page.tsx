'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

export default function NewGamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { teamId } = useAuth(); // Get teamId from Auth context

  const handleStartGame = async (holes: 9 | 18) => {
    if (!teamId) {
        toast({
            title: 'No Team Found',
            description: "You must be part of a team to start a game.",
            variant: 'destructive'
        });
        return;
    }

    try {
        const gameDocRef = await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teams: [teamId], // Storing team ID with the game
            createdAt: Timestamp.now()
        });
        toast({
          title: 'Game Created!',
          description: `A new ${holes}-hole game has been started.`,
        });
        router.push(`/scorekeeper/team/${teamId}`);
    } catch (error) {
        console.error("Error starting new game: ", error);
         toast({
          title: 'Error',
          description: "Could not start a new game. Please try again.",
          variant: 'destructive'
        });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Start New Game</h1>
      <Card className="bg-card/50 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle>Choose Game Length</CardTitle>
          <CardDescription>
            Select the number of holes for the new game. This will create a new game session for your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="h-32 flex-col gap-2" onClick={() => handleStartGame(9)}>
                <span className="text-4xl font-bold">9</span>
                <span className="text-muted-foreground">Holes</span>
            </Button>
            <Button variant="outline" size="lg" className="h-32 flex-col gap-2" onClick={() => handleStartGame(18)}>
                <span className="text-4xl font-bold">18</span>
                <span className="text-muted-foreground">Holes</span>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
