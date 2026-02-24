import { getDB } from '@/db/client';
import type { ProgressStatus } from '@/types/drink';

export async function recordFirstViewed(drinkId: number): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM user_progress WHERE drink_id = ?',
    [drinkId]
  );
  if (!existing) {
    await db.runAsync(
      `INSERT INTO user_progress (drink_id, status, practice_count, correct_rate, first_viewed_at)
       VALUES (?, 'learning', 0, 0.0, ?)`,
      [drinkId, now]
    );
  }
}

export async function updateProgressStatus(drinkId: number, status: ProgressStatus): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO user_progress (drink_id, status, practice_count, correct_rate, first_viewed_at)
     VALUES (?, ?, 0, 0.0, ?)
     ON CONFLICT(drink_id) DO UPDATE SET status = excluded.status`,
    [drinkId, status, now]
  );
}
