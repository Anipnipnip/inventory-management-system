import api from './api';

// params may include: product, warehouse, startDate, endDate, page,
// limit -- all optional, matching stockMovementQueryValidator.
export const getStockMovementReport = async (params) => {
  const { data } = await api.get('/reports/stock-movement', { params });
  return data.data; // { transactions, totalsByType, pagination }
};

// No params -- this report always returns every row plus a grand
// total, it isn't paginated on the backend (see reportService.js).
export const getValuationReport = async () => {
  const { data } = await api.get('/reports/valuation');
  return data.data; // { rows, grandTotal }
};

// params may include: page, limit.
export const getLowStockReport = async (params) => {
  const { data } = await api.get('/reports/low-stock', { params });
  return data.data; // { rows, pagination }
};
