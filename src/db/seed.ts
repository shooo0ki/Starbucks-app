import { getDB } from './client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CUSTOM_OPTIONS = require('../constants/custom-options.json') as {
  customType: string;
  optionNameJa: string;
  applicableCategory: string | null;
  pumps: Record<string, number> | null;
  displayOrder: number;
}[];

type SeedDrink = {
  name_ja: string;
  short_code: string;
  category: string;
  sub_category: string;
  needs_sleeve: number;
  special_equipment: string | null;
  steps: {
    step_order: number;
    is_required: number;
    description: string;
    ingredients: {
      name: string;
      qty_short: number | null;
      qty_tall: number | null;
      qty_grande: number | null;
      qty_venti: number | null;
      unit: string | null;
    }[];
  }[];
};

type JsonDrink = {
  nameJa: string;
  shortCode: string;
  category: string;
  subCategory?: string | null;
  needsSleeve?: boolean;
  recipeType?: string;
  practiceEnabled?: boolean;
  steps: { order: number; description: string; isRequired?: boolean }[];
};

// UI用JSONをシードにも流用する
// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSON_DRINKS: JsonDrink[] = require('../constants/recipes-ui.json');

// SEED_DRINKS は recipes-ui.json に統合済み。ここでは空配列を維持。
const SEED_DRINKS: SeedDrink[] = [];

export async function runSeed(): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();
  const allDrinks = [...SEED_DRINKS, ...jsonToSeed(JSON_DRINKS)];

  await db.withTransactionAsync(async () => {
    for (const drink of allDrinks) {
      // short_code は hot/ice で重複するため name_ja + category で一意判定する
      const dup = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM drinks WHERE name_ja = ? AND category = ? AND recipe_type = 'builtin' LIMIT 1",
        [drink.name_ja, drink.category]
      );
      if (dup) continue;

      await db.runAsync(
        `INSERT INTO drinks (name_ja, short_code, category, sub_category, needs_sleeve, special_equipment, recipe_type, practice_enabled, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'builtin', 1, ?, ?)`,
        [drink.name_ja, drink.short_code, drink.category, drink.sub_category, drink.needs_sleeve, drink.special_equipment, now, now]
      );
      const drinkRow = await db.getFirstAsync<{ id: number }>('SELECT last_insert_rowid() as id');
      if (!drinkRow) continue;
      const drinkId = drinkRow.id;

      for (const step of drink.steps) {
        await db.runAsync(
          `INSERT INTO steps (drink_id, step_order, is_required, description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [drinkId, step.step_order, step.is_required, step.description, now, now]
        );
      }
    }

    // custom_options シード（重複チェック）
    for (const opt of CUSTOM_OPTIONS) {
      const dup = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM custom_options WHERE custom_type = ? AND option_name_ja = ? AND applicable_category IS ?',
        [opt.customType, opt.optionNameJa, opt.applicableCategory]
      );
      if (dup) continue;
      await db.runAsync(
        `INSERT INTO custom_options (custom_type, option_name_ja, applicable_category, display_order)
         VALUES (?, ?, ?, ?)`,
        [opt.customType, opt.optionNameJa, opt.applicableCategory, opt.displayOrder]
      );
    }
  });
}

function jsonToSeed(list: JsonDrink[]): SeedDrink[] {
  return list.map((d) => ({
    name_ja: d.nameJa,
    short_code: d.shortCode,
    category: d.category,
    sub_category: d.subCategory ?? '',
    needs_sleeve: d.needsSleeve ? 1 : 0,
    special_equipment: null,
    steps: d.steps.map((s) => ({
      step_order: s.order,
      is_required: s.isRequired === false ? 0 : 1,
      description: s.description,
      ingredients: [],
    })),
  }));
}
