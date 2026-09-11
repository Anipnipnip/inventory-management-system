import { useEffect, useState } from 'react';
import * as inventoryService from '../services/inventoryService';
import * as productService from '../services/productService';
import * as warehouseService from '../services/warehouseService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from './Modal';

// Admin-only (see Inventory.jsx) -- moves stock from one warehouse to
// another. Unlike Stock In/Out, both warehouses are required here: a
// transfer with no destination doesn't mean anything.
export const TransferFormModal = ({ onClose, onSaved }) => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  const [form, setForm] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 100, sortBy: 'name', sortOrder: 'asc' }),
      warehouseService.getWarehouses(),
    ])
      .then(([productData, warehouseList]) => {
        setProducts(productData.products);
        setWarehouses(warehouseList);
      })
      .catch((err) => setOptionsError(getErrorMessage(err)))
      .finally(() => setIsLoadingOptions(false));
  }, []);

  const fieldError = (field) => fieldErrors.find((f) => f.field === field)?.message;

  // Mirrors the backend's custom validator (see inventoryValidators.js
  // transferValidator) so the user gets instant feedback instead of a
  // round trip to the server for a mistake this obvious.
  const sameWarehouseSelected =
    form.fromWarehouseId && form.fromWarehouseId === form.toWarehouseId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (sameWarehouseSelected) {
      setError('Source and destination warehouse must be different');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await inventoryService.transferStock({
        productId: form.productId,
        fromWarehouseId: form.fromWarehouseId,
        toWarehouseId: form.toWarehouseId,
        quantity: Number(form.quantity),
        note: form.note || undefined,
      });
      onSaved(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Transfer Stock" onClose={onClose}>
      {isLoadingOptions ? (
        <p className="text-sm text-slate-500">Loading form...</p>
      ) : optionsError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{optionsError}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-slate-700">
              Product
            </label>
            <select
              id="productId"
              required
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select a product
              </option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {fieldError('productId') && (
              <p className="mt-1 text-xs text-red-600">{fieldError('productId')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromWarehouseId" className="block text-sm font-medium text-slate-700">
                From
              </label>
              <select
                id="fromWarehouseId"
                required
                value={form.fromWarehouseId}
                onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select warehouse
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="toWarehouseId" className="block text-sm font-medium text-slate-700">
                To
              </label>
              <select
                id="toWarehouseId"
                required
                value={form.toWarehouseId}
                onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select warehouse
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {sameWarehouseSelected && (
            <p className="text-xs text-red-600">Source and destination warehouse must be different</p>
          )}

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              step={1}
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError('quantity') && (
              <p className="mt-1 text-xs text-red-600">{fieldError('quantity')}</p>
            )}
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-slate-700">
              Note (optional)
            </label>
            <textarea
              id="note"
              maxLength={500}
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sameWarehouseSelected}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Transferring...' : 'Transfer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
