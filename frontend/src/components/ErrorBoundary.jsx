import { Component } from 'react';

// Catches rendering errors anywhere below it in the tree and shows a
// fallback UI instead of an unrecoverable blank page. This must be a
// class component -- React does not (yet) offer a hook equivalent of
// componentDidCatch/getDerivedStateFromError, so this is the one
// deliberate exception to the function-component style used
// everywhere else in this app.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real production deployment this is where the error would be
    // sent to a monitoring service (Sentry, etc.) -- logging to the
    // console is the reasonable stand-in for this project's scope.
    console.error('Unexpected error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow">
            <h1 className="text-xl font-semibold text-slate-800">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">
              An unexpected error occurred. Try reloading the page.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
