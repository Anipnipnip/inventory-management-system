// Shared by any list endpoint that needs server-side pagination
// (Products, stock history, and future list views). Centralizing this
// avoids re-deriving skip/totalPages math slightly differently in each
// controller.

// Turns raw query params into safe, bounded pagination inputs.
// Defaults to page 1 / 10 per page; caps `limit` at 100 so a single
// request can't be used to pull an entire large collection at once.
export const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Builds the `pagination` block returned alongside list results, given
// how many documents matched in total.
export const buildPaginationMeta = (total, page, limit) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
