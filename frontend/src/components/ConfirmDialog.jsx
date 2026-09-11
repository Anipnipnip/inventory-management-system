import { Modal } from './Modal';

// A confirmation step before a state-changing action (deactivate,
// restore) so a single accidental click never immediately changes
// data.
export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  isDanger = false,
}) => (
  <Modal title={title} onClose={onCancel}>
    <p className="text-sm text-slate-600">{message}</p>
    <div className="mt-6 flex justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
          isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
