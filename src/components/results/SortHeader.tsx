import type { SortField, SortState } from '@/types';

interface SortHeaderProps {
  field: SortField;
  label: string;
  current: SortState;
  onSort: (f: SortField) => void;
}

export function SortHeader({ field, label, current, onSort }: SortHeaderProps) {
  const isActive = current.field === field;

  return (
    <th
      className={`sort-header${isActive ? ' active' : ''}`}
      onClick={() => onSort(field)}
    >
      {label}
      <span className={`sort-icon${isActive ? ' active' : ''}`}>
        {isActive ? (current.order === 'asc' ? '▲' : '▼') : '⇅'}
      </span>
    </th>
  );
}
