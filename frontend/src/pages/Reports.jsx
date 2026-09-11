import { useState } from 'react';
import StockMovementReport from './reports/StockMovementReport';
import ValuationReport from './reports/ValuationReport';
import LowStockReport from './reports/LowStockReport';

// Admin-only page (see Sidebar.jsx and backend reportRoutes.js). The
// three reports are grouped under one page with tabs rather than three
// separate sidebar entries -- they're one feature ("Reports") with
// three views on the data, not three unrelated pages.
const TABS = [
  { id: 'stock-movement', label: 'Stock Movement', Component: StockMovementReport },
  { id: 'valuation', label: 'Valuation', Component: ValuationReport },
  { id: 'low-stock', label: 'Low Stock', Component: LowStockReport },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const ActiveComponent = TABS.find((tab) => tab.id === activeTab).Component;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>

      <div className="mt-4 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <ActiveComponent />
      </div>
    </div>
  );
}
