import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// バックエンドは各プラットフォームのfail-soft設計上、フィールドが将来undefinedに
// なる可能性を完全には排除できない。想定外の描画例外でアプリ全体が白画面になる
// ことを避けるための最終防衛ライン（Reactのエラーバウンダリはクラスコンポーネント
// でのみ実装可能）。
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('UI rendering error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>表示中に問題が発生しました</div>
              <div>{this.state.error.message}</div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => this.setState({ error: null })}
              >
                再表示を試す
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
