import { useEffect, useRef } from 'react';
import type { Account } from '@/types';
import { getPlatformMeta, formatFollowers, formatDate, formatPercent, formatCount, followersLabel, postsLabel } from '@/types';

interface AccountDetailModalProps {
  account: Account | null;
  onClose: () => void;
}

export function AccountDetailModal({ account, onClose }: AccountDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!account) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [account, onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  if (!account) return null;

  const meta = getPlatformMeta(account.platform);

  return (
    <div className="modal-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label={account.displayName}>
        <div className="modal-header">
          <div className="account-detail-header" style={{ flex: 1 }}>
            <img
              src={account.avatarUrl}
              alt=""
              width={64}
              height={64}
              className="avatar"
              onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
            />
            <div className="account-detail-meta">
              <div className="account-detail-name">{account.displayName}</div>
              <div className="account-detail-handle">@{account.username}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span
                  className="badge badge-platform"
                  style={{ color: meta.color }}
                >
                  {meta.emoji} {meta.label}
                </span>
                {account.isVerified && (
                  <span className="badge badge-verified">✓ 認証済み</span>
                )}
                <span
                  className="badge"
                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                >
                  {account.category}
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="閉じる">✕</button>
        </div>

        <div className="modal-body">
          {account.bio && (
            <p className="account-detail-bio">{account.bio}</p>
          )}

          <div className="account-metrics-grid">
            <div className="metric-box">
              <div className="metric-box-value">{formatFollowers(account.followers)}</div>
              <div className="metric-box-label">{followersLabel(account.platform)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-box-value">{formatPercent(account.engagementRate, 2)}%</div>
              <div className="metric-box-label">エンゲージメント率</div>
            </div>
            <div className="metric-box">
              <div className="metric-box-value">{formatCount(account.postsCount)}</div>
              <div className="metric-box-label">{postsLabel(account.platform)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-box-value">{formatFollowers(account.following)}</div>
              <div className="metric-box-label">フォロー中</div>
            </div>
            <div className="metric-box" style={{ gridColumn: 'span 2' }}>
              <div className="metric-box-value" style={{ fontSize: 'var(--text-base)' }}>
                {formatDate(account.lastPostedAt)}
              </div>
              <div className="metric-box-label">最終投稿日</div>
            </div>
          </div>

          <div className="account-detail-actions">
            <a
              href={account.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              🔗 プロフィールを開く
            </a>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(account.username);
              }}
            >
              📋 ユーザー名をコピー
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
