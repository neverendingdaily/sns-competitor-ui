import type { Account } from '@/types';
import { getPlatformMeta, formatDate } from '@/types';

interface AccountCardProps {
  account: Account;
  onClick: (account: Account) => void;
}

export function AccountCard({ account: a, onClick }: AccountCardProps) {
  const meta = getPlatformMeta(a.platform);

  return (
    <tr className="account-row" onClick={() => onClick(a)}>
      <td>
        {/* アカウント名クリックで直接SNSへ遷移。行クリック(詳細モーダル)とは独立させる */}
        <a
          href={a.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="account-cell-user"
          onClick={e => e.stopPropagation()}
        >
          <img
            src={a.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="avatar"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          />
          <div>
            <div className="account-username">
              @{a.username}
              {a.isVerified && (
                <span className="badge badge-verified" style={{ marginLeft: 6 }}>✓</span>
              )}
            </div>
            <div className="account-displayname">{a.displayName}</div>
          </div>
        </a>
      </td>
      <td>
        <span
          className="badge badge-platform"
          style={{ color: meta.color }}
        >
          {meta.emoji} {meta.label}
        </span>
      </td>
      <td>
        {a.category && (
          <span
            className="badge"
            style={{
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
            }}
          >
            {a.category}
          </span>
        )}
      </td>
      <td>
        <div className="account-metric-muted">{formatDate(a.lastPostedAt)}</div>
      </td>
    </tr>
  );
}
