import type { Account, SortState, SortField } from '@/types';
import { AccountCard } from './AccountCard';
import { SortHeader } from './SortHeader';

interface AccountTableProps {
  accounts: Account[];
  sortState: SortState;
  onSort: (f: SortField) => void;
  onSelect: (a: Account) => void;
}

export function AccountTable({ accounts, sortState, onSort, onSelect }: AccountTableProps) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>アカウント</th>
            <th>プラットフォーム</th>
            <SortHeader field="followers"   label="フォロワー"    current={sortState} onSort={onSort} />
            <SortHeader field="engagement"  label="エンゲ率"      current={sortState} onSort={onSort} />
            <SortHeader field="posts"       label="投稿数"        current={sortState} onSort={onSort} />
            <SortHeader field="lastPosted"  label="最終投稿"      current={sortState} onSort={onSort} />
            <th>カテゴリ</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => (
            <AccountCard key={a.id} account={a} onClick={onSelect} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
