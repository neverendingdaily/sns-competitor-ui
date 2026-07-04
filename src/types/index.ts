export type Platform = 'x' | 'threads' | 'instagram' | 'tiktok' | 'youtube';
export type QueryType = 'keyword' | 'hashtag' | 'category' | 'username';
export type SortField = 'followers' | 'engagement' | 'posts' | 'lastPosted';
export type SortOrder = 'asc' | 'desc';
export type AppPage = 'search' | 'settings';
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';
export type ExportFormat = 'csv' | 'json';

export interface Account {
  id: string;
  platform: Platform;
  username: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  engagementRate: number;
  isVerified: boolean;
  avatarUrl: string;
  profileUrl: string;
  category: string;
  lastPostedAt: string;
}

export interface SearchParams {
  platform: Platform;
  query: string;
  queryType: QueryType;
  filters: SearchFilters;
}

export interface SearchFilters {
  followersMin?: number;
  followersMax?: number;
  engagementMin?: number;
  verifiedOnly?: boolean;
  category?: string;
}

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  useMock: boolean;
}

export interface SearchState {
  status: SearchStatus;
  results: Account[];
  error: string | null;
  lastParams: SearchParams | null;
}

export interface SortState {
  field: SortField;
  order: SortOrder;
}

export interface PlatformMeta {
  id: Platform;
  label: string;
  emoji: string;
  color: string;
}

export const PLATFORM_META: PlatformMeta[] = [
  { id: 'x',         label: 'X (Twitter)', emoji: '𝕏',  color: '#000000' },
  { id: 'threads',   label: 'Threads',     emoji: '@',  color: '#101010' },
  { id: 'instagram', label: 'Instagram',   emoji: '📸', color: '#E1306C' },
  { id: 'tiktok',    label: 'TikTok',      emoji: '🎵', color: '#010101' },
  { id: 'youtube',   label: 'YouTube',     emoji: '▶',  color: '#FF0000' },
];

export function getPlatformMeta(platform: Platform): PlatformMeta {
  return PLATFORM_META.find(p => p.id === platform)!;
}

export function formatFollowers(n: number): string {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// バックエンド側のプラットフォーム限定実装（threads/tiktok等）は`engagementRate`/
// `postsCount`が`0`固定になる設計だが、将来バックエンドがフィールド自体を省略する
// （undefined）ケースが発生してもクラッシュしないよう、number以外は安全側に倒す。
export function formatPercent(n: number, digits = 1): string {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0.0';
  return n.toFixed(digits);
}

export function formatCount(n: number): string {
  if (typeof n !== 'number' || Number.isNaN(n)) return '0';
  return n.toLocaleString();
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function postsLabel(platform: Platform): string {
  return platform === 'youtube' ? '動画数' : '投稿数';
}

export function followersLabel(platform: Platform): string {
  return platform === 'youtube' ? 'チャンネル登録' : 'フォロワー';
}
