'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });

    // Log to Sentry or monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo.componentStack);
    }

    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              {/* Error Card */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-6 backdrop-blur">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center mb-2">
                  Something Went Wrong
                </h2>

                {/* Message */}
                <p className="text-slate-300 text-center text-sm mb-4">
                  An unexpected error occurred. Our team has been notified.
                </p>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-3 mb-4">
                    <p className="text-xs text-red-400 font-mono mb-2">
                      {this.state.error.message}
                    </p>
                    <details className="text-xs text-slate-400">
                      <summary className="cursor-pointer hover:text-slate-300">
                        Stack Trace
                      </summary>
                      <pre className="mt-2 overflow-auto text-[10px]">
                        {this.state.errorInfo}
                      </pre>
                    </details>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                </div>

                {/* Support */}
                <p className="text-xs text-slate-400 text-center mt-4">
                  Need help? Contact{' '}
                  <a href="mailto:support@alterego.ai" className="text-blue-400 hover:text-blue-300">
                    support@alterego.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Async Error Boundary for server components
 * Handles errors from async operations
 */
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
