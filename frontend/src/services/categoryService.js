import api from './api';

export const getCategories = async (includeInactive = false) => {
  const { data } = await api.get('/categories', {
    params: includeInactive ? { includeInactive: true } : {},
  });
  return data.data.categories;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/categories', payload);
  return data.data.category;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data.category;
};

// Soft delete -- marks the category inactive rather than removing it
// (see backend categoryController.js).
export const deactivateCategory = async (id) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data.data.category;
};

export const restoreCategory = async (id) => {
  const { data } = await api.patch(`/categories/${id}/restore`);
  return data.data.category;
};
