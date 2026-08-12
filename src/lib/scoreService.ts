import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AnswerHistory {
  questionId: number;
  questionAnswer: string;
  selectedOption: string;
  isCorrect: boolean;
}

export interface ScoreRecord {
  id?: string;
  playerName: string;
  score: number;
  gameMode: 'character' | 'title';
  totalQuestions: number;
  correctCount: number;
  createdAt?: string | Date;
  answers?: AnswerHistory[];
}

/**
 * Save a game score to Firestore "scores" collection
 */
export async function saveScoreToFirestore(data: {
  playerName: string;
  score: number;
  gameMode: 'character' | 'title';
  totalQuestions: number;
  correctCount: number;
  answers: AnswerHistory[];
}): Promise<string> {
  try {
    const scoresCol = collection(db, 'scores');
    const docRef = await addDoc(scoresCol, {
      playerName: data.playerName.trim() || 'Зочин',
      score: data.score,
      gameMode: data.gameMode,
      totalQuestions: data.totalQuestions,
      correctCount: data.correctCount,
      createdAt: serverTimestamp(),
      answers: data.answers || [],
    });
    return docRef.id;
  } catch (err) {
    console.error('Error saving score to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch top scores from Firestore "scores" collection
 */
export async function fetchTopScores(maxCount = 30): Promise<ScoreRecord[]> {
  try {
    const scoresCol = collection(db, 'scores');
    const q = query(scoresCol, orderBy('score', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    const records: ScoreRecord[] = snapshot.docs.map((doc) => {
      const d = doc.data();
      let createdDate = new Date();
      if (d.createdAt instanceof Timestamp) {
        createdDate = d.createdAt.toDate();
      } else if (typeof d.createdAt === 'string') {
        createdDate = new Date(d.createdAt);
      }

      return {
        id: doc.id,
        playerName: d.playerName || 'Зочин',
        score: typeof d.score === 'number' ? d.score : 0,
        gameMode: d.gameMode || 'character',
        totalQuestions: d.totalQuestions || 0,
        correctCount: d.correctCount || 0,
        createdAt: createdDate,
        answers: d.answers || [],
      };
    });

    return records;
  } catch (err) {
    console.error('Error fetching top scores:', err);
    return [];
  }
}
