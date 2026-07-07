import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { SearchPage } from '@/components/search/SearchPage';
import { SettingsPage } from '@/components/settings/SettingsPage';

function PlatformRoute() {
  // プラットフォーム切替（URL遷移）時にErrorBoundaryの状態もリセットする
  const { platform } = useParams<{ platform: string }>();
  return (
    <ErrorBoundary key={platform}>
      <SearchPage />
    </ErrorBoundary>
  );
}

export function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/x" replace />} />
            <Route
              path="/settings"
              element={
                <ErrorBoundary key="settings">
                  <SettingsPage />
                </ErrorBoundary>
              }
            />
            <Route path="/:platform" element={<PlatformRoute />} />
            <Route path="*" element={<Navigate to="/x" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
