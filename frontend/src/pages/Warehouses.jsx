import { useEffect, useState } from 'react';
import * as warehouseService from '../services/warehouseService';
import { getErrorMessage, getFieldErrors } from '../utils/getErrorMessage';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../components/Alert';

// Admin-only page (see Sidebar.jsx and backend warehouseRoutes.js,
// which restricts every route here including GET).

const emptyForm = { name: '', location: '' };

function WarehouseFormModal({ warehouse, onClose, onSaved }) {
  const isEditing = Boolean(warehouse);
  const [form, setForm] = useState(
    warehouse ? { name: warehouse.name, location: warehouse.location } : emptyForm
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
        ? await warehouseService.updateWarehouse(warehouse._id, form)
        : await warehouseService.createWarehouse(form);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit Warehouse' : 'Add Warehouse'} onClose={onClose}>
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
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">
            Location
          </label>
          <textarea
            id="location"
            maxLength={300}
            rows={2}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
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

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { warehouse, type: 'deactivate' | 'restore' | 'setDefault' }
  const [actionError, setActionError] = useState('');

  const loadWarehouses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await warehouseService.getWarehouses(showInactive);
      setWarehouses(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  const handleSaved = () => {
    const wasEditing = Boolean(editingWarehouse);
    setEditingWarehouse(null);
    setIsCreating(false);
    setSuccessMessage(wasEditing ? 'Warehouse updated.' : 'Warehouse created.');
    loadWarehouses();
  };

  const actionLabels = {
    deactivate: { title: 'Deactivate Warehouse', confirmLabel: 'Deactivate', isDanger: true },
    restore: { title: 'Restore Warehouse', confirmLabel: 'Restore', isDanger: false },
    setDefault: { title: 'Set Default Warehouse', confirmLabel: 'Set as Default', isDanger: false },
  };

  const successMessages = {
    deactivate: (warehouse) => `"${warehouse.name}" has been deactivated.`,
    restore: (warehouse) => `"${warehouse.name}" has been restored.`,
    setDefault: (warehouse) => `"${warehouse.name}" is now the default warehouse.`,
  };

  const handleConfirmAction = async () => {
    setActionError('');
    try {
      const { warehouse, type } = pendingAction;
      if (type === 'deactivate') {
        await warehouseService.deactivateWarehouse(warehouse._id);
      } else if (type === 'restore') {
        await warehouseService.restoreWarehouse(warehouse._id);
      } else {
        await warehouseService.setDefaultWarehouse(warehouse._id);
      }
      setPendingAction(null);
      setSuccessMessage(successMessages[type](warehouse));
      loadWarehouses();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Warehouses</h1>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add Warehouse
        </button>
      </div>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="rounded border-slate-300"
        />
        Show inactive warehouses
      </label>

      <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading warehouses...</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : warehouses.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No warehouses found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
                <tr key={warehouse._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {warehouse.name}
                    {warehouse.isDefault && (
                      <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{warehouse.location || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        warehouse.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {warehouse.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingWarehouse(warehouse)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {!warehouse.isDefault && warehouse.isActive && (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ warehouse, type: 'setDefault' })}
                          className="font-medium text-slate-600 hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      {warehouse.isActive ? (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ warehouse, type: 'deactivate' })}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingAction({ warehouse, type: 'restore' })}
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

      {(isCreating || editingWarehouse) && (
        <WarehouseFormModal
          warehouse={editingWarehouse}
          onClose={() => {
            setIsCreating(false);
            setEditingWarehouse(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {pendingAction && (
        <ConfirmDialog
          title={actionLabels[pendingAction.type].title}
          message={
            actionError ||
            `Are you sure you want to ${
              pendingAction.type === 'setDefault' ? 'set' : pendingAction.type
            } "${pendingAction.warehouse.name}"${
              pendingAction.type === 'setDefault' ? ' as the default warehouse' : ''
            }?`
          }
          confirmLabel={actionLabels[pendingAction.type].confirmLabel}
          isDanger={actionLabels[pendingAction.type].isDanger}
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
