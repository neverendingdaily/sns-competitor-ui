import type { Account } from '@/types';
import { getPlatformMeta, formatFollowers, formatDate, formatPercent, formatCount } from '@/types';

interface AccountCardProps {
  account: Account;
  onClick: (account: Account) => void;
}

export function AccountCard({ account: a, onClick }: AccountCardProps) {
  const meta = getPlatformMeta(a.platform);

  return (
    <tr className="account-row" onClick={() => onClick(a)}>
      <td>
        <div className="account-cell-user">
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
        </div>
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
        <div className="account-metric">{formatFollowers(a.followers)}</div>
      </td>
      <td>
        <div className="account-metric">{formatPercent(a.engagementRate, 1)}%</div>
      </td>
      <td>
        <div className="account-metric-muted">{formatCount(a.postsCount)}</div>
      </td>
      <td>
        <div className="account-metric-muted">{formatDate(a.lastPostedAt)}</div>
      </td>
      <td>
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
      </td>
    </tr>
  );
}
