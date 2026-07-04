import { useState } from 'react';
import type { Account, Platform, SearchFilters } from '@/types';
import { useSearch } from '@/hooks/useSearch';
import { PlatformSelector } from './PlatformSelector';
import { SearchForm } from './SearchForm';
import { FilterPanel } from './FilterPanel';
import { ResultsPage } from '@/components/results/ResultsPage';
import { AccountDetailModal } from '@/components/detail/AccountDetailModal';

export function SearchPage() {
  const [platform, setPlatform] = useState<Platform>('x');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { state, search } = useSearch();

  return (
    <div className="search-page">
      {/* フィルターサイドバー */}
      <aside className={`search-sidebar${filterCollapsed ? ' collapsed' : ''}`}>
        <FilterPanel filters={filters} onChange={setFilters} />
      </aside>

      {/* メインエリア */}
      <div className="search-main">
        <div className="search-top">
          <PlatformSelector value={platform} onChange={p => { setPlatform(p); }} />
          <SearchForm
            platform={platform}
            filters={filters}
            loading={state.status === 'loading'}
            onSearch={params => { void search(params); }}
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
