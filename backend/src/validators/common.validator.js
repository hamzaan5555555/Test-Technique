import { z } from 'zod';

export const uuidSchema = (message = 'Identifiant invalide (UUID attendu)') =>
  z.string({ required_error: message, invalid_type_error: message }).uuid(message);

/** Paramètre de route /:id */
export const idParamSchema = z.object({
  id: uuidSchema(),
});

/**
 * Pour les query strings : une valeur vide (`?status=`) est traitée comme absente.
 * Pratique quand un filtre du frontend est sur « Tous ».
 */
export const optionalQuery = (schema) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

/** ?page=&limit= (le service applique ensuite les valeurs par défaut et le plafond). */
export const paginationQuery = {
  page: optionalQuery(z.coerce.number().int().min(1, 'page doit être >= 1')),
  limit: optionalQuery(z.coerce.number().int().min(1, 'limit doit être >= 1').max(500)),
};

/** Vérifie qu'une chaîne AAAA-MM-JJ est une vraie date (refuse 2026-02-31). */
export function isValidDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Refuse un PUT/PATCH vide : au moins un champ valide doit être fourni. */
export const atLeastOneField = [
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ à modifier est requis' },
];