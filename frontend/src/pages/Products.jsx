import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import * as supplierService from '../services/supplierService';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatCurrency } from '../utils/formatters';
import { ProductFormModal } from '../components/ProductFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import { Alert } from '../components/Alert';

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'sellingPrice-asc', label: 'Price (Low to High)' },
  { value: 'sellingPrice-desc', label: 'Price (High to Low)' },
  { value: 'createdAt-desc', label: 'Newest first' },
];

export default function Products() {
  const { isAdmin } = useAuth();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [sortValue, setSortValue] = useState('name-asc');
  const [page, setPage] = useState(1);
  const [showInactive, setShowInactive] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState('');

  // Filter dropdown options only need to be fetched once -- they don't
  // depend on anything below.
  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
    supplierService.getSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  // Any filter change should reset back to page 1 -- staying on page 3
  // of a new, smaller result set would just show an empty page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, supplierFilter, sortValue, showInactive]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError('');
    const [sortBy, sortOrder] = sortValue.split('-');

    try {
      const data = await productService.getProducts({
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        supplier: supplierFilter || undefined,
        sortBy,
        sortOrder,
        page,
        includeInactive: showInactive || undefined,
      });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryFilter, supplierFilter, sortValue, page, showInactive]);

  const handleSaved = (_product, warning) => {
    setEditingProduct(null);
    setIsCreating(false);
    setSuccessMessage(warning || (editingProduct ? 'Product updated.' : 'Product created.'));
    loadProducts();
  };

  const handleConfirmAction = async () => {
    setActionError('');
    try {
      if (pendingAction.type === 'deactivate') {
        await productService.deactivateProduct(pendingAction.product._id);
      } else {
        await productService.restoreProduct(pendingAction.product._id);
      }
      setSuccessMessage(
        pendingAction.type === 'deactivate' ? 'Product deactivated.' : 'Product restored.'
      );
      setPendingAction(null);
      loadProducts();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Products</h1>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Add Product
          </button>
        )}
      </div>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name or SKU..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All suppliers</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </select>

        <select
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isAdmin && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Show inactive
          </label>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading products...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No products found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Selling</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Status</th>}
                {isAdmin && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{product.name}</td>
                  <td className="px-4 py-3 text-slate-500">{product.sku}</td>
                  <td className="px-4 py-3 text-slate-500">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{product.supplier?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatCurrency(product.costPrice)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatCurrency(product.sellingPrice)}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        {product.isActive ? (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ product, type: 'deactivate' })}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingAction({ product, type: 'restore' })}
                            className="font-medium text-emerald-600 hover:underline"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && <Pagination pagination={pagination} onPageChange={setPage} />}

      {(isCreating || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsCreating(false);
            setEditingProduct(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.type === 'deactivate' ? 'Deactivate Product' : 'Restore Product'}
          message={
            actionError ||
            `Are you sure you want to ${pendingAction.type} "${pendingAction.product.name}"?`
          }
          confirmLabel={pendingAction.type === 'deactivate' ? 'Deactivate' : 'Restore'}
          isDanger={pendingAction.type === 'deactivate'}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setPendingAction(null);
            setActionError('');
          }}
        />
      )}
    </div>
  );
}
