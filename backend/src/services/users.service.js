import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import * as usersRepository from '../repositories/users.repository.js';

const notFound = () => AppError.notFound('Utilisateur introuvable', 'USER_NOT_FOUND');

export function list() {
  return usersRepository.findAll();
}

export async function create({ email, password, fullName, role }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
   
  return usersRepository.create({
    email: email.trim().toLowerCase(),
    passwordHash,
    fullName,
    role,
  });
}

export async function update(id, data, currentUser) {
   
  if (id === currentUser.id && data.role !== undefined && data.role !== currentUser.role) {
    throw AppError.badRequest('Vous ne pouvez pas modifier votre propre rôle', 'CANNOT_CHANGE_OWN_ROLE');
  }

  const changes = {
    fullName: data.fullName,
    role: data.role,
    email: data.email?.trim().toLowerCase(),
  };
  if (data.password) {
    changes.passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
  }

  const user = await usersRepository.update(id, changes);
  if (!user) throw notFound();
  return user;
}

export async function remove(id, currentUser) {
  if (id === currentUser.id) {
    throw AppError.badRequest('Vous ne pouvez pas supprimer votre propre compte', 'CANNOT_DELETE_SELF');
  }

  try {
    const deleted = await usersRepository.remove(id);
    if (!deleted) throw notFound();
  } catch (err) {
     
    if (err.code === '23503') {
      throw AppError.conflict(
        'Cet utilisateur a créé des événements et ne peut pas être supprimé',
        'USER_HAS_EVENTS'
      );
    }
    throw err;
  }
}