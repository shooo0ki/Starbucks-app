import type { DrinkCategory } from './drink';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
// UIカテゴリに合わせたフィルター
export type CategoryFilter =
  | 'coffee'
  | 'espresso'
  | 'frappuccino'
  | 'tea'
  | 'other'
  | 'all';
export type DrinkSize = 'S' | 'T' | 'G' | 'V';

export type PracticeOrder = {
  orderIndex: number;
  drinkId: number;
  drinkName: string;
  shortCode: string | null;
  category: DrinkCategory;
  size: DrinkSize;
  customLabel?: string | null;
};

export type PracticeSession = {
  sessionId: number;
  difficulty: Difficulty;
  categoryFilter: CategoryFilter;
  orders: PracticeOrder[];
  startedAt: string;
};

export type StepForQuiz = {
  id: number;
  correctOrder: number;
  description: string;
  isRequired: boolean;
  isCustom?: boolean;
};

export type QuizResult = {
  orderIndex: number;
  drinkId: number;
  drinkName: string;
  size: DrinkSize;
  isCorrect: boolean;
  userAnswer: number[];
  correctAnswer: number[];
  customLabel?: string | null;
};

export type SessionSummary = {
  sessionId: number;
  correctCount: number;
  totalCount: number;
  correctRate: number;
  durationSec: number;
  results: QuizResult[];
  categoryStats: Record<string, { correct: number; total: number; rate: number }>;
};
