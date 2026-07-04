import type { Platform } from '@/types';
import { PLATFORM_META } from '@/types';

interface PlatformSelectorProps {
  value: Platform;
  onChange: (p: Platform) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="platform-selector">
      {PLATFORM_META.map(p => (
        <button
          key={p.id}
          className={`platform-pill${value === p.id ? ' active' : ''}`}
          style={{ color: value === p.id ? p.color : undefined }}
          onClick={() => onChange(p.id)}
          type="button"
        >
          <span>{p.emoji}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
