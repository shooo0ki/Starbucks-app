# 実装詳細計画書（detail-plan）

**プロジェクト名**: スタバ研修アプリ
**作成日**: 2026-02-22
**方針**: 縦切りスライス（VSA）で Phase 1 → 2 → 3 の順に実装

---

## 技術スタック

| 項目 | 採用 |
|------|------|
| フレームワーク | Expo SDK 51 + React Native |
| 言語 | TypeScript（strict） |
| ルーティング | Expo Router v3 |
| DB | expo-sqlite v14 |
| スタイリング | StyleSheet + NativeWind v4 |
| DnD | react-native-reanimated + gesture-handler |
| 状態管理 | Zustand |

---

## ディレクトリ構成

```
src/
  app/              # Expo Router ページ
    (tabs)/         # ボトムタブナビ
      index.tsx     # C-01: ホーム
      recipes.tsx   # M1-01: レシピ一覧
      practice.tsx  # M2-01: 練習設定
      review.tsx    # M3-02: 振り返り一覧
      settings.tsx  # C-02: 設定
    recipes/
      [id].tsx      # M1-02/03: レシピ詳細
      new.tsx       # M1-04: ユーザーレシピ登録
      [id]/edit.tsx # M1-05: ユーザーレシピ編集
    practice/
      [sessionId]/
        orders.tsx  # M2-02
        [orderIndex].tsx # M2-03
        feedback.tsx     # M2-04
      result.tsx    # M2-05
    review/
      new.tsx       # M3-01
      [id].tsx      # M3-03
    wrong-answers/
      index.tsx     # M3-04
      practice.tsx  # M3-05
  components/
    ui/             # 汎用UIコンポーネント
    drinks/         # ドリンク関連コンポーネント
    practice/       # 練習関連コンポーネント
    review/         # 振り返り関連コンポーネント
  db/
    schema.ts       # CREATE TABLE 定義
    migrations.ts   # マイグレーション実行
    seed.ts         # builtin シードデータ
    client.ts       # DB接続シングルトン
  services/
    drink.service.ts
    practice.service.ts
    review.service.ts
    wrong-answer.service.ts
    progress.service.ts
    dashboard.service.ts
    settings.service.ts
  hooks/
    useDrinks.ts
    usePracticeSession.ts
    useReviewNotes.ts
    useProgress.ts
    useSettings.ts
  types/
    drink.ts
    practice.ts
    review.ts
    progress.ts
    settings.ts
  constants/
    colors.ts
    sizes.ts
  utils/
    date.ts
    score.ts
```

---

## Phase 1: レシピ閲覧 MVP

### T-01: プロジェクト基盤構築
- [ ] `npx create-expo-app` で初期化
- [ ] TypeScript strict 設定
- [ ] 依存パッケージ追加（expo-sqlite, nativewind, reanimated, gesture-handler, zustand）
- [ ] ディレクトリ構成作成
- [ ] Expo Router ボトムタブ設定
- [ ] NativeWind 設定
- [ ] .env.example 作成

### T-02: DB初期化・スキーマ・シード
- [ ] `db/schema.ts`: CREATE TABLE 10テーブル
- [ ] `db/migrations.ts`: 初回起動時マイグレーション
- [ ] `db/seed.ts`: builtin ドリンク3品（カフェミスト・アメリカーノ・コーヒーフラペチーノ）
- [ ] `db/client.ts`: expo-sqlite シングルトン
- [ ] `app_settings` 初期レコード INSERT

### T-03: レシピ一覧（M1-01）
- [ ] `services/drink.service.ts`: getDrinks（フィルタリング・検索）
- [ ] `hooks/useDrinks.ts`
- [ ] `components/drinks/DrinkCard.tsx`
- [ ] `components/drinks/CategoryTabBar.tsx`
- [ ] `app/(tabs)/recipes.tsx`

### T-04: レシピ詳細（M1-02）
- [ ] `services/drink.service.ts`: getDrinkById
- [ ] `components/drinks/StepCard.tsx`
- [ ] `components/drinks/IngredientsTable.tsx`
- [ ] `app/recipes/[id].tsx`
- [ ] `services/progress.service.ts`: recordFirstViewed

### T-05: ホームダッシュボード（C-01）
- [ ] `services/dashboard.service.ts`: getDashboardSummary
- [ ] `components/ui/ProgressBar.tsx`
- [ ] `app/(tabs)/index.tsx`
- [ ] ボトムタブナビゲーション設定

### T-06: ユーザーレシピ登録/編集（M1-04, M1-05）
- [ ] `services/drink.service.ts`: createDrink / updateDrink / deleteDrink
- [ ] `components/drinks/RecipeForm.tsx`
- [ ] `components/drinks/StepFormCard.tsx`
- [ ] `app/recipes/new.tsx`
- [ ] `app/recipes/[id]/edit.tsx`

---

## Phase 2: 練習セッション（後続フェーズ）

### T-07: 練習設定・セッション生成（M2-01）
### T-08: オーダー並び替え（M2-02）
### T-09: 手順並び替え問題（M2-03）
### T-10: フィードバック（M2-04）
### T-11: セッション結果（M2-05）

---

## Phase 3: 振り返り・記録（後続フェーズ）

### T-12: 振り返り入力（M3-01）
### T-13: 振り返り一覧/詳細（M3-02, M3-03）
### T-14: 間違い問題一覧・再練習（M3-04, M3-05）
### T-15: 設定画面（C-02）
### T-16: ゲーミフィケーション（ストリーク・習得度・スコア）
