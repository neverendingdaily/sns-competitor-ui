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
        <colgroup>
          <col style={{ width: '46%' }} />
          <col style={{ width: '16%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '18%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>アカウント</th>
            <th>プラットフォーム</th>
            <th>カテゴリ</th>
            <SortHeader field="lastPosted" label="最終投稿日" current={sortState} onSort={onSort} />
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
