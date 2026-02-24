export const CATEGORY_LABELS = [
  'コーヒー',
  'エスプレッソ',
  'フラペチーノ',
  'ティー',
  'その他',
] as const;

export type CategoryLabel = (typeof CATEGORY_LABELS)[number];
