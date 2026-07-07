import { Link } from 'react-router-dom';
import type { Platform, QueryType } from '@/types';
import { PLATFORM_META } from '@/types';

interface PlatformSelectorProps {
  value: Platform;
  /** 現在このページで検索済みのキーワード（タブ遷移先のURLに引き継ぐ） */
  query: string;
  queryType: QueryType;
}

export function PlatformSelector({ value, query, queryType }: PlatformSelectorProps) {
  return (
    <div className="platform-selector">
      {PLATFORM_META.map(p => {
        const to = query ? `/${p.id}?q=${encodeURIComponent(query)}&type=${queryType}` : `/${p.id}`;
        return (
          <Link
            key={p.id}
            to={to}
            className={`platform-pill${value === p.id ? ' active' : ''}`}
            style={{ color: value === p.id ? p.color : undefined }}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
