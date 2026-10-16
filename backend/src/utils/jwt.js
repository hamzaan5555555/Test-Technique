import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import AppError from './AppError.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized('Token invalide ou expiré', 'TOKEN_INVALID');
    }

    throw error;
  }
}