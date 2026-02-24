# 画面要件定義 v2: レシピ一覧（M1-01）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| GET | /api/drinks | ドリンク一覧を取得（クエリパラメータでフィルタリング） |
| DELETE | /api/drinks/:id | ユーザー作成レシピを削除 |

**クエリパラメータ（GET /api/drinks）**:
- `category`: hot / ice / frappuccino / seasonal / user_limited / all
- `sub_category`: サブカテゴリ名
- `q`: テキスト検索文字列（name_ja / short_code に対して LIKE 検索）

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | 参照カラム | 条件 |
|------|---------|-----------|------|
| ドリンク一覧取得 | drinks | id, name_ja, short_code, category, sub_category, needs_sleeve, recipe_type | カテゴリ・テキスト条件でフィルタリング |
| 習得ステータス結合 | user_progress | drink_id, status | drinks.id = user_progress.drink_id |
| ユーザーレシピ削除 | drinks, steps, ingredients, user_progress | id（CASCADE） | recipe_type = 'user' のみ許可 |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム |
|---------|---------|--------|
| ドリンク名 | drinks | name_ja |
| 略称コード | drinks | short_code |
| カテゴリバッジ | drinks | category |
| スリーブアイコン | drinks | needs_sleeve |
| 「ユーザー登録」バッジ | drinks | recipe_type |
| 習得度スター（☆/★/★★） | user_progress | status |
| カテゴリタブ | drinks | category |
| サブカテゴリフィルター | drinks | sub_category |
| テキスト検索 | drinks | name_ja, short_code |
