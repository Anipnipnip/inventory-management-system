import api from './api';

// params may include: product, warehouse (both ObjectIds). Filters the
// current stock snapshot -- see backend inventoryController.js.
export const getInventory = async (params) => {
  const { data } = await api.get('/inventory', { params });
  return data.data.inventory;
};

export const stockIn = async (payload) => {
  const { data } = await api.post('/inventory/stock-in', payload);
  return data.data; // { inventory, transaction }
};

export const stockOut = async (payload) => {
  const { data } = await api.post('/inventory/stock-out', payload);
  return data.data;
};

export const transferStock = async (payload) => {
  const { data } = await api.post('/inventory/transfer', payload);
  return data.data; // { sourceInventory, destinationInventory, transferOut, transferIn }
};

// params may include: product, warehouse, type, startDate, endDate,
// page, limit -- matching the backend's historyQueryValidator (Phase 10/11).
export const getHistory = async (params) => {
  const { data } = await api.get('/inventory/history', { params });
  return data.data; // { transactions, pagination }
};
