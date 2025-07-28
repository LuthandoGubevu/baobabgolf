import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTeamTotalScore = async (gameId: string): Promise<number> => {
    const scoresRef = collection(db, 'games', gameId, 'scores');
    const scoresSnapshot = await getDocs(scoresRef);

    if (scoresSnapshot.empty) {
        return 0;
    }

    let teamTotal = 0;
    scoresSnapshot.forEach(doc => {
        teamTotal += doc.data().total || 0;
    });

    return teamTotal;
}

export const calculateHolesPlayed = (scores: any): number => {
  if (!scores || Object.keys(scores).length === 0) return 0;

  let maxHoles = 0;
  for (const playerScores of Object.values(scores)) {
    const holes = Object.keys((playerScores as any).holeScores || {}).length;
    if (holes > maxHoles) {
      maxHoles = holes;
    }
  }
  return maxHoles;
};
