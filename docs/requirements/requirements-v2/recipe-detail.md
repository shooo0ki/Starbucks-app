# 画面要件定義 v2: レシピ詳細（M1-02 / M1-03）

**バージョン**: 2.0（DB連携版）
**作成日**: 2026-02-22

---

## 1. 使用する API エンドポイント（仮）

| メソッド | パス | 概要 |
|---------|------|------|
| GET | /api/drinks/:id | ドリンク詳細（基本情報 + 全ステップ + 材料）を取得 |
| GET | /api/drinks/:id/custom | カスタム選択肢一覧を取得 |
| PATCH | /api/progress/:drink_id | 習得ステータスを更新（初回閲覧時: not_started → learning） |

---

## 2. 参照・更新する DB テーブル・カラム

| 操作 | テーブル | 参照カラム | 条件 |
|------|---------|-----------|------|
| ドリンク基本情報取得 | drinks | id, name_ja, short_code, category, needs_sleeve, special_equipment, recipe_type, memo | id = :id |
| 手順一覧取得 | steps | id, drink_id, step_order, is_required, description | drink_id = :id ORDER BY step_order |
| 材料・分量取得 | ingredients | step_id, name, qty_short, qty_tall, qty_grande, qty_venti, unit | step_id IN (ステップIDリスト) |
| カスタム選択肢取得 | custom_options | custom_type, option_name_ja, applicable_category, display_order | 全取得 |
| 習得ステータス更新 | user_progress | drink_id, status, first_viewed_at | drink_id = :id, status を learning に更新 |

---

## 3. 画面項目と DB カラムのマッピング表

| UI 項目 | テーブル | カラム |
|---------|---------|--------|
| ドリンク名 | drinks | name_ja |
| 略称コード | drinks | short_code |
| カテゴリバッジ | drinks | category |
| スリーブアイコン | drinks | needs_sleeve |
| 特記事項 | drinks | special_equipment |
| メモ表示 | drinks | memo |
| ステップ番号 | steps | step_order |
| ステップ説明 | steps | description |
| 任意バッジ | steps | is_required |
| 材料名 | ingredients | name |
| Sサイズ分量 | ingredients | qty_short |
| Tサイズ分量 | ingredients | qty_tall |
| Gサイズ分量 | ingredients | qty_grande |
| Vサイズ分量 | ingredients | qty_venti |
| 分量単位 | ingredients | unit |
| カスタム選択パネル | custom_options | custom_type, option_name_ja |
