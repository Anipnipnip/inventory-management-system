// Small reusable summary card used across the dashboard (and later
// reports) for a single labeled figure, e.g. "Total Products: 42".
export const StatCard = ({ label, value, hint }) => (
  <div className="rounded-lg bg-white p-5 shadow">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);
