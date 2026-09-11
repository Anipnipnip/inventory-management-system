import { useEffect, useState } from 'react';
import * as inventoryService from '../services/inventoryService';
import * as productService from '../services/productService';
import * as warehouseService from '../services/warehouseService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from './Modal';

// Shared form for Stock In and Stock Out -- the two are identical
// (pick a product, a warehouse, a quantity, an optional note), they
// only differ in which endpoint gets called, so `type` picks that
// instead of duplicating the whole form.
export const StockFormModal = ({ type, onClose, onSaved }) => {
  const isStockIn = type === 'in';

  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  const [form, setForm] = useState({ productId: '', warehouseId: '', quantity: '', note: '' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setIsSubmitting(true);

    // An unselected warehouse means "use whichever warehouse is marked
    // as default" -- the backend resolves that, so an empty value here
    // must become undefined rather than an invalid empty id.
    const payload = {
      productId: form.productId,
      warehouseId: form.warehouseId || undefined,
      quantity: Number(form.quantity),
      note: form.note || undefined,
    };

    try {
      const action = isStockIn ? inventoryService.stockIn : inventoryService.stockOut;
      const result = await action(payload);
      onSaved(result);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isStockIn ? 'Stock In' : 'Stock Out'} onClose={onClose}>
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

          <div>
            <label htmlFor="warehouseId" className="block text-sm font-medium text-slate-700">
              Warehouse
            </label>
            <select
              id="warehouseId"
              value={form.warehouseId}
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Use default warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse._id} value={warehouse._id}>
                  {warehouse.name}
                  {warehouse.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>
          </div>

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
              disabled={isSubmitting}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isStockIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : isStockIn ? 'Record Stock In' : 'Record Stock Out'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
