import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Account, SearchFilters, SearchHistoryEntry, SearchParams } from '@/types';
import { DEFAULT_MAX_RESULTS, isPlatform, isQueryType } from '@/types';
import { useSearch } from '@/hooks/useSearch';
import { subscribeHistory, addHistoryEntry, clearHistory } from '@/store/history';
import { PlatformSelector } from './PlatformSelector';
import { SearchForm } from './SearchForm';
import { SearchHistoryRow } from './SearchHistoryRow';
import { FilterPanel } from './FilterPanel';
import { ResultsPage } from '@/components/results/ResultsPage';
import { AccountDetailModal } from '@/components/detail/AccountDetailModal';

export function SearchPage() {
  const { platform: platformParam } = useParams<{ platform: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SearchFilters>({});
  const [maxResultsByPlatform, setMaxResultsByPlatform] = useState(DEFAULT_MAX_RESULTS);
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  const { state, search, clear } = useSearch();

  const platform = isPlatform(platformParam) ? platformParam : 'x';
  const urlQuery = searchParams.get('q') ?? '';
  const urlQueryType = isQueryType(searchParams.get('type')) ? searchParams.get('type')! : 'keyword';

  // Firestore上の検索履歴をリアルタイム購読する（マウント時に1度だけ）
  useEffect(() => {
    const unsubscribe = subscribeHistory(setHistory);
    return unsubscribe;
  }, []);

  function recordHistory(params: SearchParams) {
    void addHistoryEntry({ platform: params.platform, query: params.query, queryType: params.queryType });
  }

  // プラットフォーム切替（URL遷移）時: URLにキーワードがあれば自動検索、なければ結果をクリア
  useEffect(() => {
    if (!isPlatform(platformParam)) return;
    if (urlQuery) {
      const params: SearchParams = { platform, query: urlQuery, queryType: urlQueryType, filters, maxResults: maxResultsByPlatform[platform] };
      void search(params);
      recordHistory(params);
    } else {
      clear();
    }
    // プラットフォーム切替（マウント）時にのみ実行する。filters等の変更では再実行しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, platformParam]);

  if (!isPlatform(platformParam)) {
    return <Navigate to="/x" replace />;
  }

  function handleSearch(params: SearchParams) {
    recordHistory(params);
    void search(params);
    setSearchParams(params.query ? { q: params.query, type: params.queryType } : {});
  }

  function handleHistorySelect(entry: SearchHistoryEntry) {
    if (entry.platform === platform) {
      handleSearch({ platform, query: entry.query, queryType: entry.queryType, filters, maxResults: maxResultsByPlatform[platform] });
    } else {
      navigate(`/${entry.platform}?q=${encodeURIComponent(entry.query)}&type=${entry.queryType}`);
    }
  }

  function handleHistoryClear() {
    void clearHistory();
  }

  return (
    <div className="search-page">
      {/* フィルターサイドバー */}
      <aside className={`search-sidebar${filterCollapsed ? ' collapsed' : ''}`}>
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          maxResultsByPlatform={maxResultsByPlatform}
          onChangeMaxResults={setMaxResultsByPlatform}
        />
      </aside>

      {/* メインエリア */}
      <div className="search-main">
        <div className="search-top">
          <PlatformSelector value={platform} query={urlQuery} queryType={urlQueryType} />
          <SearchForm
            platform={platform}
            initialQuery={urlQuery}
            initialQueryType={urlQueryType}
            filters={filters}
            maxResults={maxResultsByPlatform[platform]}
            loading={state.status === 'loading'}
            onSearch={handleSearch}
            onToggleFilter={() => setFilterCollapsed(v => !v)}
            filterCollapsed={filterCollapsed}
          />
          <SearchHistoryRow history={history} onSelect={handleHistorySelect} onClear={handleHistoryClear} />
        </div>

        <div className="search-results-area">
          <ResultsPage
            state={state}
            platform={platform}
            onSelect={setSelectedAccount}
          />
        </div>
      </div>

      {/* アカウント詳細モーダル */}
      <AccountDetailModal
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
      />
    </div>
  );
}
