# 画面要件定義 v2: 実践練習（M2-01〜M2-05）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| POST | /api/practice/sessions | 練習セッションを新規作成してオーダーを生成 |
| GET | /api/practice/sessions/:id | セッション情報とオーダーリストを取得 |
| POST | /api/practice/sessions/:id/results | 1問の採点結果を保存 |
| PATCH | /api/practice/sessions/:id/finish | セッションを終了し正解数・所要時間を更新 |
| GET | /api/practice/sessions/:id/summary | セッション終了後のサマリー（正解率・苦手ドリンク・経験値）を取得 |

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | カラム | 条件 |
|------|---------|--------|------|
| 練習対象ドリンク取得 | drinks | id, name_ja, category, practice_enabled | practice_enabled=1 かつカテゴリ条件 |
| セッション作成 | practice_sessions | difficulty, category_filter, started_at, total_count | INSERT |
| 問題ステップ取得 | steps | id, drink_id, step_order, is_required, description | drink_id = 出題ドリンク |
| 採点結果保存 | practice_results | session_id, drink_id, size, custom_json, is_correct, user_answer_json, answered_at | INSERT |
| 間違い登録/更新 | wrong_answers | drink_id, wrong_count, last_wrong_at, resolved | UPSERT（不正解時） |
| 正解時の間違い更新 | wrong_answers | last_correct_at | UPDATE（正解時） |
| セッション終了更新 | practice_sessions | correct_count, finished_at, duration_sec | UPDATE WHERE id=:id |
| 習得ステータス更新 | user_progress | status, practice_count, correct_rate, last_practiced_at | 直近5回全正解で mastered |
| サマリー取得 | practice_results, drinks | is_correct, category, drink_id | セッションID条件 |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム |
|---------|---------|--------|
| 難易度選択 | practice_sessions | difficulty |
| カテゴリ選択 | practice_sessions | category_filter |
| オーダーカード（ドリンク名） | drinks | name_ja |
| 問題ヘッダー（サイズ） | practice_results | size |
| 問題ヘッダー（カスタム） | practice_results | custom_json |
| 問題番号（X/10） | practice_sessions | total_count |
| ステップカード | steps | description, step_order |
| 正誤表示 | practice_results | is_correct |
| 正解率ゲージ | practice_sessions | correct_count, total_count |
| 苦手ドリンクリスト | practice_results JOIN drinks | is_correct=0, name_ja |
| 経験値（スコア加算分） | practice_sessions | correct_count |
| 連続正解ストリーク | practice_results | is_correct（連続カウント） |
