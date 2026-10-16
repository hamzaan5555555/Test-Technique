import { z } from 'zod';
import {
  atLeastOneField,
  isValidDateString,
  optionalQuery,
  paginationQuery,
} from './common.validator.js';

const EVENT_STATUSES = ['draft', 'published', 'cancelled'];





const eventDateSchema = z
  .string({ required_error: "La date de l'événement est requise" })
  .trim()
  .min(1, "La date de l'événement est requise")
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Date invalide')
  .transform((value) => new Date(value).toISOString());

const baseEventSchema = z.object({
  title: z
    .string({ required_error: 'Le titre est requis' })
    .trim()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  description: z.string().trim().max(5000, 'La description est trop longue').nullish(),
  location: z
    .string({ required_error: 'Le lieu est requis' })
    .trim()
    .min(2, 'Le lieu est requis')
    .max(255, 'Le lieu ne doit pas dépasser 255 caractères'),
  eventDate: eventDateSchema,
  maxParticipants: z.coerce
    .number({ invalid_type_error: 'maxParticipants doit être un nombre' })
    .int('maxParticipants doit être un entier')
    .min(1, 'maxParticipants doit être supérieur à 0')
    .max(100000, 'maxParticipants est trop grand'),
});

 
 
export const createEventSchema = baseEventSchema;

export const updateEventSchema = baseEventSchema.partial().refine(...atLeastOneField);

export const updateEventStatusSchema = z.object({
  status: z.enum(['published', 'cancelled'], {
    required_error: 'Le statut est requis',
    invalid_type_error: "Le statut doit être 'published' ou 'cancelled'",
    message: "Le statut doit être 'published' ou 'cancelled'",
  }),
});

export const listEventsQuerySchema = z.object({
  status: optionalQuery(
    z.enum(EVENT_STATUSES, { message: `status doit être l'un de : ${EVENT_STATUSES.join(', ')}` })
  ),
  date: optionalQuery(
    z.string().refine(isValidDateString, 'date doit être au format AAAA-MM-JJ (date valide)')
  ),
  ...paginationQuery,
});