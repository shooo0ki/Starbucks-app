import { getDB } from '@/db/client';

export type WrongAnswerItem = {
  id: number;
  drinkId: number;
  drinkName: string;
  shortCode: string | null;
  category: string;
  wrongCount: number;
  lastWrongAt: string;
  lastCorrectAt: string | null;
  resolved: boolean;
};

export async function getWrongAnswers(sort: 'wrong_count_desc' | 'last_wrong_at_desc' = 'wrong_count_desc'): Promise<WrongAnswerItem[]> {
  const db = getDB();
  const orderBy = sort === 'wrong_count_desc'
    ? 'wa.wrong_count DESC, wa.last_wrong_at DESC'
    : 'wa.last_wrong_at DESC';

  type Row = {
    id: number; drink_id: number; name_ja: string; short_code: string | null;
    category: string; wrong_count: number; last_wrong_at: string;
    last_correct_at: string | null; resolved: number;
  };

  const rows = await db.getAllAsync<Row>(
    `SELECT wa.id, wa.drink_id, d.name_ja, d.short_code, d.category,
            wa.wrong_count, wa.last_wrong_at, wa.last_correct_at, wa.resolved
     FROM wrong_answers wa
     JOIN drinks d ON d.id = wa.drink_id
     WHERE wa.resolved = 0
     ORDER BY ${orderBy}`,
    []
  );

  return rows.map((r) => ({
    id: r.id, drinkId: r.drink_id, drinkName: r.name_ja, shortCode: r.short_code,
    category: r.category, wrongCount: r.wrong_count, lastWrongAt: r.last_wrong_at,
    lastCorrectAt: r.last_correct_at, resolved: r.resolved === 1,
  }));
}

export async function resolveWrongAnswer(drinkId: number): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE wrong_answers SET resolved = 1, last_correct_at = ? WHERE drink_id = ?',
    [now, drinkId]
  );
}
