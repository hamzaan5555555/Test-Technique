import { ZodError } from 'zod';
import AppError from '../utils/AppError.js';
import { env } from '../config/env.js';

 
export function notFound(req, res, next) {
  next(AppError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

 
const CONSTRAINT_MESSAGES = {
  participants_email_unique: 'Un participant avec cet email existe déjà',
  users_email_unique: 'Un utilisateur avec cet email existe déjà',
  registrations_event_participant_unique: 'Ce participant est déjà inscrit à cet événement',
  events_max_positive: 'maxParticipants doit être supérieur à 0',
};

 
const PG_ERRORS = {
  '23505': { status: 409, code: 'DUPLICATE', message: 'Cette ressource existe déjà' },
  '23503': { status: 409, code: 'FOREIGN_KEY_VIOLATION', message: 'Référence invalide ou ressource liée existante' },
  '23502': { status: 400, code: 'MISSING_FIELD', message: 'Un champ obligatoire est manquant' },
  '23514': { status: 400, code: 'CONSTRAINT_VIOLATION', message: 'Une contrainte de données n\'est pas respectée' },
  '22P02': { status: 400, code: 'INVALID_INPUT', message: 'Format invalide (ex : identifiant UUID incorrect)' },
};

 
 
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Erreur interne du serveur';
  let details;

  if (err instanceof AppError) {
    ({ statusCode: status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Données invalides';
    details = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Corps de requête JSON invalide';
  } else if (err.code && PG_ERRORS[err.code]) {
    const pgErr = PG_ERRORS[err.code];
    status = pgErr.status;
    code = pgErr.code;
    message = CONSTRAINT_MESSAGES[err.constraint] ?? pgErr.message;
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProduction) message = 'Erreur interne du serveur';
    else message = err.message || message;
  }

  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}