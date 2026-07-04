import { useCallback } from 'react';
import type { Account, Platform } from '@/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

export function useExport() {
  const exportCSV = useCallback((accounts: Account[], platform: Platform) => {
    const headers = [
      'username', 'displayName', 'platform', 'followers', 'following',
      'postsCount', 'engagementRate', 'isVerified', 'category', 'lastPostedAt',
      'bio', 'profileUrl',
    ];
    const rows = accounts.map(a =>
      headers.map(h => {
        const val = a[h as keyof Account];
        const str = String(val ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `sns-competitors-${platform}-${today()}.csv`);
  }, []);

  const exportJSON = useCallback((accounts: Account[], platform: Platform) => {
    const blob = new Blob([JSON.stringify(accounts, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `sns-competitors-${platform}-${today()}.json`);
  }, []);

  return { exportCSV, exportJSON };
}
