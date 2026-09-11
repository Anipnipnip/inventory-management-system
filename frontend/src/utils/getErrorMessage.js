// Backend errors always follow { success: false, message, errors? }
// (see backend/src/middleware/errorHandler.js). These helpers pull the
// pieces a form needs out of an axios error without every component
// having to know that response shape itself.
export const getErrorMessage = (error) => {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
};

export const getFieldErrors = (error) => {
  return error.response?.data?.errors || [];
};
