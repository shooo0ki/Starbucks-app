# 品質ゲート定義書

> スタバ研修アプリ — React Native / Expo プロジェクト
> 最終更新: 2026-02-22

---

## 1. 必須コマンド

| コマンド | 内容 | 失敗条件 |
|---|---|---|
| `npm run lint` | ESLint による静的解析 | warning 1件以上でも失敗（`--max-warnings 0`） |
| `npm run typecheck` | TypeScript 型チェック（`tsc --noEmit`） | 型エラー 1件以上で失敗 |
| `npm run format:check` | Prettier フォーマット確認 | 未フォーマットのファイルがあれば失敗 |
| `npm run test` | Jest によるユニットテスト | テスト失敗で失敗（現在は `--passWithNoTests`） |

---

## 2. 各コマンドの詳細

### 2-1. lint（ESLint）

- 設定ファイル: `eslint.config.js`（flat config）
- 対象: `app/**/*.{ts,tsx}`, `src/**/*.{ts,tsx}`
- 主なルール:
  - `@typescript-eslint/no-unused-vars` → error
  - `react-hooks/rules-of-hooks` → error
  - `react-hooks/exhaustive-deps` → warn（警告もCI失敗）
  - `no-console` → warn（`console.warn` / `console.error` は許可）

### 2-2. typecheck（TypeScript）

- 設定ファイル: `tsconfig.json`
- `strict: true` で全厳格チェックを有効化
- パスエイリアス `@/*` → `src/*` を有効化

### 2-3. format（Prettier）

- 設定ファイル: `.prettierrc`
- シングルクォート、末尾カンマあり、printWidth 100

### 2-4. test（Jest）

- 設定ファイル: `jest.config.js`
- プリセット: `jest-expo`（TODO: `npm install --save-dev jest-expo` が必要）
- テストファイル配置: `src/__tests__/*.test.ts` または `*.test.tsx`
- モジュールエイリアス `@/*` → `src/*` を Jest でも有効化

---

## 3. 失敗時の対応

| エラー | 対応 |
|---|---|
| `lint` 失敗 | エラー箇所をコードで修正。自動修正は `npx eslint --fix` |
| `typecheck` 失敗 | 型アノテーションを追加・修正 |
| `format:check` 失敗 | `npm run format` を実行して自動整形 |
| `test` 失敗 | テストロジックまたは実装コードを修正 |

---

## 4. PR前チェックリスト

```
[ ] npm run lint        → 0 warnings, 0 errors
[ ] npm run typecheck   → 0 errors
[ ] npm run format:check → 0 unformatted files
[ ] npm run test        → all tests pass (or no tests yet)
[ ] expo start で実機/シミュレーター動作確認済み
```

---

## 5. CI パイプライン

- ファイル: `.github/workflows/ci.yml`
- トリガー: `main` / `develop` へのプッシュ、`main` へのPR
- Node.js: 20 LTS
- 実行順: install → lint → typecheck → format:check → test

---

## 6. ローカルセットアップ（初回手順）

```bash
# 1. リポジトリをクローン
git clone <repo-url>
cd Starbucks-app

# 2. 依存をインストール
npm install --legacy-peer-deps

# 3. 開発サーバー起動
npm run start
# → QRコードをExpo Goで読み取る、またはシミュレーター起動

# 4. 品質チェックを実行
npm run lint
npm run typecheck
npm run format:check
npm run test
```

> **NOTE**: `npm install` には `--legacy-peer-deps` が必要です（react-dom の peer dep 問題）。
> `.npmrc` に `legacy-peer-deps=true` が設定済みなので、通常の `npm install` でも自動適用されます。
