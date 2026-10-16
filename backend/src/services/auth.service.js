import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import * as usersRepository from '../repositories/users.repository.js';

 
 
const DUMMY_HASH = bcrypt.hashSync('dummy-password', env.BCRYPT_ROUNDS);

export async function login(email, password) {
  const user = await usersRepository.findByEmail(email.trim().toLowerCase());

  const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

   
  if (!user || !isValid) {
    throw AppError.unauthorized('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
  }

  const { passwordHash, ...publicUser } = user;
  return { token: signToken(publicUser), user: publicUser };
}