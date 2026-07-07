import { Link, useLocation } from 'react-router-dom';
import { isPlatform } from '@/types';
import { getConfig } from '@/store/settings';

export function Header() {
  const isMock = getConfig().useMock;
  const location = useLocation();

  const currentSegment = location.pathname.slice(1).split('/')[0];
  const isOnPlatformPage = isPlatform(currentSegment);
  const isSettings = location.pathname === '/settings';
  const searchHref = isOnPlatformPage ? `${location.pathname}${location.search}` : '/x';

  return (
    <header className="header">
      <Link className="header-logo" to="/x">
        <span className="header-logo-icon">🔍</span>
        <span className="header-logo-text">SNS <span>競合リサーチ</span></span>
      </Link>

      <nav className="header-nav">
        <Link
          className={`header-nav-btn${!isSettings ? ' active' : ''}`}
          to={searchHref}
        >
          🔎 検索
        </Link>
        <Link
          className={`header-nav-btn${isSettings ? ' active' : ''}`}
          to="/settings"
        >
          ⚙️ 設定
        </Link>
      </nav>

      <div className="header-right">
        {isMock && (
          <span className="badge badge-mock">モックデータ</span>
        )}
      </div>
    </header>
  );
}
