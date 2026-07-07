# sns-competitor-ui

SNS競合アカウント調査ツール — フロントエンドUI

## コマンド

```bash
npm install          # 初回セットアップ
npm run dev          # Vite開発サーバー起動 (localhost:5173)
npm run build        # 本番ビルド
npm run typecheck    # TypeScript型チェックのみ
```

## アーキテクチャ

- **React 19 + Vite 6 + TypeScript 5** (純粋なSPA、サーバーなし)
- モックデータモードがデフォルト。Settingsページで切り替え可能

## 重要ルール

- `innerHTML` 使用禁止 — JSX または `textContent` のみ
- カラーコードのハードコード禁止 — `src/styles/global.css` の `--color-*` 変数を使う
- `fetch` 呼び出しは `src/api/client.ts` のみ (それ以外のファイルで直接fetchしない)
- `localStorage` アクセスは `src/store/settings.ts` のみ
- Firestore(検索履歴)アクセスは `src/store/history.ts` のみ

## バックエンド連携

`src/api/client.ts` が mock/realバックエンドの唯一の切替点。
バックエンド追加時はこのファイルのみ変更すればよい。

バックエンドが実装すべきREST API:
- `GET /api/v1/health`
- `POST /api/v1/accounts/search` (body: SearchParams → Account[])
- `GET /api/v1/accounts/{platform}/{id}` → Account

## 検索履歴（Firestore）

- `src/lib/firebase.ts` — Firebase初期化（`sns-competitor-ui`プロジェクト）。GitHub Pages配信のため`apiKey`等を直書きしている（Web用APIキーは非秘匿情報のため問題ないが、Firestoreセキュリティルール側でのアクセス制御が前提）
- `src/store/history.ts` — `searchHistory`コレクションのCRUD。同一条件（platform+queryType+query）は`encodeURIComponent`したキーを固定ドキュメントIDとして`setDoc`で上書きすることで重複を防ぎ、書き込みのたびに50件を超えた古い履歴を削除する
- UIは `SearchHistoryRow` + `SearchPage`の`subscribeHistory`によるリアルタイム購読
