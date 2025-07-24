'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface Team {
    id: string;
    name: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [latestTeam, setLatestTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchLatestTeam = async () => {
        try {
            const teamsCollection = collection(db, "teams");
            // This is a simplified query. A real app would need a timestamp or a way to associate teams with users.
            const teamsQuery = query(teamsCollection, limit(1)); 
            const teamSnapshot = await getDocs(teamsQuery);
            if (!teamSnapshot.empty) {
                const teamDoc = teamSnapshot.docs[0];
                setLatestTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);
            }
        } catch (error) {
            console.error("Error fetching latest team:", error);
            toast({
                title: 'Error',
                description: 'Could not find a registered team.',
                variant: 'destructive',
            });
        }
    };
    fetchLatestTeam();
  }, [toast]);

  const handleStartGame = async (holes: 9 | 18) => {
    if (!latestTeam) {
        toast({
            title: 'No Team Found',
            description: "Please register a team before starting a game.",
            variant: 'destructive'
        });
        router.push('/register');
        return;
    }

    try {
        await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teams: [latestTeam.id], // Storing team ID with the game
            createdAt: serverTimestamp()
        });
        toast({
          title: 'Game Created!',
          description: `A new ${holes}-hole game has been started for ${latestTeam.name}.`,
        });
        router.push(`/scorekeeper/team/${latestTeam.id}`);
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
