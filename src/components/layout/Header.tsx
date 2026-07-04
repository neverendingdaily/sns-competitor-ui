import type { AppPage } from '@/types';
import { getConfig } from '@/store/settings';

interface HeaderProps {
  activePage: AppPage;
  onNav: (page: AppPage) => void;
}

export function Header({ activePage, onNav }: HeaderProps) {
  const isMock = getConfig().useMock;

  return (
    <header className="header">
      <div className="header-logo">
        <span className="header-logo-icon">🔍</span>
        <span className="header-logo-text">SNS <span>競合リサーチ</span></span>
      </div>

      <nav className="header-nav">
        <button
          className={`header-nav-btn${activePage === 'search' ? ' active' : ''}`}
          onClick={() => onNav('search')}
        >
          🔎 検索
        </button>
        <button
          className={`header-nav-btn${activePage === 'settings' ? ' active' : ''}`}
          onClick={() => onNav('settings')}
        >
          ⚙️ 設定
        </button>
      </nav>

      <div className="header-right">
        {isMock && (
          <span className="badge badge-mock">モックデータ</span>
        )}
      </div>
    </header>
  );
}
