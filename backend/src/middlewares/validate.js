const SOURCES = ['params', 'query', 'body'];

/**
 * Valide et remplace req.params / req.query / req.body par la version parsée par Zod
 * (types convertis, valeurs par défaut appliquées, champs inconnus retirés).
 * En cas d'erreur, la ZodError est transmise à errorHandler -> 400 VALIDATION_ERROR.
 *
 * Usage : validate({ params: idParamSchema, body: createEventSchema })
 *
 * Note : l'assignation de req.query fonctionne avec Express 4. Avec Express 5,
 * req.query est en lecture seule : il faudrait stocker le résultat ailleurs.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    for (const source of SOURCES) {
      if (schemas[source]) {
        req[source] = schemas[source].parse(req[source]);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};