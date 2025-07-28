import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { collection, getDocs } from "firebase/firestore";
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

export const formatTotalScore = (score: number): string => {
  if (score > 0) return `+${score}`;
  if (score === 0) return 'E';
  return `${score}`;
};
