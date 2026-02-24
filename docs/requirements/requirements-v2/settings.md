# 画面要件定義 v2: 設定（C-02）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| GET | /api/settings | 現在の設定値を取得 |
| PATCH | /api/settings | 設定値を更新 |
| POST | /api/settings/reset | 全学習データをリセット |

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | カラム | 条件 |
|------|---------|--------|------|
| 設定取得 | app_settings | 全カラム | id = 1 |
| 設定更新 | app_settings | default_difficulty, timer_enabled, qty_quiz_enabled, haptics_enabled, updated_at | UPDATE WHERE id=1 |
| データリセット | user_progress | 全レコード | DELETE |
| データリセット | practice_sessions | 全レコード | DELETE（CASCADE で practice_results も削除） |
| データリセット | wrong_answers | 全レコード | DELETE |
| データリセット | review_notes | 全レコード | DELETE |
| データリセット | drinks | recipe_type = 'user' のレコード | DELETE WHERE recipe_type='user'（CASCADE） |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム |
|---------|---------|--------|
| デフォルト難易度セレクター | app_settings | default_difficulty |
| 制限時間トグル | app_settings | timer_enabled |
| 分量クイズトグル | app_settings | qty_quiz_enabled |
| ハプティクストグル | app_settings | haptics_enabled |
