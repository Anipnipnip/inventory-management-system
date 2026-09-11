import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/dashboardService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatters';
import { StatCard } from '../components/StatCard';

// Human-readable label + color for each StockTransaction type, used
// in the recent activity feed below.
const ACTIVITY_LABELS = {
  in: { label: 'Stock In', className: 'text-emerald-600' },
  out: { label: 'Stock Out', className: 'text-red-600' },
  'transfer-in': { label: 'Transfer In', className: 'text-blue-600' },
  'transfer-out': { label: 'Transfer Out', className: 'text-amber-600' },
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getDashboardSummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // Avoids setting state on an unmounted component if the user
    // navigates away before the request finishes.
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={formatNumber(summary.totalProducts)} />
        <StatCard label="Inventory Value" value={formatCurrency(summary.totalInventoryValue)} />
        <StatCard
          label="Low Stock Items"
          value={formatNumber(summary.lowStockCount)}
          hint="At or below threshold"
        />
        <StatCard
          label="Stock In / Out Today"
          value={`${formatNumber(summary.stockInToday.totalQuantity)} / ${formatNumber(
            summary.stockOutToday.totalQuantity
          )}`}
          hint={`${summary.stockInToday.count} in, ${summary.stockOutToday.count} out transactions`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-slate-800">Low Stock Products</h2>
          {summary.lowStockProducts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No products are low on stock.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {summary.lowStockProducts.map((item) => (
                  <tr key={`${item.product}-${item.sku}`} className="border-b border-slate-100">
                    <td className="py-2">
                      {item.name} <span className="text-slate-400">({item.sku})</span>
                    </td>
                    <td className="py-2 text-red-600">{formatNumber(item.quantity)}</td>
                    <td className="py-2 text-slate-500">{formatNumber(item.lowStockThreshold)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-lg bg-white p-5 shadow">
          <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
          {summary.recentActivity.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No stock movements yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {summary.recentActivity.map((activity) => {
                const meta = ACTIVITY_LABELS[activity.type];
                return (
                  <li key={activity._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">
                        {activity.product?.name}{' '}
                        <span className="text-slate-400">({activity.warehouse?.name})</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(activity.createdAt)} · {activity.performedBy?.name}
                      </p>
                    </div>
                    <span className={`font-medium ${meta.className}`}>
                      {meta.label} {formatNumber(activity.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
