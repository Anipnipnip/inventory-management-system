import api from './api';

export const getSuppliers = async (includeInactive = false) => {
  const { data } = await api.get('/suppliers', {
    params: includeInactive ? { includeInactive: true } : {},
  });
  return data.data.suppliers;
};

export const createSupplier = async (payload) => {
  const { data } = await api.post('/suppliers', payload);
  return data.data.supplier;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await api.put(`/suppliers/${id}`, payload);
  return data.data.supplier;
};

export const deactivateSupplier = async (id) => {
  const { data } = await api.delete(`/suppliers/${id}`);
  return data.data.supplier;
};

export const restoreSupplier = async (id) => {
  const { data } = await api.patch(`/suppliers/${id}/restore`);
  return data.data.supplier;
};
