import { getDB } from '@/db/client';
import type {
  Difficulty, CategoryFilter, PracticeOrder, PracticeSession,
  StepForQuiz, QuizResult, SessionSummary, DrinkSize,
} from '@/types/practice';
import type { DrinkCategory } from '@/types/drink';
import { mapToUiCategory } from '@/utils/uiCategory';
import { getCustomOptions } from './custom-option.service';

const SIZES: DrinkSize[] = ['S', 'T', 'G', 'V'];

function randomSize(): DrinkSize {
  return SIZES[Math.floor(Math.random() * SIZES.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── セッション生成 ────────────────────────────────────────

type DrinkRow = {
  id: number;
  name_ja: string;
  short_code: string | null;
  category: string;
};

export function createPracticeSession(
  difficulty: Difficulty,
  categoryFilter: CategoryFilter
): PracticeSession {
  const db = getDB();
  const now = new Date().toISOString();

  // 対象ドリンクを取得
  const conditions = ["d.practice_enabled = 1", "EXISTS (SELECT 1 FROM steps s WHERE s.drink_id = d.id)"];
  const args: (string | number)[] = [];
  // DBカテゴリフィルターは旧カテゴリのみ対応。新UIカテゴリは後で絞り込む。
  if (['hot', 'ice', 'frappuccino'].includes(categoryFilter)) {
    conditions.push('d.category = ?');
    args.push(categoryFilter);
  }

  let rows = db.getAllSync<DrinkRow>(
    `SELECT d.id, d.name_ja, d.short_code, d.category
     FROM drinks d
     WHERE ${conditions.join(' AND ')}`,
    args
  );

  // UIカテゴリフィルター（coffee/espresso/tea/other）
  if (categoryFilter !== 'all' && !['hot', 'ice', 'frappuccino'].includes(categoryFilter)) {
    rows = rows.filter((r) => mapToUiCategory({
      id: r.id,
      nameJa: r.name_ja,
      shortCode: r.short_code,
      category: r.category as DrinkCategory,
      subCategory: null,
      needsSleeve: false,
      specialEquipment: null,
      recipeType: 'builtin',
      practiceEnabled: true,
      memo: null,
      createdAt: '',
      updatedAt: '',
    }) === categoryFilter);
  }

  if (rows.length === 0) {
    throw new Error('ERR_NO_DRINKS');
  }

  // 難易度 advanced の場合、間違い問題を優先
  if (difficulty === 'advanced') {
    const wrongIds = db
      .getAllSync<{ drink_id: number }>('SELECT drink_id FROM wrong_answers WHERE resolved = 0')
      .map((r) => r.drink_id);
    if (wrongIds.length >= 5) {
      const wrongDrinks = rows.filter((r) => wrongIds.includes(r.id));
      const others = rows.filter((r) => !wrongIds.includes(r.id));
      rows = [...wrongDrinks, ...others];
    }
  }

  // 10件選択（足りなければ繰り返し）
  const pool = rows.length >= 10 ? shuffle(rows).slice(0, 10) : (() => {
    const result: DrinkRow[] = [];
    while (result.length < 10) result.push(...shuffle(rows));
    return result.slice(0, 10);
  })();

  // カスタム付与率
  const customRate =
    difficulty === 'beginner' ? 0 :
    difficulty === 'intermediate' ? 0.3 :
    0.6;

  // カスタム候補
  const customHotIce = getCustomOptions('hot_ice');
  const customFrappe = getCustomOptions('frappuccino');

  // セッション INSERT
  // DB制約に合わせ、保存するカテゴリは旧値のみ。新カテゴリは 'all' で保存。
  const dbCategory = ['hot', 'ice', 'frappuccino'].includes(categoryFilter) ? categoryFilter : 'all';

  db.runSync(
    `INSERT INTO practice_sessions (started_at, difficulty, category_filter, correct_count, total_count)
     VALUES (?, ?, ?, 0, 10)`,
    [now, difficulty, dbCategory]
  );
  const row = db.getFirstSync<{ id: number }>('SELECT last_insert_rowid() as id');
  const sessionId = row?.id ?? 0;

  const orders: PracticeOrder[] = pool.map((d, i) => {
    const category = d.category as DrinkCategory;
    let customLabel: string | null = null;
    if (Math.random() < customRate) {
      if (category === 'frappuccino') {
        const c = shuffle(customFrappe)[0];
        customLabel = c?.optionNameJa ?? null;
      } else {
        const c = shuffle(customHotIce)[0];
        customLabel = c?.optionNameJa ?? null;
      }
    }
    return {
      orderIndex: i,
      drinkId: d.id,
      drinkName: d.name_ja,
      shortCode: d.short_code,
      category,
      size: randomSize(),
      customLabel,
    };
  });

  return { sessionId, difficulty, categoryFilter, orders, startedAt: now };
}

// ── 手順取得（クイズ用）────────────────────────────────────

/**
 * クイズ用ステップを取得する。
 * hasCustom=true のとき optional ステップ（is_required=0）も含めて isCustom フラグを付与する。
 * hasCustom=false のとき optional ステップは除外する（カスタムなし注文のクイズ）。
 */
export function getStepsForQuiz(drinkId: number, hasCustom = false): StepForQuiz[] {
  const db = getDB();
  type StepRow = { id: number; step_order: number; description: string; is_required: number };
  const rows = db.getAllSync<StepRow>(
    'SELECT id, step_order, description, is_required FROM steps WHERE drink_id = ? ORDER BY step_order',
    [drinkId]
  );
  return rows
    .filter((r) => hasCustom || r.is_required === 1)
    .map((r) => ({
      id: r.id,
      correctOrder: r.step_order,
      description: r.description,
      isRequired: r.is_required === 1,
      isCustom: r.is_required === 0,
    }));
}

// ── 採点・結果保存 ────────────────────────────────────────

export function submitResult(params: {
  sessionId: number;
  drinkId: number;
  size: DrinkSize;
  customLabel?: string | null;
  userAnswer: number[];   // stepId の順序
  correctAnswer: number[]; // stepId の正解順序
}): boolean {
  const db = getDB();
  const now = new Date().toISOString();
  const isCorrect = params.userAnswer.join(',') === params.correctAnswer.join(',');

  db.runSync(
    `INSERT INTO practice_results (session_id, drink_id, size, is_correct, user_answer_json, answered_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      params.sessionId,
      params.drinkId,
      params.size,
      isCorrect ? 1 : 0,
      JSON.stringify(params.userAnswer),
      now,
    ]
  );

  // wrong_answers 更新
  if (!isCorrect) {
    const existing = db.getFirstSync<{ id: number; wrong_count: number }>(
      'SELECT id, wrong_count FROM wrong_answers WHERE drink_id = ?',
      [params.drinkId]
    );
    if (existing) {
      db.runSync(
        'UPDATE wrong_answers SET wrong_count = ?, last_wrong_at = ?, resolved = 0 WHERE drink_id = ?',
        [existing.wrong_count + 1, now, params.drinkId]
      );
    } else {
      db.runSync(
        'INSERT INTO wrong_answers (drink_id, wrong_count, last_wrong_at) VALUES (?, 1, ?)',
        [params.drinkId, now]
      );
    }
  } else {
    db.runSync(
      'UPDATE wrong_answers SET last_correct_at = ? WHERE drink_id = ?',
      [now, params.drinkId]
    );
  }

  // user_progress 更新
  _updateProgress(params.drinkId, isCorrect, now);

  return isCorrect;
}

function _updateProgress(drinkId: number, isCorrect: boolean, now: string): void {
  const db = getDB();
  type ProgRow = { practice_count: number; correct_rate: number };
  const existing = db.getFirstSync<ProgRow>(
    'SELECT practice_count, correct_rate FROM user_progress WHERE drink_id = ?',
    [drinkId]
  );

  if (!existing) {
    db.runSync(
      `INSERT INTO user_progress (drink_id, status, practice_count, correct_rate, last_practiced_at)
       VALUES (?, 'learning', 1, ?, ?)`,
      [drinkId, isCorrect ? 1.0 : 0.0, now]
    );
    return;
  }

  const newCount = existing.practice_count + 1;
  const newRate = (existing.correct_rate * existing.practice_count + (isCorrect ? 1 : 0)) / newCount;

  // 直近5回の正解で mastered 判定（簡易: correct_rate >= 0.8 かつ count >= 5）
  const newStatus = newCount >= 5 && newRate >= 0.8 ? 'mastered' : 'learning';

  db.runSync(
    `UPDATE user_progress
     SET practice_count = ?, correct_rate = ?, status = ?, last_practiced_at = ?
     WHERE drink_id = ?`,
    [newCount, newRate, newStatus, now, drinkId]
  );
}

// ── セッション終了 ────────────────────────────────────────

export function finishSession(sessionId: number, correctCount: number, durationSec: number): void {
  const db = getDB();
  const now = new Date().toISOString();
  db.runSync(
    'UPDATE practice_sessions SET correct_count = ?, duration_sec = ?, finished_at = ? WHERE id = ?',
    [correctCount, durationSec, now, sessionId]
  );
}

// ── サマリー取得 ──────────────────────────────────────────

export function getSessionSummary(
  sessionId: number,
  results: QuizResult[]
): SessionSummary {
  const db = getDB();
  type SessRow = { correct_count: number; total_count: number; duration_sec: number };
  const sess = db.getFirstSync<SessRow>(
    'SELECT correct_count, total_count, duration_sec FROM practice_sessions WHERE id = ?',
    [sessionId]
  );

  const correctCount = sess?.correct_count ?? results.filter((r) => r.isCorrect).length;
  const totalCount = sess?.total_count ?? 10;
  const durationSec = sess?.duration_sec ?? 0;

  // カテゴリ別集計
  const categoryStats: SessionSummary['categoryStats'] = {};
  for (const r of results) {
    const cat = r.drinkId.toString(); // 簡易: drinkId で代用（後でcategory持たせる）
    // NOTE: category は orders から引く必要があるが、ここでは results に含める
  }

  return {
    sessionId,
    correctCount,
    totalCount,
    correctRate: totalCount > 0 ? correctCount / totalCount : 0,
    durationSec,
    results,
    categoryStats,
  };
}
