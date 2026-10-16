import { z } from 'zod';
import { atLeastOneField } from './common.validator.js';

const USER_ROLES = ['admin', 'staff'];

const baseUserSchema = z.object({
  email: z
    .string({ required_error: "L'email est requis" })
    .trim()
    .toLowerCase()
    .email('Email invalide')
    .max(255, "L'email est trop long"),
  password: z
    .string({ required_error: 'Le mot de passe est requis' })
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe est trop long'),
  fullName: z
    .string({ required_error: 'Le nom complet est requis' })
    .trim()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(150, 'Le nom complet ne doit pas dépasser 150 caractères'),
  role: z
    .enum(USER_ROLES, {
      invalid_type_error: `Le rôle doit être l'un de : ${USER_ROLES.join(', ')}`,
    })
    .default('staff'),
});

 
export const createUserSchema = baseUserSchema;

 
export const updateUserSchema = baseUserSchema.partial().refine(...atLeastOneField);
