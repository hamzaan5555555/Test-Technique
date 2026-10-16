const SOURCES = ['params', 'query', 'body'];











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