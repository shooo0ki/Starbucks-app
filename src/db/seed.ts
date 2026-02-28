import { getDB } from './client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CUSTOM_OPTIONS = require('../constants/custom-options.json') as {
  customType: string;
  optionNameJa: string;
  applicableCategory: string | null;
  pumps: Record<string, number> | null;
  displayOrder: number;
}[];

type JsonDrink = {
  nameJa: string;
  shortCode: string;
  category: string;
  subCategory?: string | null;
  needsSleeve?: boolean;
  practiceEnabled?: boolean;
  steps: { order: number; description: string; isRequired?: boolean }[];
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSON_DRINKS: JsonDrink[] = require('../constants/recipes-ui.json');

// SQLite文字列エスケープ（シードデータ専用。ユーザー入力には使わないこと）
function q(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

export async function runSeed(): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  // ── ドリンクシード ────────────────────────────────────────
  // 既存の組み込みドリンクがあればスキップ（再起動ごとに300+クエリを避ける）
  const drinkCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM drinks WHERE recipe_type = 'builtin'"
  );

  if ((drinkCount?.count ?? 0) === 0) {
    // 全ドリンク＋ステップを1回の execAsync で一括挿入
    const parts: string[] = [];
    let drinkId = 1;

    for (const d of JSON_DRINKS) {
      parts.push(
        `INSERT OR IGNORE INTO drinks (id, name_ja, short_code, category, sub_category, needs_sleeve, special_equipment, recipe_type, practice_enabled, created_at, updated_at) VALUES (${drinkId}, ${q(d.nameJa)}, ${q(d.shortCode)}, ${q(d.category)}, ${q(d.subCategory ?? '')}, ${d.needsSleeve ? 1 : 0}, NULL, 'builtin', 1, ${q(now)}, ${q(now)});`
      );
      for (const step of d.steps) {
        parts.push(
          `INSERT OR IGNORE INTO steps (drink_id, step_order, is_required, description, created_at, updated_at) VALUES (${drinkId}, ${step.order}, ${step.isRequired === false ? 0 : 1}, ${q(step.description)}, ${q(now)}, ${q(now)});`
        );
      }
      drinkId++;
    }

    await db.execAsync(parts.join('\n'));
  }

  // ── カスタムオプションシード ───────────────────────────────
  const customCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM custom_options'
  );

  if ((customCount?.count ?? 0) === 0) {
    const parts = CUSTOM_OPTIONS.map(
      (opt) =>
        `INSERT OR IGNORE INTO custom_options (custom_type, option_name_ja, applicable_category, display_order) VALUES (${q(opt.customType)}, ${q(opt.optionNameJa)}, ${q(opt.applicableCategory)}, ${opt.displayOrder});`
    );
    await db.execAsync(parts.join('\n'));
  }
}
