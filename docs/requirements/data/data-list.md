# データ項目一覧（データ辞書）

**プロジェクト名**: スタバ研修アプリ
**バージョン**: 1.0
**作成日**: 2026-02-22

---

## 目次

1. [DRINK（ドリンクマスター）](#1-drinkドリンクマスター)
2. [STEP（手順マスター）](#2-step手順マスター)
3. [INGREDIENT（材料・分量マスター）](#3-ingredient材料分量マスター)
4. [CUSTOM_OPTION（カスタム選択肢マスター）](#4-custom_optionカスタム選択肢マスター)
5. [PRACTICE_SESSION（練習セッション）](#5-practice_session練習セッション)
6. [PRACTICE_RESULT（練習問題結果）](#6-practice_result練習問題結果)
7. [WRONG_ANSWER（間違い問題リスト）](#7-wrong_answer間違い問題リスト)
8. [USER_PROGRESS（ドリンク別習得度）](#8-user_progressドリンク別習得度)
9. [REVIEW_NOTE（振り返り記録）](#9-review_note振り返り記録)
10. [APP_SETTINGS（アプリ設定）](#10-app_settingsアプリ設定)

---

## 1. DRINK（ドリンクマスター）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| ドリンクID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | 全画面 |
| ドリンク名（日本語） | name_ja | TEXT | NOT NULL, 1〜100文字 | 正式なドリンク名称（例: カフェミスト） | M1-01, M1-02, M2-03 |
| 略称コード | short_code | TEXT | NULL可, 最大10文字, 半角英数字 | レジ表記コード（例: MIS, CM, GTL）。ユーザー登録時は省略可 | M1-01, M1-02 |
| カテゴリ | category | TEXT | NOT NULL, ENUM('hot','ice','frappuccino','seasonal','user_limited') | ドリンクの温度・種別カテゴリ | M1-01, M2-01 |
| サブカテゴリ | sub_category | TEXT | NULL可, 最大50文字 | エスプレッソ系・ティー系等のサブ分類 | M1-01 |
| スリーブ要否 | needs_sleeve | INTEGER | NOT NULL, DEFAULT 0, 0 or 1 | スリーブ装着が必要か（1=要, 0=不要）。SQLite は BOOLEAN を INTEGER で管理 | M1-02 |
| 特殊機材・注意事項 | special_equipment | TEXT | NULL可, 最大200文字 | バイタミックス使用等の特記事項 | M1-02 |
| レシピ種別 | recipe_type | TEXT | NOT NULL, ENUM('builtin','user') | システム組込みか、ユーザー作成かを識別する | M1-01, M1-02 |
| 練習対象フラグ | practice_enabled | INTEGER | NOT NULL, DEFAULT 1, 0 or 1 | 練習セッションに含めるか（1=含める, 0=除外） | M2-01 |
| メモ | memo | TEXT | NULL可, 最大500文字 | ユーザーが自由に書き込むメモ欄 | M1-02, M1-04 |
| 作成日時 | created_at | TEXT | NOT NULL, ISO8601形式 | レコード作成日時。builtin は初期データ投入日、user はユーザー登録日時 | M1-02 |
| 更新日時 | updated_at | TEXT | NOT NULL, ISO8601形式 | レコード最終更新日時 | M1-05 |

---

## 2. STEP（手順マスター）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| ステップID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M1-02, M2-03 |
| ドリンクID | drink_id | INTEGER | FK → DRINK.id, NOT NULL, ON DELETE CASCADE | 手順が属するドリンクを参照する外部キー | M1-02, M2-03 |
| ステップ番号 | step_order | INTEGER | NOT NULL, 1以上 | 手順の正しい順番（1始まりの連番）。並び替えでこの値を更新する | M1-02, M2-03 |
| 必須/任意フラグ | is_required | INTEGER | NOT NULL, DEFAULT 1, 0 or 1 | 1=必須ステップ, 0=任意ステップ（カスタム等）。任意は「(任意)」バッジで表示 | M1-02 |
| ステップ説明 | description | TEXT | NOT NULL, 1〜200文字 | 手順の説明文（例: エスプレッソをダブルショット抽出する） | M1-02, M2-03 |
| 作成日時 | created_at | TEXT | NOT NULL, ISO8601形式 | レコード作成日時 | — |
| 更新日時 | updated_at | TEXT | NOT NULL, ISO8601形式 | レコード最終更新日時 | — |

---

## 3. INGREDIENT（材料・分量マスター）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 材料ID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M1-02 |
| ステップID | step_id | INTEGER | FK → STEP.id, NOT NULL, ON DELETE CASCADE | 材料が属するステップを参照する外部キー | M1-02 |
| 材料名 | name | TEXT | NOT NULL, 1〜100文字 | 材料・シロップ等の名称（例: バニラシロップ, エスプレッソ） | M1-02 |
| ショート分量 | qty_short | INTEGER | NULL可, 0〜99 | Sサイズ（ショート）の分量。ポンプ数・ショット数等の数値 | M1-02 |
| トール分量 | qty_tall | INTEGER | NULL可, 0〜99 | Tサイズ（トール）の分量 | M1-02 |
| グランデ分量 | qty_grande | INTEGER | NULL可, 0〜99 | Gサイズ（グランデ）の分量 | M1-02 |
| ベンティ分量 | qty_venti | INTEGER | NULL可, 0〜99 | Vサイズ（ベンティ）の分量 | M1-02 |
| 単位 | unit | TEXT | NULL可, 最大20文字 | 分量の単位（例: ポンプ, ショット, ml, g）。省略可 | M1-02 |
| 作成日時 | created_at | TEXT | NOT NULL, ISO8601形式 | レコード作成日時 | — |

---

## 4. CUSTOM_OPTION（カスタム選択肢マスター）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| カスタムオプションID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M1-03 |
| カスタム種別 | custom_type | TEXT | NOT NULL, 最大50文字 | カスタムのグループ名（例: milk_change, syrup_add, shot_change） | M1-03 |
| 選択肢名（日本語） | option_name_ja | TEXT | NOT NULL, 最大50文字 | 選択肢の表示名（例: 豆乳, バニラ, エクストラ） | M1-03 |
| 対応カテゴリ | applicable_category | TEXT | NULL可 | 適用可能なドリンクカテゴリ（NULLは全カテゴリ共通） | M1-03 |
| 表示順 | display_order | INTEGER | NOT NULL, DEFAULT 0 | 選択肢の表示順序 | M1-03 |

---

## 5. PRACTICE_SESSION（練習セッション）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| セッションID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M2-05, M3-01, C-01 |
| 開始日時 | started_at | TEXT | NOT NULL, ISO8601形式 | 練習セッション開始日時 | C-01, M3-01 |
| 終了日時 | finished_at | TEXT | NULL可, ISO8601形式 | 練習セッション終了日時。未終了の場合はNULL | M2-05 |
| 難易度 | difficulty | TEXT | NOT NULL, ENUM('beginner','intermediate','advanced') | 選択した難易度 | M2-01, M2-05 |
| 練習カテゴリ | category_filter | TEXT | NOT NULL, ENUM('hot','ice','frappuccino','all') | 選択したカテゴリフィルター | M2-01, M2-05 |
| 正解数 | correct_count | INTEGER | NOT NULL, DEFAULT 0, 0〜10 | 10問中の正解数 | M2-05, C-01 |
| 総問題数 | total_count | INTEGER | NOT NULL, DEFAULT 10 | セッションの総問題数（通常は10。再練習セッションは可変） | M2-05 |
| 所要時間（秒） | duration_sec | INTEGER | NULL可, 0以上 | セッション完了までの所要時間（秒） | M2-05 |

---

## 6. PRACTICE_RESULT（練習問題結果）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 結果ID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M2-04 |
| セッションID | session_id | INTEGER | FK → PRACTICE_SESSION.id, NOT NULL, ON DELETE CASCADE | 所属する練習セッションの外部キー | M2-04, M2-05 |
| ドリンクID | drink_id | INTEGER | FK → DRINK.id, NOT NULL | 出題されたドリンクの外部キー | M2-04, M2-05 |
| サイズ | size | TEXT | NOT NULL, ENUM('S','T','G','V') | 出題されたサイズ | M2-03 |
| カスタム内容（JSON） | custom_json | TEXT | NULL可 | 付与されたカスタム内容をJSON文字列で保存（例: {"milk":"oat","syrup":"vanilla"}） | M2-03 |
| 正解フラグ | is_correct | INTEGER | NOT NULL, 0 or 1 | 1=正解, 0=不正解 | M2-04, M2-05 |
| ユーザー回答順（JSON） | user_answer_json | TEXT | NULL可 | ユーザーが並び替えたステップIDの配列をJSON文字列で保存 | M2-04 |
| 回答日時 | answered_at | TEXT | NOT NULL, ISO8601形式 | 問題の回答日時 | M3-04 |

---

## 7. WRONG_ANSWER（間違い問題リスト）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 間違いID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M3-04 |
| ドリンクID | drink_id | INTEGER | FK → DRINK.id, NOT NULL, UNIQUE | 間違えたドリンクの外部キー（1ドリンク1レコード） | M3-04, M3-05 |
| 間違え回数 | wrong_count | INTEGER | NOT NULL, DEFAULT 1, 1以上 | 同じドリンクで間違えた累計回数 | M3-04 |
| 最終間違い日時 | last_wrong_at | TEXT | NOT NULL, ISO8601形式 | 最後に間違えた日時 | M3-04 |
| 最終正解日時 | last_correct_at | TEXT | NULL可, ISO8601形式 | 最後に正解した日時。一度も正解していない場合はNULL | M3-04 |
| 消化フラグ | resolved | INTEGER | NOT NULL, DEFAULT 0, 0 or 1 | 1=再練習で正解して消化済み, 0=未消化（要復習） | M3-04, M3-05, C-01 |

---

## 8. USER_PROGRESS（ドリンク別習得度）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 進捗ID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | C-01, M1-01 |
| ドリンクID | drink_id | INTEGER | FK → DRINK.id, NOT NULL, UNIQUE | ドリンクの外部キー（1ドリンク1レコード） | C-01, M1-01 |
| 習得ステータス | status | TEXT | NOT NULL, DEFAULT 'not_started', ENUM('not_started','learning','mastered') | 未学習(not_started) / 学習中(learning) / 習得済み(mastered) | C-01, M1-01 |
| 練習回数 | practice_count | INTEGER | NOT NULL, DEFAULT 0, 0以上 | そのドリンクが練習で出題された累計回数 | — |
| 正解率 | correct_rate | REAL | NOT NULL, DEFAULT 0.0, 0.0〜1.0 | 累計の正解率（正解数 / 出題回数）。0除算はNULL制御 | C-01 |
| 初回閲覧日時 | first_viewed_at | TEXT | NULL可, ISO8601形式 | レシピ詳細を初めて閲覧した日時 | M1-02 |
| 最終練習日時 | last_practiced_at | TEXT | NULL可, ISO8601形式 | 最後に練習で出題された日時 | — |

---

## 9. REVIEW_NOTE（振り返り記録）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 振り返りID | id | INTEGER | PK, AUTO INCREMENT, NOT NULL | 自動採番のプライマリーキー | M3-01, M3-02, M3-03 |
| シフト日 | shift_date | TEXT | NOT NULL, 'YYYY-MM-DD'形式, UNIQUE | バイトシフトの日付（1シフト1レコード） | M3-02 |
| うまくできたこと | good_things | TEXT | NULL可, 最大500文字 | 自由記述テキスト | M3-01, M3-03 |
| 難しかった・ミスしたこと | mistakes | TEXT | NULL可, 最大500文字 | 自由記述テキスト | M3-01, M3-03 |
| 先輩・店長からのフィードバック | feedback | TEXT | NULL可, 最大500文字 | 自由記述テキスト | M3-01, M3-03 |
| 次のシフトまでに復習すること | next_review | TEXT | NULL可, 最大200文字 | 自由記述テキスト | M3-01, M3-03 |
| 全体的な手応え | mood | TEXT | NULL可, 'good'/'okay'/'bad' | 😊(good)・😐(okay)・😔(bad) の3択 | M3-01, M3-03 |
| 作成日時 | created_at | TEXT | NOT NULL, ISO8601形式 | レコード作成日時 | M3-02 |
| 更新日時 | updated_at | TEXT | NOT NULL, ISO8601形式 | レコード最終更新日時 | M3-03 |

---

## 10. APP_SETTINGS（アプリ設定）

| 論理名 | 物理名 | データ型 | 桁数・制約 | 説明・備考 | 関連画面 |
|--------|--------|---------|-----------|-----------|---------|
| 設定ID | id | INTEGER | PK, DEFAULT 1 | 常に1件のシングルトンレコード | C-02 |
| デフォルト難易度 | default_difficulty | TEXT | NOT NULL, DEFAULT 'beginner', ENUM('beginner','intermediate','advanced') | 練習設定のデフォルト難易度 | C-02, M2-01 |
| 制限時間ON/OFF | timer_enabled | INTEGER | NOT NULL, DEFAULT 0, 0 or 1 | 練習問題の制限時間有効フラグ | C-02, M2-03 |
| 分量クイズON/OFF | qty_quiz_enabled | INTEGER | NOT NULL, DEFAULT 0, 0 or 1 | 分量クイズ問題の有効フラグ | C-02, M2-03 |
| ハプティクスON/OFF | haptics_enabled | INTEGER | NOT NULL, DEFAULT 1, 0 or 1 | ドラッグ&ドロップ時のハプティクスフィードバック有効フラグ | C-02 |
| 更新日時 | updated_at | TEXT | NOT NULL, ISO8601形式 | 設定最終更新日時 | C-02 |
