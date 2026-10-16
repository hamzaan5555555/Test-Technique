import { z } from 'zod';
import { optionalQuery, paginationQuery, uuidSchema } from './common.validator.js';

const REGISTRATION_STATUSES = ['pending', 'confirmed', 'cancelled'];

 
export const createRegistrationSchema = z.object({
  eventId: uuidSchema("L'identifiant de l'événement est invalide"),
  participantId: uuidSchema("L'identifiant du participant est invalide"),
   
  status: z
    .enum(['pending', 'confirmed'], {
      invalid_type_error: "Le statut doit être 'pending' ou 'confirmed'",
    })
    .optional(),
});

 
export const updateRegistrationStatusSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES, {
    required_error: 'Le statut est requis',
    invalid_type_error: `Le statut doit être l'un de : ${REGISTRATION_STATUSES.join(', ')}`,
  }),
});

 
export const listRegistrationsQuerySchema = z.object({
  eventId: optionalQuery(uuidSchema("L'identifiant de l'événement est invalide")),
  status: optionalQuery(
    z.enum(REGISTRATION_STATUSES, {
      invalid_type_error: `Le statut doit être l'un de : ${REGISTRATION_STATUSES.join(', ')}`,
    })
  ),
  ...paginationQuery,
});
