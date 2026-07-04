import { useState, useMemo, useCallback } from 'react';
import type { Account, SortField, SortOrder, SortState } from '@/types';

const INITIAL_SORT: SortState = { field: 'followers', order: 'desc' };

function compareAccounts(a: Account, b: Account, field: SortField, order: SortOrder): number {
  let diff = 0;
  switch (field) {
    case 'followers':   diff = a.followers - b.followers; break;
    case 'engagement':  diff = a.engagementRate - b.engagementRate; break;
    case 'posts':       diff = a.postsCount - b.postsCount; break;
    case 'lastPosted':  diff = a.lastPostedAt.localeCompare(b.lastPostedAt); break;
  }
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
    () => [...accounts].sort((a, b) => compareAccounts(a, b, sortState.field, sortState.order)),
    [accounts, sortState]
  );

  return { sortState, setSort, sortedAccounts };
}
