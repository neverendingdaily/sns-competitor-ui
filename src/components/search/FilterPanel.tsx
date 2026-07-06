import { PLATFORM_META } from '@/types';
import type { MaxResultsByPlatform, SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
  maxResultsByPlatform: MaxResultsByPlatform;
  onChangeMaxResults: (next: MaxResultsByPlatform) => void;
}

export function FilterPanel({ filters, onChange, maxResultsByPlatform, onChangeMaxResults }: FilterPanelProps) {
  function update(partial: Partial<SearchFilters>) {
    onChange({ ...filters, ...partial });
  }

  function clearAll() {
    onChange({});
  }

  function updateMaxResults(platform: keyof MaxResultsByPlatform, value: number) {
    const clamped = Math.max(0, Math.min(50, Math.round(value)));
    onChangeMaxResults({ ...maxResultsByPlatform, [platform]: clamped });
  }

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== false);

  return (
    <>
      <div className="filter-header">
        <span className="filter-title">🎛️ フィルター</span>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearAll} type="button">
            クリア
          </button>
        )}
      </div>

      <div className="filter-panel">
        <div className="form-group">
          <label className="form-label">フォロワー数</label>
          <div className="form-range-row">
            <input
              className="form-input"
              type="number"
              placeholder="最小"
              min={0}
              value={filters.followersMin ?? ''}
              onChange={e => update({ followersMin: e.target.value ? Number(e.target.value) : undefined })}
            />
            <span className="form-range-sep">〜</span>
            <input
              className="form-input"
              type="number"
              placeholder="最大"
              min={0}
              value={filters.followersMax ?? ''}
              onChange={e => update({ followersMax: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">エンゲージメント率（最小 %）</label>
          <input
            className="form-input"
            type="number"
            placeholder="例: 2.5"
            min={0}
            max={100}
            step={0.1}
            value={filters.engagementMin ?? ''}
            onChange={e => update({ engagementMin: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">カテゴリ</label>
          <input
            className="form-input"
            type="text"
            placeholder="例: fitness, marketing"
            value={filters.category ?? ''}
            onChange={e => update({ category: e.target.value || undefined })}
          />
        </div>

        <label className="form-checkbox-label">
          <input
            type="checkbox"
            checked={filters.verifiedOnly ?? false}
            onChange={e => update({ verifiedOnly: e.target.checked || undefined })}
          />
          認証済みアカウントのみ
        </label>

        <div className="form-group">
          <label className="form-label">取得件数（上限・プラットフォーム別）</label>
          {PLATFORM_META.map(p => (
            <div key={p.id} className="form-range-row" style={{ marginBottom: '6px' }}>
              <span style={{ flex: 1 }}>{p.emoji} {p.label}</span>
              <input
                className="form-input"
                type="number"
                min={0}
                max={50}
                style={{ width: '72px', flex: 'none' }}
                value={maxResultsByPlatform[p.id]}
                onChange={e => updateMaxResults(p.id, e.target.value ? Number(e.target.value) : 0)}
              />
            </div>
          ))}
          <div className="empty-state-desc" style={{ marginTop: '2px' }}>
            0を指定するとそのプラットフォームの検索をスキップします
          </div>
        </div>
      </div>
    </>
  );
}
