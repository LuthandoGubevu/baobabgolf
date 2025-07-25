import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Scores = {
  [hole: number]: {
    [player: string]: number | null;
  };
};

// Calculates the best two scores for a given hole
const getBestTwoScoresForHole = (holeScores: { [player: string]: number | null }): number | null => {
    if (!holeScores) return null;
    const validScores = Object.values(holeScores)
      .filter((s) => s !== null && !isNaN(s as number)) as number[];
    if (validScores.length < 2) return null;
    validScores.sort((a, b) => a - b);
    return validScores[0] + validScores[1];
};

// Calculates the total score for a team
export const calculateTotalScore = (scores: Scores): number => {
    let total = 0;
    for (let i = 1; i <= 18; i++) {
        if (scores && scores[i]) {
            total += getBestTwoScoresForHole(scores[i]) || 0;
        }
    }
    return total;
};

// Calculates how many holes a team has completed
export const calculateHolesPlayed = (scores: Scores): number => {
    if (!scores) return 0;
    const holes = Object.keys(scores).map(Number);
    return holes.length > 0 ? Math.max(...holes) : 0;
};
