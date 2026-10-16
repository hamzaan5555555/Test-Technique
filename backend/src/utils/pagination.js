/** Normalise ?page= et ?limit= (valeurs par défaut et plafond). */
export function getPagination(query = {}, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

/** Métadonnées renvoyées avec chaque liste : { page, limit, total, totalPages }. */
export function buildPagination({ page, limit }, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}