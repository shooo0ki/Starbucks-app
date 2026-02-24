import { initDB, getDB } from './client';
import { CREATE_TABLES_SQL } from './schema';
import { runSeed } from './seed';

export async function runMigrations(): Promise<void> {
  // WASM を非同期で初期化してからシンク操作を行う（Web でのタイムアウト対策）
  await initDB();
  const db = getDB();

  db.withTransactionSync(() => {
    db.execSync('PRAGMA foreign_keys = ON;');
    db.execSync(CREATE_TABLES_SQL);
  });

  await ensureAppSettings();
  await runSeed();
}

async function ensureAppSettings(): Promise<void> {
  const db = getDB();
  const existing = db.getFirstSync<{ id: number }>(
    'SELECT id FROM app_settings WHERE id = 1'
  );
  if (!existing) {
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO app_settings (id, default_difficulty, timer_enabled, qty_quiz_enabled, haptics_enabled, updated_at)
       VALUES (1, 'beginner', 0, 0, 1, ?)`,
      [now]
    );
  }
}
