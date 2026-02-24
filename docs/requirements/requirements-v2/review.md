# 画面要件定義 v2: 振り返り・学習記録（M3-01〜M3-05）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| POST | /api/review-notes | 振り返り記録を新規作成 |
| GET | /api/review-notes | 振り返り一覧を取得（クエリパラメータ: month, q） |
| GET | /api/review-notes/:id | 振り返り詳細を取得 |
| PUT | /api/review-notes/:id | 振り返り記録を更新 |
| DELETE | /api/review-notes/:id | 振り返り記録を削除 |
| GET | /api/wrong-answers | 間違い問題リストを取得（クエリパラメータ: sort） |
| POST | /api/practice/sessions/review | 間違い問題セッションを作成 |
| PATCH | /api/wrong-answers/:drink_id/resolve | 間違い問題を消化（resolved=1に更新） |

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | カラム | 条件 |
|------|---------|--------|------|
| 振り返り保存 | review_notes | shift_date, good_things, mistakes, feedback, next_review, mood, created_at, updated_at | INSERT or UPDATE |
| 振り返り一覧取得 | review_notes | id, shift_date, good_things, mistakes, mood | 月フィルター・キーワード検索 |
| 振り返り詳細取得 | review_notes | 全カラム | id = :id |
| 振り返り削除 | review_notes | id | DELETE WHERE id=:id |
| 間違いリスト取得 | wrong_answers JOIN drinks | wrong_count, last_wrong_at, last_correct_at, resolved, name_ja | resolved=0 |
| 間違い消化更新 | wrong_answers | resolved, last_correct_at | UPDATE WHERE drink_id=:drink_id |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム |
|---------|---------|--------|
| シフト日ピッカー | review_notes | shift_date |
| うまくできたこと | review_notes | good_things |
| 難しかった・ミスしたこと | review_notes | mistakes |
| 先輩・店長からのフィードバック | review_notes | feedback |
| 次のシフトまでに復習すること | review_notes | next_review |
| 手応え選択 | review_notes | mood |
| 振り返りカード（日付） | review_notes | shift_date |
| 振り返りカード（手応え） | review_notes | mood |
| 振り返りカード（抜粋） | review_notes | good_things |
| 間違いドリンク名 | drinks | name_ja |
| 間違い回数 | wrong_answers | wrong_count |
| 最終間違い日 | wrong_answers | last_wrong_at |
| 最終正解日 | wrong_answers | last_correct_at |
| 消化フラグ | wrong_answers | resolved |
