// Small reusable banner for success/error feedback after an action
// (create, update, deactivate, restore...). Replaces the same handful
// of Tailwind classes that were being repeated inline across every
// page (Phase 18 cleanup) so success/error messages look identical
// everywhere instead of drifting slightly page to page.
const VARIANT_CLASSES = {
  success: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
};

export const Alert = ({ variant = 'success', children }) => (
  <div
    className={`mt-4 rounded-md px-3 py-2 text-sm ${VARIANT_CLASSES[variant]}`}
    role={variant === 'error' ? 'alert' : 'status'}
  >
    {children}
  </div>
);
