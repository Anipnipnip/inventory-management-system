import {
  getStockMovementReport,
  getValuationReport,
  getLowStockReport,
} from '../services/reportService.js';

// GET /api/reports/stock-movement
export const getStockMovement = async (req, res) => {
  const report = await getStockMovementReport(req.query);

  res.status(200).json({
    success: true,
    message: 'Stock movement report retrieved',
    data: report,
  });
};

// GET /api/reports/valuation
export const getValuation = async (req, res) => {
  const report = await getValuationReport();

  res.status(200).json({
    success: true,
    message: 'Valuation report retrieved',
    data: report,
  });
};

// GET /api/reports/low-stock
export const getLowStock = async (req, res) => {
  const report = await getLowStockReport(req.query);

  res.status(200).json({
    success: true,
    message: 'Low stock report retrieved',
    data: report,
  });
};
