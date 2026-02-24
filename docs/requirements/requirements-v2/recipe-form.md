# 画面要件定義 v2: ユーザーレシピ登録・編集（M1-04 / M1-05）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| POST | /api/drinks | ユーザーレシピを新規登録 |
| GET | /api/drinks/:id | 編集対象レシピの現在データを取得（M1-05用） |
| PUT | /api/drinks/:id | ユーザーレシピを更新（M1-05用） |
| DELETE | /api/drinks/:id | ユーザーレシピを削除（M1-05用） |

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | 操作カラム | 条件 |
|------|---------|----------|------|
| レシピ新規登録 | drinks | name_ja, short_code, category, sub_category, needs_sleeve, special_equipment, recipe_type('user'), practice_enabled, memo, created_at, updated_at | INSERT |
| ステップ登録 | steps | drink_id, step_order, is_required, description, created_at, updated_at | INSERT（複数） |
| 材料登録 | ingredients | step_id, name, qty_short, qty_tall, qty_grande, qty_venti, unit, created_at | INSERT（複数） |
| レシピ更新 | drinks | name_ja, short_code, category, sub_category, needs_sleeve, special_equipment, practice_enabled, memo, updated_at | UPDATE WHERE id=:id AND recipe_type='user' |
| ステップ更新 | steps | step_order, is_required, description, updated_at | DELETE + INSERT（ステップ全置換） |
| 材料更新 | ingredients | name, qty_short, qty_tall, qty_grande, qty_venti, unit | DELETE + INSERT（材料全置換） |
| レシピ削除 | drinks | id | DELETE WHERE id=:id AND recipe_type='user'（CASCADE） |

---

## 3. 画面項目と DB カラムのマッピング表

| フォーム入力項目 | テーブル | カラム |
|----------------|---------|--------|
| ドリンク名 | drinks | name_ja |
| 略称コード | drinks | short_code |
| カテゴリ | drinks | category |
| サブカテゴリ | drinks | sub_category |
| スリーブトグル | drinks | needs_sleeve |
| 特殊機材・注意事項 | drinks | special_equipment |
| メモ | drinks | memo |
| 練習対象トグル | drinks | practice_enabled |
| ステップ説明 | steps | description |
| ステップ任意フラグ | steps | is_required |
| ステップ順序 | steps | step_order |
| 材料名 | ingredients | name |
| Sサイズ分量 | ingredients | qty_short |
| Tサイズ分量 | ingredients | qty_tall |
| Gサイズ分量 | ingredients | qty_grande |
| Vサイズ分量 | ingredients | qty_venti |
| 単位 | ingredients | unit |
