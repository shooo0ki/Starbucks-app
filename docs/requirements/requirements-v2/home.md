# 画面要件定義 v2: ホーム/ダッシュボード（C-01）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## v1 からの追加事項

v1 の機能要件・非機能要件・バリデーション・エラーケースはすべて引き継ぐ。
以下に API エンドポイント・DB 連携情報を追加する。

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| GET | /api/dashboard/summary | ダッシュボード集計データ（習得率・練習回数・要復習件数・苦手カテゴリ・直近振り返り）を一括取得 |

> **補足**: 本アプリはオフライン完全対応のため、API は SQLite へのローカルクエリのラッパーとして実装する。実装上は Service 層の関数として定義する。

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | 参照カラム | 条件 |
|------|---------|-----------|------|
| 習得率計算 | user_progress | status, drink_id | status = 'mastered' の件数 / 全件数 |
| 今週の練習回数 | practice_sessions | started_at, id | started_at が当週月〜日の COUNT |
| 要復習件数 | wrong_answers | resolved, id | resolved = 0 の COUNT |
| 苦手カテゴリ特定 | practice_results, drinks | is_correct, category | 直近 10 セッションのカテゴリ別正解率 |
| 直近振り返り | review_notes | learned_today, record_date | record_date が最新の 1 件 |
| ストリーク計算 | practice_results | is_correct, answered_at | 連続正解数の計算 |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム | 演算 |
|---------|---------|--------|------|
| 習得率進捗バー（X/46） | user_progress | status | COUNT WHERE status='mastered' |
| 習得率パーセント | user_progress | status | mastered件数 / 全DRINK件数 * 100 |
| 今週の練習回数 | practice_sessions | id, started_at | COUNT WHERE 当週 |
| 要復習件数バッジ | wrong_answers | id, resolved | COUNT WHERE resolved=0 |
| 苦手カテゴリ名 | practice_results JOIN drinks | is_correct, category | カテゴリ別正解率の最低値 |
| 直近振り返りスニペット | review_notes | learned_today | 最新レコードの先頭50文字 |
| 連続正解ストリーク | practice_results | is_correct, answered_at | 直近の連続 is_correct=1 件数 |
