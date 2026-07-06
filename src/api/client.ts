import type { Account, SearchParams, Platform } from '@/types';
import { getConfig } from '@/store/settings';
import { mockSearch } from './mock/search';
import { MOCK_ACCOUNTS } from './mock/data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// バックエンドのコールドサーチ（Discovery含む）は既知で30〜90秒、認証GraphQL経由の
// エンゲージメント算出込みだと最大120秒程度かかりうる（backend README「レイテンシと
// キャッシュ」参照）ため、searchは余裕を持ったタイムアウトにする。
// get_account/healthは単発リクエストのため短めでよい。
const SEARCH_TIMEOUT_MS = 120_000;
const DETAIL_TIMEOUT_MS = 20_000;
const HEALTH_TIMEOUT_MS = 5_000;

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        `リクエストがタイムアウトしました（${Math.round(timeoutMs / 1000)}秒）。` +
        'バックエンドが起動していないか、応答に時間がかかっています。'
      );
    }
    // fetch自体が例外を投げるのはDNS解決失敗・接続拒否など、レスポンスを受け取る前の
    // 接続レベルの失敗（サーバーが返す0件の検索結果とは明確に別の状態）。
    throw new Error(
      `バックエンド（${new URL(url).origin}）に接続できませんでした。起動しているか、` +
      'SettingsのbaseUrl設定を確認してください。'
    );
  } finally {
    clearTimeout(timer);
  }
}

// HTTPステータスごとに、単なる`{"error": string}`の転記より一段具体的な
// ユーザー向けメッセージを補う（バックエンドのfail-soft設計上、0件検索結果は
// 200 OKで返る＝ここに来ないため、ここに来るのは常に「接続または処理自体の失敗」）。
function describeStatus(status: number, backendMessage: string): string {
  switch (status) {
    case 502:
      return `外部サービス（SNS側）に接続できませんでした: ${backendMessage}`;
    case 501:
      return `このプラットフォームは未対応です: ${backendMessage}`;
    case 404:
      return backendMessage || 'アカウントが見つかりませんでした';
    case 401:
      return `APIキーが正しくありません: ${backendMessage}`;
    default:
      return backendMessage || `API ${status}`;
  }
}

async function parseErrorResponse(res: Response): Promise<Error> {
  const body = await res.text();
  let backendMessage = body;
  try { backendMessage = (JSON.parse(body) as { error: string }).error; } catch { /* use raw text */ }
  return new Error(describeStatus(res.status, backendMessage));
}

// res.ok=200であってもボディの形が想定と違えば（バックエンド側の想定外の変更等）
// 呼び出し元にAccount[]/Accountでない値をそのまま渡さない。壊れた形のままReactの
// state/レンダリングまで伝播させ、画面がクラッシュするより先にここで検知する。
async function parseJsonOrThrow(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    throw new Error('サーバーからの応答を解析できませんでした（不正なJSON）');
  }
}

async function parseAccountListResponse(res: Response): Promise<Account[]> {
  const data = await parseJsonOrThrow(res);
  if (!Array.isArray(data)) {
    throw new Error('サーバーからの応答が想定した形式（配列）ではありませんでした');
  }
  return data as Account[];
}

async function parseAccountResponse(res: Response): Promise<Account> {
  const data = await parseJsonOrThrow(res);
  if (typeof data !== 'object' || data === null || !('id' in data)) {
    throw new Error('サーバーからの応答が想定した形式ではありませんでした');
  }
  return data as Account;
}

export async function searchAccounts(params: SearchParams): Promise<Account[]> {
  if (params.maxResults === 0) {
    // ユーザーがこのプラットフォームの取得件数を0に設定した＝検索をスキップする
    // 意思表示。バックエンドへの通信自体を発生させず、成功・0件として即座に返す。
    return [];
  }

  const config = getConfig();

  if (config.useMock) {
    await delay(800);
    return mockSearch(params);
  }

  const res = await fetchWithTimeout(`${config.baseUrl}/api/v1/accounts/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify(params),
  }, SEARCH_TIMEOUT_MS);

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  // バックエンドは検索エンジン等の発見(discovery)失敗をfail-softで空配列(200 OK)として
  // 返す設計（backend README参照）。つまりここに到達した時点で「0件」は常に
  // 「検索は成功したが該当アカウントが無かった/取得元が一時的に利用できなかった」を
  // 意味し、上記のタイムアウト・接続エラーとは明確に別の状態として区別される
  // （呼び出し元のResultsPage側で「結果が見つかりませんでした」と表示する分岐に乗る）。
  return parseAccountListResponse(res);
}

export async function getAccountDetail(id: string, platform: Platform): Promise<Account> {
  const config = getConfig();

  if (config.useMock) {
    await delay(400);
    const found = MOCK_ACCOUNTS.find(a => a.id === id && a.platform === platform);
    if (!found) throw new Error('アカウントが見つかりません');
    return found;
  }

  const res = await fetchWithTimeout(`${config.baseUrl}/api/v1/accounts/${platform}/${id}`, {
    headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
  }, DETAIL_TIMEOUT_MS);

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return parseAccountResponse(res);
}

export async function checkHealth(): Promise<{ status: string; version: string }> {
  const config = getConfig();
  if (config.useMock) {
    await delay(300);
    return { status: 'ok (mock)', version: '0.0.0-mock' };
  }

  const res = await fetchWithTimeout(`${config.baseUrl}/api/v1/health`, {
    headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
  }, HEALTH_TIMEOUT_MS);
  if (!res.ok) throw await parseErrorResponse(res);
  return res.json() as Promise<{ status: string; version: string }>;
}
