// Shared label + color per StockTransaction type (see backend
// models/StockTransaction.js for the 4 possible values). Used by both
// the Dashboard's recent activity feed (Phase 14) and the full History
// page (Phase 16) so movement types render identically everywhere.
export const STOCK_TRANSACTION_TYPES = {
  in: { label: 'Stock In', className: 'text-emerald-600' },
  out: { label: 'Stock Out', className: 'text-red-600' },
  'transfer-in': { label: 'Transfer In', className: 'text-blue-600' },
  'transfer-out': { label: 'Transfer Out', className: 'text-amber-600' },
};
