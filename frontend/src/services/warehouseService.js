import api from './api';

export const getWarehouses = async (includeInactive = false) => {
  const { data } = await api.get('/warehouses', {
    params: includeInactive ? { includeInactive: true } : {},
  });
  return data.data.warehouses;
};

export const createWarehouse = async (payload) => {
  const { data } = await api.post('/warehouses', payload);
  return data.data.warehouse;
};

export const updateWarehouse = async (id, payload) => {
  const { data } = await api.put(`/warehouses/${id}`, payload);
  return data.data.warehouse;
};

export const deactivateWarehouse = async (id) => {
  const { data } = await api.delete(`/warehouses/${id}`);
  return data.data.warehouse;
};

export const restoreWarehouse = async (id) => {
  const { data } = await api.patch(`/warehouses/${id}/restore`);
  return data.data.warehouse;
};

export const setDefaultWarehouse = async (id) => {
  const { data } = await api.patch(`/warehouses/${id}/set-default`);
  return data.data.warehouse;
};
