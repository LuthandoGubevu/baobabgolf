'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function NewGamePage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleStartGame = async (holes: 9 | 18) => {
    try {
        await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teamsCount: 0,
            createdAt: serverTimestamp()
        });
        toast({
          title: 'Game Created!',
          description: `A new ${holes}-hole game has been started.`,
        });
        // A real app would likely have a lobby or team selection screen next.
        // For now, we'll redirect to the main scorekeeper dashboard.
        router.push(`/scorekeeper`);
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
      <Card>
        <CardHeader>
          <CardTitle>Choose Game Length</CardTitle>
          <CardDescription>
            Select the number of holes for the new game. This will create a new game session for all registered teams.
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
