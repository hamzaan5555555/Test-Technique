import AppError from '../utils/AppError.js';


export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden("Vous n'avez pas les droits nécessaires pour cette action", 'INSUFFICIENT_ROLE')
      );
    }
    next();
  };