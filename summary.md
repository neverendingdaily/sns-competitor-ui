# 実装サマリー（2026-07-02）

## やったこと

1. **モックモードをオフにして実バックエンドに接続**
2. **フロント/バック同時起動スクリプト `start_all.sh` を作成**
3. **実際にバックエンド・フロントエンドを起動して結合テストを実施**

---

## 1. モックモードOFF・実バックエンド接続

依頼は `src/api/client.ts` の修正でしたが、実際にmock/real切り替えを制御しているのは
**`src/store/settings.ts` の `DEFAULT_CONFIG`** です（`client.ts` はここから返される
`config.useMock` / `config.baseUrl` を読むだけで、切り替えロジック自体は持っていません）。
この設計はプロジェクトのルール（「localStorageアクセスは settings.ts のみ」「モック切替は
Settingsページのトグル経由」）に沿ったものだったため、`client.ts` 自体は変更せず、
実際の切替点である `settings.ts` のデフォルト値を変更しました。

`src/store/settings.ts`:
```diff
 const DEFAULT_CONFIG: ApiConfig = {
-  baseUrl: '',
+  baseUrl: 'http://localhost:8000',
   apiKey: '',
-  useMock: true,
+  useMock: false,
 };
```

- 初回アクセス（localStorageが空）でも自動的に実バックエンド（`http://localhost:8000`）に接続します。
- Settingsページで別のURLに変更したり、モックに戻したりすることも引き続き可能です（設定は
  localStorageに保存され、それが `DEFAULT_CONFIG` より優先されます）。
- 既存のブラウザで以前 `useMock: true` の設定を保存済みの場合は、その保存値が優先されて
  今回のデフォルト変更が効かないことがあります。その場合はSettingsページで
  「モックモード」トグルをOFFにするか、ブラウザのlocalStorageの
  `sns-competitor-api-config` キーを削除してください。

---

## 2. `start_all.sh`（フロント・バック同時起動スクリプト）

作成場所: `【Claude_Code_Output】/20260702_sns-competitor-ui/start_all.sh`

```bash
cd "【Claude_Code_Output】/20260702_sns-competitor-ui"
./start_all.sh
```

- バックエンド（`../20260702_sns-competitor-backend` の venv経由でuvicorn、ポート8000）を
  先に起動し、`/api/v1/health` に応答があるまで待機
- 続けてフロントエンド（`npm run dev`、ポート5173）を起動
- ログはそれぞれ `.backend.log` / `.frontend.log` に出力
- `Ctrl+C` で両方のプロセスを停止

前提条件（初回のみ、未実施ならエラーメッセージが出ます）:
```bash
# バックエンド側
cd "【Claude_Code_Output】/20260702_sns-competitor-backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
→ 今回確認したところ、バックエンドのvenvは**既に作成済み・依存関係インストール済み**でした。

---

## 3. 実施した結合テスト（結果）

実際にバックエンド（uvicorn, port 8000）とフロントエンド（Vite, port 5174でテスト起動）を
起動し、curlで疎通確認しました。

| テスト項目 | 結果 |
|---|---|
| `GET /api/v1/health` | ✅ `{"status":"ok","version":"0.1.0"}` |
| `POST /api/v1/accounts/search`（instagram, 未実装プラットフォーム） | ✅ `501` + `{"error":"instagram collector is not implemented yet"}`（client.tsが期待するエラー形式と一致） |
| CORS（`Origin: http://localhost:5173` からのpreflight） | ✅ `access-control-allow-origin: http://localhost:5173` を許可 |
| フロントエンド dev server 配信内容 | ✅ 更新後の `settings.ts`（`baseUrl: http://localhost:8000`, `useMock: false`）が実際にブラウザへ配信されることを確認 |
| `npm run typecheck` | ✅ エラーなし |

テスト後、起動した検証用プロセス（バックエンド8000番、フロントエンド5174番）は停止済みです。

※ ポート5173は元々別のプロセス（node, PID 2316）が使用中だったため、そちらには触れていません。
　自分で `start_all.sh` を実行する際、5173が使用中だと自動的に別ポート（5174など）に
　フォールバックする点はVite標準の挙動です。事前に元のプロセスを止めておくと5173で起動できます。

※ YouTube収集・X収集の実データ取得（実際のスクレイピング/API呼び出し）は今回のテストでは
　実行していません（YouTube APIキー未設定、Xスクレイピングは1回15〜25秒かかり外部サイトへの
　負荷もあるため）。エンドポイントの疎通・エラーハンドリング・CORSの結合確認に留めています。
　YouTube検索を試す場合は `20260702_sns-competitor-backend/.env` の `YOUTUBE_API_KEY` を
　設定してください。

---

## 明日の朝、動作確認する手順

```bash
cd "/Users/apple/【Claude_Code_Output】/20260702_sns-competitor-ui"
./start_all.sh
```

起動したら:
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8000/api/v1/health

ブラウザでフロントを開き、検索画面で「YouTube」を選んで検索すれば（YouTube APIキー設定済みなら）
実データが返ってくるはずです。X（Twitter）は検索に15〜25秒程度かかります。
Instagram / TikTok / Threads は未実装のため、検索するとエラー表示になります（想定通りの挙動）。

停止する場合は `start_all.sh` を実行しているターミナルで `Ctrl+C` してください。
