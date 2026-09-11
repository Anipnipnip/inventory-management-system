import api from './api';

// params may include: search, category, supplier, sortBy, sortOrder,
// page, limit, includeInactive -- all optional, matching the backend's
// productQueryValidator (Phase 11). Axios drops keys whose value is
// undefined, so callers can pass them through without filtering first.
export const getProducts = async (params) => {
  const { data } = await api.get('/products', { params });
  return data.data; // { products, pagination }
};

// Returns { product, warning } -- warning is set when the backend flags
// a selling price below cost price (not an error, just worth a nudge).
export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return { product: data.data.product, warning: data.warning };
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return { product: data.data.product, warning: data.warning };
};

export const deactivateProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data.data.product;
};

export const restoreProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/restore`);
  return data.data.product;
};
