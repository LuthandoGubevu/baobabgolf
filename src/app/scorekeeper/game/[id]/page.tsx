'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
const totalHoles = 18;

type Scores = {
  [hole: number]: {
    [player: string]: number | null;
  };
};

export default function LiveScoringPage({ params }: { params: { id: string } }) {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Scores>({});

  const handleScoreChange = (hole: number, player: string, value: string) => {
    const newScores = { ...scores };
    if (!newScores[hole]) {
      newScores[hole] = {};
    }
    const parsedValue = parseInt(value, 10);
    newScores[hole][player] = value === '' || isNaN(parsedValue) ? null : parsedValue;
    setScores(newScores);
  };

  const getBestTwoScores = (hole: number) => {
    if (!scores[hole]) return null;
    const holeScores = Object.values(scores[hole])
      .filter((s) => s !== null && !isNaN(s as number)) as number[];
    if (holeScores.length < 2) return null;
    holeScores.sort((a, b) => a - b);
    return holeScores[0] + holeScores[1];
  };
  
  const getPlayerTotal = (player: string) => {
      return Object.values(scores).reduce((total, holeScores) => {
          const score = holeScores[player];
          return total + (score || 0);
      }, 0);
  }

  const getTeamTotal = useMemo(() => {
      let total = 0;
      for (let i = 1; i <= totalHoles; i++) {
          total += getBestTwoScores(i) || 0;
      }
      return total;
  }, [scores]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" onClick={() => setCurrentHole(h => Math.max(1, h - 1))} disabled={currentHole === 1}>
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center w-24">
                <p className="text-sm text-muted-foreground">Hole</p>
                <p className="text-3xl font-bold">{currentHole}</p>
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentHole(h => Math.min(totalHoles, h + 1))} disabled={currentHole === totalHoles}>
                <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className='text-right'>
                <p className="text-sm text-muted-foreground">Hole Team Score</p>
                <p className="text-3xl font-bold font-mono">{getBestTwoScores(currentHole) ?? '-'}</p>
            </div>
          </CardTitle>
           <CardDescription>Enter scores for each player for the current hole. The best two scores will be used for the team total.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Score for Hole {currentHole}</TableHead>
                <TableHead className="text-right">Player Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player}>
                  <TableCell className="font-medium">{player}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      className="w-24 mx-auto text-center"
                      value={scores[currentHole]?.[player] ?? ''}
                      onChange={(e) => handleScoreChange(currentHole, player, e.target.value)}
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">{getPlayerTotal(player)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-xl">
                <span className="text-muted-foreground">Team Total Score</span>
                <span className="font-bold font-mono">{getTeamTotal}</span>
            </div>
            <Separator />
            {players.map(player => (
                <div key={player} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{player} Total</span>
                    <span className="font-mono">{getPlayerTotal(player)}</span>
                </div>
            ))}
        </CardContent>
        <CardFooter>
            <Button className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Progress
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
