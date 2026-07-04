import type { Account, Platform, SearchState } from '@/types';
import { useSort } from '@/hooks/useSort';
import { AccountTable } from './AccountTable';
import { ExportMenu } from './ExportMenu';
import { EmptyState } from './EmptyState';

interface ResultsPageProps {
  state: SearchState;
  platform: Platform;
  onSelect: (a: Account) => void;
}

export function ResultsPage({ state, platform, onSelect }: ResultsPageProps) {
  const { sortState, setSort, sortedAccounts } = useSort(state.results);

  if (state.status === 'idle') {
    return (
      <EmptyState
        icon="🔎"
        title="SNSアカウントを検索してください"
        description="プラットフォームを選択してキーワードや条件を入力すると、競合アカウントの一覧が表示されます。"
      />
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="empty-state">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <div className="empty-state-title" style={{ marginTop: 16 }}>検索中...</div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div style={{ padding: 24 }}>
        <div className="alert alert-error">
          <span>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>検索に失敗しました</div>
            <div>{state.error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (state.results.length === 0) {
    return (
      <EmptyState
        icon="😶"
        title="結果が見つかりませんでした"
        description="別のキーワードや条件を試してください。フィルターを緩めると結果が出やすくなります。"
      />
    );
  }

  return (
    <>
      <div className="results-bar">
        <span className="results-count">
          <strong>{sortedAccounts.length}</strong> 件のアカウントが見つかりました
          {state.lastParams && (
            <span style={{ marginLeft: 8, color: 'var(--color-text-faint)' }}>
              — {state.lastParams.platform.toUpperCase()} / {state.lastParams.query || '全件'}
            </span>
          )}
        </span>
        <ExportMenu accounts={sortedAccounts} platform={platform} />
      </div>
      <AccountTable
        accounts={sortedAccounts}
        sortState={sortState}
        onSort={setSort}
        onSelect={onSelect}
      />
    </>
  );
}
