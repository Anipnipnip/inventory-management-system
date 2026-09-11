import { useEffect, useState } from 'react';
import * as reportService from '../../services/reportService';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { formatCurrency, formatNumber } from '../../utils/formatters';

// How much money is tied up in stock, and where. Unlike the other two
// reports, this endpoint isn't paginated -- it always returns every
// row plus a grand total (see backend reportService.js), so there's
// no page state or Pagination component here.
export default function ValuationReport() {
  const [rows, setRows] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    reportService
      .getValuationReport()
      .then((data) => {
        if (isMounted) {
          setRows(data.rows);
          setGrandTotal(data.grandTotal);
        }
      })
      .catch((err) => {
        if (isMounted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <p className="text-sm text-slate-500">Loading report...</p>;
  if (error) return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;

  return (
    <div>
      <div className="rounded-lg bg-white p-5 shadow">
        <p className="text-sm font-medium text-slate-500">Total Inventory Value</p>
        <p className="mt-1 text-2xl font-semibold text-slate-800">{formatCurrency(grandTotal)}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No stock on hand.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Cost Price</th>
                <th className="px-4 py-3 font-medium">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.product}-${row.warehouse}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {row.name} <span className="text-slate-400">({row.sku})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.warehouse}</td>
                  <td className="px-4 py-3 text-slate-700">{formatNumber(row.quantity)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatCurrency(row.costPrice)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatCurrency(row.totalValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
