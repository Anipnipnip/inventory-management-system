import { useEffect, useState } from 'react';
import * as supplierService from '../services/supplierService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

// Admin-only page (see Sidebar.jsx) -- same reasoning as Categories.

const emptyForm = { name: '', contactPerson: '', phone: '', email: '', address: '' };

function SupplierFormModal({ supplier, onClose, onSaved }) {
  const isEditing = Boolean(supplier);
  const [form, setForm] = useState(
    supplier
      ? {
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
        }
      : emptyForm
  );
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
        ? await supplierService.updateSupplier(supplier._id, form)
        : await supplierService.createSupplier(form);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit Supplier' : 'Add Supplier'} onClose={onClose}>
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
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {fieldError('name') && <p className="mt-1 text-xs text-red-600">{fieldError('name')}</p>}
        </div>

        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700">
            Contact person
          </label>
          <input
            id="contactPerson"
            type="text"
            maxLength={100}
            value={form.contactPerson}
            onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError('phone') && <p className="mt-1 text-xs text-red-600">{fieldError('phone')}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {fieldError('email') && <p className="mt-1 text-xs text-red-600">{fieldError('email')}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Address
          </label>
          <textarea
            id="address"
            maxLength={300}
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
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

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadSuppliers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await supplierService.getSuppliers(showInactive);
      setSuppliers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  const handleSaved = () => {
    setEditingSupplier(null);
    setIsCreating(false);
    loadSuppliers();
  };

  const handleConfirmAction = async () => {
    setActionError('');
    try {
      if (pendingAction.type === 'deactivate') {
        await supplierService.deactivateSupplier(pendingAction.supplier._id);
      } else {
        await supplierService.restoreSupplier(pendingAction.supplier._id);
      }
      setPendingAction(null);
      loadSuppliers();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Suppliers</h1>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Supplier
        </button>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-slate-300"
        />
        Show inactive suppliers
      </label>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading suppliers...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : suppliers.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No suppliers found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Phone / Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{supplier.name}</td>
                  <td className="px-4 py-3 text-slate-500">{supplier.contactPerson || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {supplier.phone || '—'} {supplier.email && `· ${supplier.email}`}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        supplier.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingSupplier(supplier)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {supplier.isActive ? (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ supplier, type: 'deactivate' })}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ supplier, type: 'restore' })}
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

      {(isCreating || editingSupplier) && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => {
            setIsCreating(false);
            setEditingSupplier(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction.type === 'deactivate' ? 'Deactivate Supplier' : 'Restore Supplier'}
          message={
            actionError ||
            `Are you sure you want to ${pendingAction.type} "${pendingAction.supplier.name}"?`
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
