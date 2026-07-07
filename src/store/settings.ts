import type { ApiConfig, Platform, QueryType, SearchHistoryEntry } from '@/types';

const STORAGE_KEY = 'sns-competitor-api-config';
const HISTORY_KEY = 'sns-competitor-search-history';
const HISTORY_LIMIT = 50;

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://sns-competitor-backend.onrender.com',
  apiKey: '',
  useMock: false,
};

export function getConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) as Partial<ApiConfig> };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: ApiConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function getHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 同じプラットフォーム・検索種別・キーワードの履歴は重複させず、最新として先頭に上書きする
function isSameSearch(a: SearchHistoryEntry, platform: Platform, queryType: QueryType, query: string): boolean {
  return a.platform === platform && a.queryType === queryType && a.query.toLowerCase() === query.toLowerCase();
}

export function addHistoryEntry(params: { platform: Platform; query: string; queryType: QueryType }): SearchHistoryEntry[] {
  const query = params.query.trim();
  if (!query) return getHistory();

  const entry: SearchHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    platform: params.platform,
    query,
    queryType: params.queryType,
    searchedAt: new Date().toISOString(),
  };

  const rest = getHistory().filter(h => !isSameSearch(h, params.platform, params.queryType, query));
  const next = [entry, ...rest].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): SearchHistoryEntry[] {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}
