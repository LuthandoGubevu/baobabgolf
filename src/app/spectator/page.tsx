
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User } from 'lucide-react';
import { onSnapshot, collection, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Team {
  id: string;
  name: string;
  players: string[];
}

export default function SpectatorDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'teams'), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          players: data.players || [],
        };
      });

      teamsData.sort((a, b) => a.name.localeCompare(b.name));
      setTeams(teamsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Live Summary</h1>
      {loading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : (
        <div className="grid gap-8">
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
      )}
    </div>
  );
}
