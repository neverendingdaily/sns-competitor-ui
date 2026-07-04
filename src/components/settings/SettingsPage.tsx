import { useState } from 'react';
import type { ApiConfig } from '@/types';
import { getConfig, saveConfig } from '@/store/settings';
import { checkHealth } from '@/api/client';

export function SettingsPage() {
  const [config, setConfig] = useState<ApiConfig>(getConfig);
  const [saved, setSaved] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  function update(partial: Partial<ApiConfig>) {
    setConfig(prev => ({ ...prev, ...partial }));
    setSaved(false);
    setHealthStatus(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleHealthCheck() {
    setHealthLoading(true);
    setHealthStatus(null);
    try {
      const res = await checkHealth();
      setHealthStatus(`✅ 接続成功 — status: ${res.status}, version: ${res.version}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setHealthStatus(`❌ 接続失敗: ${msg}`);
    } finally {
      setHealthLoading(false);
    }
  }

  const showWarning = !config.useMock && !config.baseUrl;

  return (
    <div className="settings-page">
      <div className="settings-content">
        <h1 className="settings-title">設定</h1>
        <p className="settings-subtitle">APIエンドポイントとデータソースの設定を管理します。</p>

        <form onSubmit={handleSave}>
          {/* データモード */}
          <div className="settings-section">
            <h2 className="settings-section-title">データモード</h2>
            <div className="card" style={{ padding: '16px 20px' }}>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">モックデータを使用</span>
                  <span className="toggle-desc">OFFにすると実際のバックエンドAPIを呼び出します</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.useMock}
                    onChange={e => update({ useMock: e.target.checked })}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            </div>
          </div>

          {/* API設定 */}
          <div className="settings-section">
            <h2 className="settings-section-title">バックエンドAPI設定</h2>

            {showWarning && (
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                <span>⚠️</span>
                <div>モックデータがOFFですが、Base URLが設定されていません。検索が失敗します。</div>
              </div>
            )}

            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="base-url">Base URL</label>
                <input
                  id="base-url"
                  className="form-input"
                  type="url"
                  placeholder="https://sns-competitor-backend.onrender.com"
                  value={config.baseUrl}
                  onChange={e => update({ baseUrl: e.target.value })}
                  disabled={config.useMock}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="api-key">APIキー（任意）</label>
                <input
                  id="api-key"
                  className="form-input"
                  type="password"
                  placeholder="Bearer トークン"
                  value={config.apiKey ?? ''}
                  onChange={e => update({ apiKey: e.target.value || undefined })}
                  disabled={config.useMock}
                />
              </div>

              {!config.useMock && (
                <div>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => { void handleHealthCheck(); }}
                    disabled={healthLoading || !config.baseUrl}
                  >
                    {healthLoading ? <span className="spinner" /> : '🔌 接続テスト'}
                  </button>
                  {healthStatus && (
                    <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      {healthStatus}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 保存ボタン */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" type="submit">
              💾 設定を保存
            </button>
            {saved && (
              <span className="badge" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                ✓ 保存しました
              </span>
            )}
          </div>
        </form>

        <div className="divider" style={{ margin: '32px 0' }} />

        {/* API仕様 */}
        <div className="settings-section">
          <h2 className="settings-section-title">バックエンドAPI仕様</h2>
          <div className="card" style={{ padding: 20 }}>
            <p className="section-title">実装すべきエンドポイント</p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 2, color: 'var(--color-text-muted)' }}>
              <div>GET  /api/v1/health</div>
              <div>POST /api/v1/accounts/search</div>
              <div>GET  /api/v1/accounts/{'{platform}'}/{'{id}'}</div>
            </div>
            <p style={{ marginTop: 12, fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
              詳細な仕様は CLAUDE.md を参照してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
