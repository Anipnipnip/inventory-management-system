import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as inventoryService from '../services/inventoryService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatNumber } from '../utils/formatters';
import { StockFormModal } from '../components/StockFormModal';
import { TransferFormModal } from '../components/TransferFormModal';
import { Alert } from '../components/Alert';

// Current stock levels across every product/warehouse combination.
// Stock In and Stock Out are available to every role (day-to-day
// work); Transfer is admin-only, matching the backend's
// inventoryRoutes.js.
export default function InventoryPage() {
  const { isAdmin } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [activeModal, setActiveModal] = useState(null); // 'in' | 'out' | 'transfer' | null

  const loadInventory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await inventoryService.getInventory();
      setInventory(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSaved = (message) => {
    setActiveModal(null);
    setSuccessMessage(message);
    loadInventory();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Inventory</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveModal('in')}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Stock In
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('out')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Stock Out
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveModal('transfer')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Transfer
            </button>
          )}
        </div>
      </div>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading inventory...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : inventory.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No stock recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Warehouse</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {row.product?.name} <span className="text-slate-400">({row.product?.sku})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.warehouse?.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatNumber(row.quantity)} {row.product?.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(activeModal === 'in' || activeModal === 'out') && (
        <StockFormModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onSaved={() => handleSaved(activeModal === 'in' ? 'Stock in recorded.' : 'Stock out recorded.')}
        />
      )}

      {activeModal === 'transfer' && (
        <TransferFormModal
          onClose={() => setActiveModal(null)}
          onSaved={() => handleSaved('Stock transfer recorded.')}
        />
      )}
    </div>
  );
}
