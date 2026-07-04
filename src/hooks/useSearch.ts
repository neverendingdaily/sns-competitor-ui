import { useState, useCallback } from 'react';
import type { SearchState, SearchParams } from '@/types';
import { searchAccounts } from '@/api/client';

const INITIAL_STATE: SearchState = {
  status: 'idle',
  results: [],
  error: null,
  lastParams: null,
};

export function useSearch() {
  const [state, setState] = useState<SearchState>(INITIAL_STATE);

  const search = useCallback(async (params: SearchParams) => {
    setState({ status: 'loading', results: [], error: null, lastParams: params });
    try {
      const results = await searchAccounts(params);
      setState({ status: 'success', results, error: null, lastParams: params });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '検索に失敗しました';
      setState({ status: 'error', results: [], error: msg, lastParams: params });
    }
  }, []);

  const clear = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, search, clear };
}
