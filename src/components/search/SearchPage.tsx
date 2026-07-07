import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import type { Account, SearchFilters, SearchParams } from '@/types';
import { DEFAULT_MAX_RESULTS, isPlatform } from '@/types';
import { useSearch } from '@/hooks/useSearch';
import { PlatformSelector } from './PlatformSelector';
import { SearchForm } from './SearchForm';
import { FilterPanel } from './FilterPanel';
import { ResultsPage } from '@/components/results/ResultsPage';
import { AccountDetailModal } from '@/components/detail/AccountDetailModal';

export function SearchPage() {
  const { platform: platformParam } = useParams<{ platform: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({});
  const [maxResultsByPlatform, setMaxResultsByPlatform] = useState(DEFAULT_MAX_RESULTS);
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { state, search, clear } = useSearch();

  const platform = isPlatform(platformParam) ? platformParam : 'x';
  const urlQuery = searchParams.get('q') ?? '';

  // プラットフォーム切替（URL遷移）時: URLにキーワードがあれば自動検索、なければ結果をクリア
  useEffect(() => {
    if (!isPlatform(platformParam)) return;
    if (urlQuery) {
      void search({ platform, query: urlQuery, queryType: 'keyword', filters, maxResults: maxResultsByPlatform[platform] });
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
    void search(params);
    setSearchParams(params.query ? { q: params.query } : {});
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
          <PlatformSelector value={platform} query={urlQuery} />
          <SearchForm
            platform={platform}
            initialQuery={urlQuery}
            filters={filters}
            maxResults={maxResultsByPlatform[platform]}
            loading={state.status === 'loading'}
            onSearch={handleSearch}
            onToggleFilter={() => setFilterCollapsed(v => !v)}
            filterCollapsed={filterCollapsed}
          />
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
