import { getDB } from '@/db/client';
import type { ReviewNote, CreateReviewInput } from '@/types/review';

type ReviewRow = {
  id: number;
  shift_date: string;
  good_things: string | null;
  mistakes: string | null;
  feedback: string | null;
  next_review: string | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(r: ReviewRow): ReviewNote {
  return {
    id: r.id,
    shiftDate: r.shift_date,
    goodThings: r.good_things,
    mistakes: r.mistakes,
    feedback: r.feedback,
    nextReview: r.next_review,
    mood: r.mood as ReviewNote['mood'],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getReviewNotes(params: { month?: string; q?: string } = {}): Promise<ReviewNote[]> {
  const db = getDB();
  const conditions: string[] = [];
  const args: string[] = [];

  if (params.month) {
    conditions.push("shift_date LIKE ?");
    args.push(`${params.month}%`);
  }
  if (params.q) {
    conditions.push('(good_things LIKE ? OR mistakes LIKE ?)');
    args.push(`%${params.q}%`, `%${params.q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await db.getAllAsync<ReviewRow>(
    `SELECT * FROM review_notes ${where} ORDER BY shift_date DESC`,
    args
  );
  return rows.map(rowToNote);
}

export async function getReviewNoteById(id: number): Promise<ReviewNote | null> {
  const db = getDB();
  const row = await db.getFirstAsync<ReviewRow>('SELECT * FROM review_notes WHERE id = ?', [id]);
  return row ? rowToNote(row) : null;
}

export async function upsertReviewNote(input: CreateReviewInput): Promise<ReviewNote> {
  const db = getDB();
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM review_notes WHERE shift_date = ?',
    [input.shiftDate]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE review_notes SET
         good_things = ?, mistakes = ?, feedback = ?,
         next_review = ?, mood = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.goodThings ?? null, input.mistakes ?? null,
        input.feedback ?? null, input.nextReview ?? null,
        input.mood ?? null, now, existing.id,
      ]
    );
    return (await getReviewNoteById(existing.id))!;
  }

  await db.runAsync(
    `INSERT INTO review_notes (shift_date, good_things, mistakes, feedback, next_review, mood, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.shiftDate, input.goodThings ?? null, input.mistakes ?? null,
      input.feedback ?? null, input.nextReview ?? null, input.mood ?? null,
      now, now,
    ]
  );
  const row = await db.getFirstAsync<{ id: number }>('SELECT last_insert_rowid() as id');
  return (await getReviewNoteById(row!.id))!;
}

export async function deleteReviewNote(id: number): Promise<void> {
  const db = getDB();
  await db.runAsync('DELETE FROM review_notes WHERE id = ?', [id]);
}
