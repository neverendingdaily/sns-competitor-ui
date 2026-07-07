import type { SearchHistoryEntry } from '@/types';
import { getPlatformMeta } from '@/types';

interface SearchHistoryRowProps {
  history: SearchHistoryEntry[];
  onSelect: (entry: SearchHistoryEntry) => void;
  onClear: () => void;
}

export function SearchHistoryRow({ history, onSelect, onClear }: SearchHistoryRowProps) {
  if (history.length === 0) return null;

  return (
    <div className="history-row">
      <span className="history-row-label">🕘 履歴</span>
      <div className="history-chip-list">
        {history.map(h => {
          const meta = getPlatformMeta(h.platform);
          return (
            <button
              key={h.id}
              type="button"
              className="history-chip"
              onClick={() => onSelect(h)}
              title={new Date(h.searchedAt).toLocaleString('ja-JP')}
            >
              <span>{meta.emoji}</span>
              <span>{h.query}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm history-clear-btn"
        onClick={onClear}
      >
        🗑️ クリア
      </button>
    </div>
  );
}
