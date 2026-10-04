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
import { safeFirestoreWrite, isFirestoreQuotaExceeded, markFirestoreQuotaExceeded, isQuotaError } from './quotaService';

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
  const localId = 'score_' + Date.now();
  const localRecord: ScoreRecord = {
    id: localId,
    playerName: data.playerName.trim() || 'Зочин',
    score: data.score,
    gameMode: data.gameMode,
    totalQuestions: data.totalQuestions,
    correctCount: data.correctCount,
    createdAt: new Date(),
    answers: data.answers || [],
  };

  // Cache locally
  try {
    const saved = localStorage.getItem('ioio_local_scores');
    const list: ScoreRecord[] = saved ? JSON.parse(saved) : [];
    list.unshift(localRecord);
    localStorage.setItem('ioio_local_scores', JSON.stringify(list.slice(0, 100)));
  } catch {}

  const result = await safeFirestoreWrite(async () => {
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
  }, () => localId);

  return result || localId;
}

/**
 * Fetch top scores from Firestore "scores" collection
 */
export async function fetchTopScores(maxCount = 30): Promise<ScoreRecord[]> {
  const getLocalScores = (): ScoreRecord[] => {
    try {
      const saved = localStorage.getItem('ioio_top_scores');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  };

  if (isFirestoreQuotaExceeded()) {
    return getLocalScores();
  }

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

    try {
      localStorage.setItem('ioio_top_scores', JSON.stringify(records));
    } catch {}

    return records;
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExceeded();
    }
    console.warn('Error fetching top scores, fallback active:', err);
    return getLocalScores();
  }
}
