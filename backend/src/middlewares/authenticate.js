import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';
import * as usersRepository from '../repositories/users.repository.js';

/**
 * Exige un header `Authorization: Bearer <token>`.
 * Charge l'utilisateur depuis la base (il peut avoir été supprimé ou changé de rôle
 * depuis l'émission du token) et le place dans req.user :
 *   { id, email, fullName, role, createdAt }   (sans passwordHash)
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw AppError.unauthorized('Token manquant', 'TOKEN_MISSING');
  }

  const payload = verifyToken(header.slice(7).trim());

  const user = await usersRepository.findById(payload.sub);
  if (!user) {
    throw AppError.unauthorized('Utilisateur introuvable', 'USER_NOT_FOUND');
  }

  req.user = user;
  next();
});