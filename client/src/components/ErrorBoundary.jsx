import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NewRa UI Error Caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };


  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 rounded-3xl bg-[var(--surface-1)] border border-[var(--line)]/50 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--violet)]/20 border border-[var(--line)]/40 flex items-center justify-center text-[var(--lilac)] mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Regulatory View Recovery</h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed max-w-md mx-auto">
            A temporary component error occurred while rendering this regulatory dimension. Click below to refresh and re-synchronize live database state.
          </p>
          <div className="p-3 rounded-xl bg-[var(--bg)] text-left text-[11px] font-mono text-[var(--lilac)] overflow-x-auto max-h-28">
            {this.state.error?.message || 'Unknown render exception'}
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[var(--violet)] hover:bg-[var(--violet)] text-[var(--text)] font-extrabold text-xs transition flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
