import { getDB } from '@/db/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CUSTOM_OPTIONS_JSON = require('../constants/custom-options.json') as {
  optionNameJa: string;
  applicableCategory: string | null;
  pumps: Record<string, number> | null;
}[];

export type CustomOption = {
  id: number;
  customType: string;
  optionNameJa: string;
  applicableCategory: string | null;
  displayOrder: number;
  pumps?: Record<'S' | 'T' | 'G' | 'V', number>;
};

type Row = {
  id: number;
  custom_type: string;
  option_name_ja: string;
  applicable_category: string | null;
  display_order: number;
};

/**
 * JSON から特定サイズのポンプ数を返す（DBに pumps カラムがないため JSON 直読み）。
 * applicableCategory を渡すと、そのカテゴリの定義を優先して返す。
 * （例: フラペチーノの CBSポンプは hot_ice と異なるため category=frappuccino を渡す）
 */
export function getPumpCount(
  optionNameJa: string,
  size: string,
  applicableCategory?: string | null
): number | null {
  const candidates = CUSTOM_OPTIONS_JSON.filter((o) => o.optionNameJa === optionNameJa);
  if (candidates.length === 0) return null;

  if (applicableCategory) {
    const matched = candidates.find((o) => o.applicableCategory === applicableCategory);
    if (matched) return matched.pumps?.[size] ?? null;
  }

  return candidates[0].pumps?.[size] ?? null;
}

export async function getCustomOptions(applicableCategory?: string | null): Promise<CustomOption[]> {
  const db = getDB();
  const where = applicableCategory ? 'WHERE applicable_category = ?' : '';
  const args = applicableCategory ? [applicableCategory] : [];
  const rows = await db.getAllAsync<Row>(
    `SELECT id, custom_type, option_name_ja, applicable_category, display_order
     FROM custom_options
     ${where}
     ORDER BY display_order, id`,
    args
  );
  return rows.map((r) => ({
    id: r.id,
    customType: r.custom_type,
    optionNameJa: r.option_name_ja,
    applicableCategory: r.applicable_category,
    displayOrder: r.display_order,
  }));
}
