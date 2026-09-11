import { Link } from 'react-router-dom';

// Catch-all for any URL that doesn't match a defined route (see the
// path="*" route in App.jsx, which must stay last so it only matches
// when nothing else does).
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-semibold text-slate-800">404</h1>
        <p className="mt-2 text-sm text-slate-500">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
