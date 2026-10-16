/**
 * Construit les fragments `colonne = $n` d'un UPDATE à partir des seuls champs fournis.
 * `columnMap` est une liste blanche { champJS: 'colonne_sql' } : aucun nom de colonne
 * ne provient de l'utilisateur, donc pas de risque d'injection.
 *
 * Retourne { sets, values } ; l'appelant ajoute l'id comme dernier paramètre.
 */
export function buildUpdate(data, columnMap) {
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      values.push(data[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }
  return { sets, values };
}

/** Échappe % _ \ pour un ILIKE sûr sur une saisie utilisateur. */
export function escapeLike(value) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}