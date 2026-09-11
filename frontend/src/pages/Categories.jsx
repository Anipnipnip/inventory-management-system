import { useEffect, useState } from 'react';
import * as categoryService from '../services/categoryService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Admin-only page (see Sidebar.jsx) -- staff have no reason to manage
// categories, they just see category names inline on the Products page.

const emptyForm = { name: '', description: '' };

function CategoryFormModal({ category, onClose, onSaved }) {
  const isEditing = Boolean(category);
  const [form, setForm] = useState(category ? { name: category.name, description: category.description } : emptyForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldError = (field) => fieldErrors.find((f) => f.field === field)?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      const saved = isEditing
        ? await categoryService.updateCategory(category._id, form)
        : await categoryService.createCategory(form);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit Category' : 'Add Category'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            maxLength={50}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fieldError('name') && <p className="mt-1 text-xs text-red-600">{fieldError('name')}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            maxLength={500}
            rows={3}
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
    </Modal>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { category, type: 'deactivate' | 'restore' }
  const [actionError, setActionError] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await categoryService.getCategories(showInactive);
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  const handleSaved = () => {
    setEditingCategory(null);
    setIsCreating(false);
    loadCategories();
  };

  const handleConfirmAction = async () => {
    setActionError('');
    try {
      if (pendingAction.type === 'deactivate') {
        await categoryService.deactivateCategory(pendingAction.category._id);
      } else {
        await categoryService.restoreCategory(pendingAction.category._id);
      }
      setPendingAction(null);
      loadCategories();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Categories</h1>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-slate-300"
        />
        Show inactive categories
      </label>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading categories...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No categories found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{category.name}</td>
                  <td className="px-4 py-3 text-slate-500">{category.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        category.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(category)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {category.isActive ? (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ category, type: 'deactivate' })}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ category, type: 'restore' })}
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(isCreating || editingCategory) && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setIsCreating(false);
            setEditingCategory(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.type === 'deactivate' ? 'Deactivate Category' : 'Restore Category'}
          message={
            actionError ||
            `Are you sure you want to ${pendingAction.type} "${pendingAction.category.name}"?`
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
