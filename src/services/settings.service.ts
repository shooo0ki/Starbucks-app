import { getDB } from '@/db/client';
import type { AppSettings } from '@/types/settings';
import type { Difficulty } from '@/types/practice';

type SettingsRow = {
  default_difficulty: string;
  timer_enabled: number;
  qty_quiz_enabled: number;
  haptics_enabled: number;
  updated_at: string;
};

export async function getSettings(): Promise<AppSettings> {
  const db = getDB();
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM app_settings WHERE id = 1');
  if (!row) {
    return { defaultDifficulty: 'beginner', timerEnabled: false, qtyQuizEnabled: false, hapticsEnabled: true, updatedAt: '' };
  }
  return {
    defaultDifficulty: row.default_difficulty as Difficulty,
    timerEnabled: row.timer_enabled === 1,
    qtyQuizEnabled: row.qty_quiz_enabled === 1,
    hapticsEnabled: row.haptics_enabled === 1,
    updatedAt: row.updated_at,
  };
}

export async function updateSettings(patch: Partial<Omit<AppSettings, 'updatedAt'>>): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  const fields: string[] = [];
  const args: (string | number)[] = [];

  if (patch.defaultDifficulty !== undefined) { fields.push('default_difficulty = ?'); args.push(patch.defaultDifficulty); }
  if (patch.timerEnabled !== undefined)      { fields.push('timer_enabled = ?');      args.push(patch.timerEnabled ? 1 : 0); }
  if (patch.qtyQuizEnabled !== undefined)    { fields.push('qty_quiz_enabled = ?');   args.push(patch.qtyQuizEnabled ? 1 : 0); }
  if (patch.hapticsEnabled !== undefined)    { fields.push('haptics_enabled = ?');    args.push(patch.hapticsEnabled ? 1 : 0); }

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  args.push(now, 1);
  await db.runAsync(`UPDATE app_settings SET ${fields.join(', ')} WHERE id = ?`, args);
}

export async function resetAllData(): Promise<void> {
  const db = getDB();
  await db.runAsync('DELETE FROM practice_results');
  await db.runAsync('DELETE FROM practice_sessions');
  await db.runAsync('DELETE FROM wrong_answers');
  await db.runAsync('DELETE FROM user_progress');
  await db.runAsync('DELETE FROM review_notes');
  await db.runAsync("DELETE FROM drinks WHERE recipe_type = 'user'");
}
