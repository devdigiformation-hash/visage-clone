import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white p-8">
          <div className="max-w-2xl w-full bg-[#111] border border-[#333] rounded-2xl p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-500 flex items-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              DIGI UI Crash Recovered
            </h1>
            <p className="text-[#CCC] mb-6 leading-relaxed">
              A critical error occurred in the React component tree. The rest of the OS is still running, but this specific UI panel crashed.
            </p>
            <div className="bg-black border border-[#222] p-4 rounded-xl font-mono text-xs overflow-x-auto mb-6 text-red-400">
              <div className="font-bold mb-2">{this.state.error && this.state.error.toString()}</div>
              <div className="text-[#888] whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</div>
            </div>
            <button
              className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
