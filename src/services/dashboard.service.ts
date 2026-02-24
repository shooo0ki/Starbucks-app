import { getDB } from '@/db/client';
import type { DashboardSummary } from '@/types/dashboard';
import type { DrinkCategory } from '@/types/drink';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = getDB();

  // 習得数 / 総ドリンク数
  const masteredRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM user_progress WHERE status = 'mastered'"
  );
  const totalRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM drinks'
  );
  const masteredCount = masteredRow?.count ?? 0;
  const totalDrinkCount = totalRow?.count ?? 0;
  const masteredRate = totalDrinkCount > 0 ? masteredCount / totalDrinkCount : 0;

  // 今週の練習回数（月曜起算）
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const weeklyRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM practice_sessions WHERE started_at >= ?',
    [monday.toISOString()]
  );
  const weeklyPracticeCount = weeklyRow?.count ?? 0;

  // 未消化の間違い問題数
  const wrongRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM wrong_answers WHERE resolved = 0'
  );
  const unresolvedWrongCount = wrongRow?.count ?? 0;

  // 苦手カテゴリ（直近10セッションのカテゴリ別正解率）
  type CatRow = { category: string; correct: number; total: number };
  const catRows = await db.getAllAsync<CatRow>(`
    SELECT d.category,
           SUM(pr.is_correct)          AS correct,
           COUNT(*)                    AS total
    FROM practice_results pr
    JOIN drinks d ON d.id = pr.drink_id
    WHERE pr.session_id IN (
      SELECT id FROM practice_sessions ORDER BY started_at DESC LIMIT 10
    )
    GROUP BY d.category
  `);

  let weakestCategory: DrinkCategory | null = null;
  let weakestCategoryRate: number | null = null;
  for (const row of catRows) {
    const rate = row.total > 0 ? row.correct / row.total : 0;
    if (weakestCategoryRate === null || rate < weakestCategoryRate) {
      weakestCategoryRate = rate;
      weakestCategory = row.category as DrinkCategory;
    }
  }

  // 直近振り返りスニペット
  type ReviewRow = { good_things: string | null; shift_date: string };
  const reviewRow = await db.getFirstAsync<ReviewRow>(
    'SELECT good_things, shift_date FROM review_notes ORDER BY shift_date DESC LIMIT 1'
  );
  const latestReviewSnippet = reviewRow?.good_things
    ? reviewRow.good_things.slice(0, 60) + (reviewRow.good_things.length > 60 ? '…' : '')
    : null;
  const latestReviewDate = reviewRow?.shift_date ?? null;

  return {
    masteredCount,
    totalDrinkCount,
    masteredRate,
    weeklyPracticeCount,
    unresolvedWrongCount,
    weakestCategory,
    weakestCategoryRate,
    latestReviewSnippet,
    latestReviewDate,
  };
}
