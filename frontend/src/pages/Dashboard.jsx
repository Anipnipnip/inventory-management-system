import { useAuth } from '../hooks/useAuth';

// Placeholder landing page after login -- proves the auth flow works
// end to end (token stored, user fetched, route protected). The real
// dashboard with summary stats and charts is built in Phase 14.
export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Logged in as <span className="font-medium">{user?.email}</span> ({user?.role})
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          This is a placeholder. The full dashboard (totals, low-stock alerts, recent activity)
          is built in the next phase.
        </p>
      </div>
    </div>
  );
}
