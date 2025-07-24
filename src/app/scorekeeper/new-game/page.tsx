'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, getDoc, getDocs, limit, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface Team {
    id: string;
    teamName: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const teamsCollection = collection(db, "teams");
                const teamsQuery = query(teamsCollection, where("scorekeeperId", "==", user.uid), limit(1));
                const teamSnapshot = await getDocs(teamsQuery);
                if (!teamSnapshot.empty) {
                    const teamDoc = teamSnapshot.docs[0];
                    setUserTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);
                }
            } catch (error) {
                console.error("Error fetching user team:", error);
                toast({
                    title: 'Error',
                    description: 'Could not find your registered team.',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        } else {
            router.push('/auth/login');
        }
    });
    return () => unsubscribe();
  }, [auth, toast, router]);

  const handleStartGame = async (holes: 9 | 18) => {
    if (!userTeam) {
        toast({
            title: 'No Team Found',
            description: "Please register a team before starting a game.",
            variant: 'destructive'
        });
        router.push('/auth/signup');
        return;
    }

    try {
        const gameDocRef = await addDoc(collection(db, 'games'), {
            name: `New ${holes}-Hole Game`,
            status: 'Not Started',
            holes: holes,
            teams: [userTeam.id], // Storing team ID with the game
            createdAt: serverTimestamp()
        });
        toast({
          title: 'Game Created!',
          description: `A new ${holes}-hole game has been started for ${userTeam.teamName}.`,
        });
        // Redirect to the team scoring page for the new game
        router.push(`/scorekeeper/team/${userTeam.id}`);
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
            <Button variant="outline" size="lg" className="h-32 flex-col gap-2" onClick={() => handleStartGame(9)} disabled={loading || !userTeam}>
                <span className="text-4xl font-bold">9</span>
                <span className="text-muted-foreground">Holes</span>
            </Button>
            <Button variant="outline" size="lg" className="h-32 flex-col gap-2" onClick={() => handleStartGame(18)} disabled={loading || !userTeam}>
                <span className="text-4xl font-bold">18</span>
                <span className="text-muted-foreground">Holes</span>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
