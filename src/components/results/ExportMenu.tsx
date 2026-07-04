import type { Account, Platform } from '@/types';
import { useExport } from '@/hooks/useExport';

interface ExportMenuProps {
  accounts: Account[];
  platform: Platform;
}

export function ExportMenu({ accounts, platform }: ExportMenuProps) {
  const { exportCSV, exportJSON } = useExport();

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => exportCSV(accounts, platform)}
        disabled={accounts.length === 0}
        type="button"
      >
        📥 CSV
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => exportJSON(accounts, platform)}
        disabled={accounts.length === 0}
        type="button"
      >
        📥 JSON
      </button>
    </div>
  );
}
