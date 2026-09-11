import { useEffect, useState } from 'react';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import * as supplierService from '../services/supplierService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from './Modal';

const buildFormFromProduct = (product) =>
  product
    ? {
        name: product.name,
        sku: product.sku,
        category: product.category?._id || '',
        supplier: product.supplier?._id || '',
        unit: product.unit,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        lowStockThreshold: product.lowStockThreshold,
        description: product.description,
      }
    : {
        name: '',
        sku: '',
        category: '',
        supplier: '',
        unit: '',
        costPrice: '',
        sellingPrice: '',
        lowStockThreshold: 10,
        description: '',
      };

// Create/edit form for a single product. Category and supplier are
// dropdowns, so their options (only the active ones) have to be
// fetched before the form is genuinely usable -- see the loading guard
// below.
export const ProductFormModal = ({ product, onClose, onSaved }) => {
  const isEditing = Boolean(product);
  const [form, setForm] = useState(buildFormFromProduct(product));

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState('');

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([categoryService.getCategories(), supplierService.getSuppliers()])
      .then(([categoryList, supplierList]) => {
        setCategories(categoryList);
        setSuppliers(supplierList);
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

    // supplier is optional -- an empty string must become "no supplier"
    // rather than being sent as an invalid empty id.
    const payload = {
      ...form,
      supplier: form.supplier || undefined,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      lowStockThreshold: Number(form.lowStockThreshold),
    };

    try {
      const { product: saved, warning: saveWarning } = isEditing
        ? await productService.updateProduct(product._id, payload)
        : await productService.createProduct(payload);

      // The backend flags selling-below-cost as a non-blocking warning
      // (e.g. clearance sales are intentional) rather than an error --
      // the save still succeeds, so it's passed up to be shown on the
      // list page after this modal closes rather than getting lost here.
      onSaved(saved, saveWarning);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit Product' : 'Add Product'} onClose={onClose}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldError('name') && <p className="mt-1 text-xs text-red-600">{fieldError('name')}</p>}
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-slate-700">
                SKU
              </label>
              <input
                id="sku"
                type="text"
                required
                minLength={2}
                maxLength={30}
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldError('sku') && <p className="mt-1 text-xs text-red-600">{fieldError('sku')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldError('category') && (
                <p className="mt-1 text-xs text-red-600">{fieldError('category')}</p>
              )}
            </div>

            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">
                Supplier (optional)
              </label>
              <select
                id="supplier"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-slate-700">
                Unit
              </label>
              <input
                id="unit"
                type="text"
                required
                maxLength={20}
                placeholder="pcs, box, kg..."
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldError('unit') && <p className="mt-1 text-xs text-red-600">{fieldError('unit')}</p>}
            </div>

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-slate-700">
                Low stock at
              </label>
              <input
                id="lowStockThreshold"
                type="number"
                min={0}
                required
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-slate-700">
                Cost price (Rp)
              </label>
              <input
                id="costPrice"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldError('costPrice') && (
                <p className="mt-1 text-xs text-red-600">{fieldError('costPrice')}</p>
              )}
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-slate-700">
                Selling price (Rp)
              </label>
              <input
                id="sellingPrice"
                type="number"
                min={0}
                step="0.01"
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {fieldError('sellingPrice') && (
                <p className="mt-1 text-xs text-red-600">{fieldError('sellingPrice')}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              maxLength={1000}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
