# カレンダーアプリ (MVP)

docs/calendar_spec.md の仕様に従い、React + TypeScript + Vite + Tailwind + date-fns で実装したMVPです。

## できること
- 月/週/日ビューの表示とナビゲーション
- 月ビューで複数日選択（クリックでトグル）、日/週ビューで時間帯ドラッグ選択（同一日）
- 選択範囲のプレビュー（例: `2025/10/12(日) 14:00–15:30`）
- 「コピー」ボタンでプレビュー文言をクリップボードへコピー（成功トースト / 失敗時の案内）
- タイムゾーンは Asia/Tokyo 固定、ISO8601はオフセット付き出力

## セットアップ

1. 依存関係をインストール

```
npm install
```

2. 開発サーバー起動

```
npm run dev
```

3. ビルド

```
npm run build && npm run preview
```

## 技術スタック
- React + TypeScript + Vite
- Tailwind CSS
- date-fns / date-fns-tz（日本語ロケールとAsia/Tokyoの書式）

## 補足
- 週ビューは7日分のグリッドを表示しますが、ドラッグ選択は同一日内に制限しています（MVP簡易仕様）。
- 「終日」は 00:00–24:00 選択時に `yyyy/MM/dd(EEE) 終日` と表示されます。
- 複数日選択時は各日1行でプレビュー/コピーします。
