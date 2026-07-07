import { useEffect, useState } from 'react';
import type { Platform, QueryType, SearchFilters, SearchParams } from '@/types';

interface SearchFormProps {
  platform: Platform;
  /** URL(?q=)由来の初期キーワード。プラットフォーム切替やブックマーク読み込み時に入力欄へ反映する */
  initialQuery: string;
  /** URL(?type=)や履歴クリック由来の初期検索種別 */
  initialQueryType: QueryType;
  filters: SearchFilters;
  maxResults: number;
  loading: boolean;
  onSearch: (params: SearchParams) => void;
  onToggleFilter: () => void;
  filterCollapsed: boolean;
}

const QUERY_TYPES: { value: QueryType; label: string }[] = [
  { value: 'keyword', label: 'キーワード' },
  { value: 'hashtag', label: 'ハッシュタグ' },
  { value: 'category', label: 'カテゴリ' },
  { value: 'username', label: 'ユーザー名' },
];

export function SearchForm({ platform, initialQuery, initialQueryType, filters, maxResults, loading, onSearch, onToggleFilter, filterCollapsed }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery);
  const [queryType, setQueryType] = useState<QueryType>(initialQueryType);

  useEffect(() => {
    setQuery(initialQuery);
    setQueryType(initialQueryType);
  }, [initialQuery, initialQueryType]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({ platform, query, queryType, filters, maxResults });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <input
          className="form-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={
            queryType === 'keyword' ? '例: マーケティング' :
            queryType === 'hashtag' ? '例: マーケ (# 不要)' :
            queryType === 'category' ? '例: fitness' :
            '例: username123'
          }
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ minWidth: 90 }}
        >
          {loading ? <span className="spinner" /> : '🔍 検索'}
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={onToggleFilter}
          title={filterCollapsed ? 'フィルターを開く' : 'フィルターを閉じる'}
        >
          🎛️ {filterCollapsed ? 'フィルター' : '閉じる'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {QUERY_TYPES.map(qt => (
          <label key={qt.value} className="form-checkbox-label">
            <input
              type="radio"
              name="queryType"
              value={qt.value}
              checked={queryType === qt.value}
              onChange={() => setQueryType(qt.value)}
              style={{ accentColor: 'var(--color-accent)' }}
            />
            {qt.label}
          </label>
        ))}
      </div>
    </form>
  );
}
