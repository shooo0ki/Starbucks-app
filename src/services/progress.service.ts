import { getDB } from '@/db/client';
import type { ProgressStatus } from '@/types/drink';

export function recordFirstViewed(drinkId: number): void {
  const db = getDB();
  const now = new Date().toISOString();
  const existing = db.getFirstSync<{ id: number }>(
    'SELECT id FROM user_progress WHERE drink_id = ?',
    [drinkId]
  );
  if (!existing) {
    db.runSync(
      `INSERT INTO user_progress (drink_id, status, practice_count, correct_rate, first_viewed_at)
       VALUES (?, 'learning', 0, 0.0, ?)`,
      [drinkId, now]
    );
  }
}

export function updateProgressStatus(drinkId: number, status: ProgressStatus): void {
  const db = getDB();
  const now = new Date().toISOString();
  db.runSync(
    `INSERT INTO user_progress (drink_id, status, practice_count, correct_rate, first_viewed_at)
     VALUES (?, ?, 0, 0.0, ?)
     ON CONFLICT(drink_id) DO UPDATE SET status = excluded.status`,
    [drinkId, status, now]
  );
}
