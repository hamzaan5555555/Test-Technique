import { buildPagination, getPagination } from '../src/utils/pagination.js';

describe('pagination', () => {
  test('applique les valeurs par défaut', () => {
    expect(getPagination()).toEqual({ page: 1, limit: 20, offset: 0 });
  });

  test('calcule offset et plafonne la limite', () => {
    expect(getPagination({ page: '3', limit: '1000' })).toEqual({
      page: 3,
      limit: 100,
      offset: 200,
    });
  });

  test('construit les métadonnées de page', () => {
    expect(buildPagination({ page: 2, limit: 5 }, 12)).toEqual({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
  });
});
