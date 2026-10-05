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
        <div className="p-8 max-w-2xl mx-auto my-12 rounded-3xl bg-[#0B1B3D] border border-[#F79050]/50 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F79050]/20 border border-[#F79050]/40 flex items-center justify-center text-[#F79050] mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Regulatory View Recovery</h2>
          <p className="text-xs text-[#C6CBD9] leading-relaxed max-w-md mx-auto">
            A temporary component error occurred while rendering this regulatory dimension. Click below to refresh and re-synchronize live database state.
          </p>
          <div className="p-3 rounded-xl bg-[#07122A] text-left text-[11px] font-mono text-[#F79050] overflow-x-auto max-h-28">
            {this.state.error?.message || 'Unknown render exception'}
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#28B8B4] hover:bg-[#209f9b] text-[#09193C] font-extrabold text-xs transition flex items-center gap-2">
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
