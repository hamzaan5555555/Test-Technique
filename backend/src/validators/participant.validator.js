import { z } from 'zod';
import { atLeastOneField, optionalQuery, paginationQuery } from './common.validator.js';

 
const phoneSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{6,30}$/, 'Numéro de téléphone invalide')
    .nullish()
);

const baseParticipantSchema = z.object({
  fullName: z
    .string({ required_error: 'Le nom complet est requis' })
    .trim()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(150, 'Le nom complet ne doit pas dépasser 150 caractères'),
  email: z
    .string({ required_error: "L'email est requis" })
    .trim()
    .toLowerCase()
    .email('Email invalide')
    .max(255, "L'email est trop long"),
  phone: phoneSchema,
});

export const createParticipantSchema = baseParticipantSchema;

export const updateParticipantSchema = baseParticipantSchema.partial().refine(...atLeastOneField);

 
export const listParticipantsQuerySchema = z.object({
  search: optionalQuery(z.string().trim().max(100, 'La recherche est trop longue')),
  ...paginationQuery,
});