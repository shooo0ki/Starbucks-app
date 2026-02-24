import { getDB } from '@/db/client';
import type { Drink, DrinkDetail, GetDrinksParams, Step, Ingredient } from '@/types/drink';

type DrinkRow = {
  id: number;
  name_ja: string;
  short_code: string | null;
  category: string;
  sub_category: string | null;
  needs_sleeve: number;
  special_equipment: string | null;
  recipe_type: string;
  practice_enabled: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
  progress_status: string | null;
  correct_rate: number | null;
};

type StepRow = {
  id: number;
  drink_id: number;
  step_order: number;
  is_required: number;
  description: string;
};

type IngredientRow = {
  id: number;
  step_id: number;
  name: string;
  qty_short: number | null;
  qty_tall: number | null;
  qty_grande: number | null;
  qty_venti: number | null;
  unit: string | null;
};

function rowToDrink(row: DrinkRow): Drink {
  return {
    id: row.id,
    nameJa: row.name_ja,
    shortCode: row.short_code,
    category: row.category as Drink['category'],
    subCategory: row.sub_category,
    needsSleeve: row.needs_sleeve === 1,
    specialEquipment: row.special_equipment,
    recipeType: row.recipe_type as Drink['recipeType'],
    practiceEnabled: row.practice_enabled === 1,
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: row.progress_status
      ? { status: row.progress_status as Drink['progress'] extends object ? Drink['progress']['status'] : never, correctRate: row.correct_rate ?? 0 }
      : undefined,
  };
}

export async function getDrinks(params: GetDrinksParams = {}): Promise<Drink[]> {
  const db = getDB();
  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (params.category && params.category !== 'all') {
    conditions.push('d.category = ?');
    args.push(params.category);
  }
  if (params.subCategory) {
    conditions.push('d.sub_category = ?');
    args.push(params.subCategory);
  }
  if (params.q) {
    conditions.push('(d.name_ja LIKE ? OR d.short_code LIKE ?)');
    args.push(`%${params.q}%`, `%${params.q}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await db.getAllAsync<DrinkRow>(
    `SELECT d.*,
            up.status   AS progress_status,
            up.correct_rate
     FROM drinks d
     LEFT JOIN user_progress up ON up.drink_id = d.id
     ${where}
     ORDER BY d.category, d.name_ja`,
    args
  );

  return rows.map(rowToDrink);
}

export async function getDrinkById(id: number): Promise<DrinkDetail | null> {
  const db = getDB();

  const drinkRow = await db.getFirstAsync<DrinkRow>(
    `SELECT d.*,
            up.status   AS progress_status,
            up.correct_rate
     FROM drinks d
     LEFT JOIN user_progress up ON up.drink_id = d.id
     WHERE d.id = ?`,
    [id]
  );
  if (!drinkRow) return null;

  const stepRows = await db.getAllAsync<StepRow>(
    'SELECT * FROM steps WHERE drink_id = ? ORDER BY step_order',
    [id]
  );

  const steps: Step[] = await Promise.all(
    stepRows.map(async (s) => {
      const ingRows = await db.getAllAsync<IngredientRow>(
        'SELECT * FROM ingredients WHERE step_id = ?',
        [s.id]
      );
      return {
        id: s.id,
        drinkId: s.drink_id,
        stepOrder: s.step_order,
        isRequired: s.is_required === 1,
        description: s.description,
        ingredients: ingRows.map((i) => ({
          id: i.id,
          stepId: i.step_id,
          name: i.name,
          qtyShort: i.qty_short,
          qtyTall: i.qty_tall,
          qtyGrande: i.qty_grande,
          qtyVenti: i.qty_venti,
          unit: i.unit,
        })),
      };
    })
  );

  return { ...rowToDrink(drinkRow), steps };
}

// ── 書き込み系 ────────────────────────────────────────────

export type StepInput = {
  description: string;
  isRequired: boolean;
};

export type CreateDrinkInput = {
  nameJa: string;
  shortCode?: string;
  category: Drink['category'];
  subCategory?: string;
  needsSleeve: boolean;
  specialEquipment?: string;
  memo?: string;
  practiceEnabled: boolean;
  steps: StepInput[];
};

export async function createDrink(input: CreateDrinkInput): Promise<number> {
  const db = getDB();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO drinks
       (name_ja, short_code, category, sub_category, needs_sleeve,
        special_equipment, recipe_type, practice_enabled, memo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?, ?, ?)`,
    [
      input.nameJa,
      input.shortCode ?? null,
      input.category,
      input.subCategory ?? null,
      input.needsSleeve ? 1 : 0,
      input.specialEquipment ?? null,
      input.practiceEnabled ? 1 : 0,
      input.memo ?? null,
      now,
      now,
    ]
  );
  const row = await db.getFirstAsync<{ id: number }>('SELECT last_insert_rowid() as id');
  const drinkId = row?.id ?? 0;

  for (let i = 0; i < input.steps.length; i++) {
    const s = input.steps[i];
    await db.runAsync(
      `INSERT INTO steps (drink_id, step_order, is_required, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [drinkId, i + 1, s.isRequired ? 1 : 0, s.description, now, now]
    );
  }

  return drinkId;
}

export async function updateDrink(id: number, input: CreateDrinkInput): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync<{ recipe_type: string }>(
    'SELECT recipe_type FROM drinks WHERE id = ?',
    [id]
  );
  if (!existing || existing.recipe_type !== 'user') {
    throw new Error('ERR_FORBIDDEN');
  }

  await db.runAsync(
    `UPDATE drinks SET
       name_ja = ?, short_code = ?, category = ?, sub_category = ?,
       needs_sleeve = ?, special_equipment = ?, practice_enabled = ?,
       memo = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.nameJa,
      input.shortCode ?? null,
      input.category,
      input.subCategory ?? null,
      input.needsSleeve ? 1 : 0,
      input.specialEquipment ?? null,
      input.practiceEnabled ? 1 : 0,
      input.memo ?? null,
      now,
      id,
    ]
  );

  await db.runAsync('DELETE FROM steps WHERE drink_id = ?', [id]);

  for (let i = 0; i < input.steps.length; i++) {
    const s = input.steps[i];
    await db.runAsync(
      `INSERT INTO steps (drink_id, step_order, is_required, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, i + 1, s.isRequired ? 1 : 0, s.description, now, now]
    );
  }
}

export async function deleteDrink(id: number): Promise<void> {
  const db = getDB();
  const existing = await db.getFirstAsync<{ recipe_type: string }>(
    'SELECT recipe_type FROM drinks WHERE id = ?',
    [id]
  );
  if (!existing || existing.recipe_type !== 'user') {
    throw new Error('ERR_FORBIDDEN');
  }
  await db.runAsync('DELETE FROM drinks WHERE id = ?', [id]);
}
