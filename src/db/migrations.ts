import { initDB, getDB } from './client';
import { CREATE_TABLES_SQL } from './schema';
import { runSeed } from './seed';

export async function runMigrations(): Promise<void> {
  await initDB();
  const db = getDB();

  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // CREATE TABLE / CREATE INDEX を1文ずつ実行（web での execAsync 多文タイムアウト対策）
  const stmts = CREATE_TABLES_SQL
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const sql of stmts) {
    await db.execAsync(sql);
  }

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
