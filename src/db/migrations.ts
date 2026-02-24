import { initDB, getDB } from './client';
import { CREATE_TABLES_SQL } from './schema';
import { runSeed } from './seed';

export async function runMigrations(): Promise<void> {
  await initDB();
  const db = getDB();

  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(CREATE_TABLES_SQL);

  await ensureAppSettings();
  await runSeed();
}

async function ensureAppSettings(): Promise<void> {
  const db = getDB();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM app_settings WHERE id = 1'
  );
  if (!existing) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO app_settings (id, default_difficulty, timer_enabled, qty_quiz_enabled, haptics_enabled, updated_at)
       VALUES (1, 'beginner', 0, 0, 1, ?)`,
      [now]
    );
  }
}
