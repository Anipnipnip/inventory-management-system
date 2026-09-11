import { useEffect, useState } from 'react';
import * as reportService from '../../services/reportService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { formatNumber } from '../../utils/formatters';
import { Pagination } from '../../components/Pagination';

// The full, paginated version of the dashboard's low-stock preview
// (Phase 14 only shows a capped list of 20) -- same condition
// (quantity <= threshold), no filters on this endpoint.
export default function LowStockReport() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await reportService.getLowStockReport({ page });
        setRows(data.rows);
        setPagination(data.pagination);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [page]);

  return (
    <div>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading report...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No products are low on stock.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.product}-${index}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {row.name} <span className="text-slate-400">({row.sku})</span>
                  </td>
                  <td className="px-4 py-3 text-red-600">{formatNumber(row.quantity)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatNumber(row.lowStockThreshold)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
