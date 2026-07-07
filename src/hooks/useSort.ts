import { useState, useMemo, useCallback } from 'react';
import type { Account, SortField, SortOrder, SortState } from '@/types';

const INITIAL_SORT: SortState = { field: 'lastPosted', order: 'desc' };

function compareAccounts(a: Account, b: Account, order: SortOrder): number {
  const diff = a.lastPostedAt.localeCompare(b.lastPostedAt);
  return order === 'asc' ? diff : -diff;
}

export function useSort(accounts: Account[]) {
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT);

  const setSort = useCallback((field: SortField) => {
    setSortState(prev =>
      prev.field === field
        ? { field, order: prev.order === 'desc' ? 'asc' : 'desc' }
        : { field, order: 'desc' }
    );
  }, []);

  const sortedAccounts = useMemo(
    () => [...accounts].sort((a, b) => compareAccounts(a, b, sortState.order)),
    [accounts, sortState]
  );

  return { sortState, setSort, sortedAccounts };
}
