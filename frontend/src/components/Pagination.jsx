// Prev/next pager driven by the {total,page,limit,totalPages,
// hasNextPage,hasPrevPage} shape returned by the backend's
// buildPaginationMeta (Phase 11). Renders nothing when everything fits
// on a single page.
export const Pagination = ({ pagination, onPageChange }) => {
  const { page, totalPages, hasNextPage, hasPrevPage, total } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <p>
        Page {page} of {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="rounded-md border border-slate-300 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="rounded-md border border-slate-300 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
