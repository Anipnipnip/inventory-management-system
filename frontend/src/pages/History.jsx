import { useEffect, useState } from 'react';
import * as inventoryService from '../services/inventoryService';
import * as productService from '../services/productService';
import * as warehouseService from '../services/warehouseService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatNumber, formatDateTime } from '../utils/formatters';
import { STOCK_TRANSACTION_TYPES } from '../utils/stockTransactionTypes';
import { Pagination } from '../components/Pagination';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'transfer-in', label: 'Transfer In' },
  { value: 'transfer-out', label: 'Transfer Out' },
];

// Full audit log of stock movements, with the same filter+pagination
// pattern as the Products page (Phase 15) -- available to every role,
// matching the backend's inventoryRoutes.js (no authorize('admin') on
// GET /history).
export default function History() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [productFilter, setProductFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    productService.getProducts({ limit: 100, sortBy: 'name', sortOrder: 'asc' }).then((data) => setProducts(data.products)).catch(() => {});
    warehouseService.getWarehouses().then(setWarehouses).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [productFilter, warehouseFilter, typeFilter, startDate, endDate]);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await inventoryService.getHistory({
          product: productFilter || undefined,
          warehouse: warehouseFilter || undefined,
          type: typeFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
        });
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [productFilter, warehouseFilter, typeFilter, startDate, endDate, page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Stock History</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All products</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>

        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All warehouses</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse._id} value={warehouse._id}>
              {warehouse.name}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="self-center text-sm text-slate-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading history...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No stock movements found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">Stock Before → After</th>
                <th className="px-4 py-3 font-medium">By</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const meta = STOCK_TRANSACTION_TYPES[tx.type];
                return (
                  <tr key={tx._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(tx.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {tx.product?.name} <span className="text-slate-400">({tx.product?.sku})</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{tx.warehouse?.name}</td>
                    <td className={`px-4 py-3 font-medium ${meta.className}`}>{meta.label}</td>
                    <td className="px-4 py-3 text-slate-700">{formatNumber(tx.quantity)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatNumber(tx.previousStock)} → {formatNumber(tx.newStock)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{tx.performedBy?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}
    </div>
  );
}
