import type { Difficulty } from './practice';

export type AppSettings = {
  defaultDifficulty: Difficulty;
  timerEnabled: boolean;
  qtyQuizEnabled: boolean;
  hapticsEnabled: boolean;
  updatedAt: string;
};
