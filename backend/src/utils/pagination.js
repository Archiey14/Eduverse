export const getPaginationParams = (query, defaultLimit = 12, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    page,
    limit,
    total,
    totalPages,
  };
};
