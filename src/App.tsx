import { useState } from 'react';
import type { AppPage } from '@/types';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { SearchPage } from '@/components/search/SearchPage';
import { SettingsPage } from '@/components/settings/SettingsPage';

export function App() {
  const [activePage, setActivePage] = useState<AppPage>('search');

  return (
    <div className="app-shell">
      <Header activePage={activePage} onNav={setActivePage} />
      <main className="main-content">
        {/* keyでページ切替時にバウンダリの状態をリセットする */}
        <ErrorBoundary key={activePage}>
          {activePage === 'search' ? <SearchPage /> : <SettingsPage />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
