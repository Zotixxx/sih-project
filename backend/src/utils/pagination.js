const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export const getPagination = (query = {}) => {
  const rawLimit = Number.parseInt(query.limit ?? query.pageSize ?? DEFAULT_LIMIT, 10);
  const rawPage = Number.parseInt(query.page ?? 1, 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;
  const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    from: offset,
    to: offset + limit - 1,
  };
};

export const paginatedResponse = (items, pagination, total = null) => ({
  items,
  page: pagination.page,
  limit: pagination.limit,
  total,
});
