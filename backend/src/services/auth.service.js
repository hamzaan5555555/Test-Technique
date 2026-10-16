import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import * as usersRepository from '../repositories/users.repository.js';

// Hash factice : on compare toujours un mot de passe, même si l'email n'existe pas,
// pour ne pas révéler par le temps de réponse quels emails sont enregistrés.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', env.BCRYPT_ROUNDS);

export async function login(email, password) {
  const user = await usersRepository.findByEmail(email.trim().toLowerCase());

  const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // Même message dans les deux cas (email inconnu / mauvais mot de passe)
  if (!user || !isValid) {
    throw AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  const { passwordHash, ...publicUser } = user;
  return { token: signToken(publicUser), user: publicUser };
}