import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// Web では openDatabaseAsync で WASM を初期化してから DB インスタンスを保持する
// ネイティブでも同じ async API を使うことで統一
export async function initDB(): Promise<void> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('starbucks_training.db');
  }
}

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('DB not initialized. Call initDB() first.');
  }
  return db;
}
