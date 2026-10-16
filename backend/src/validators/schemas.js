import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const eventSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(5000).default(''),
  location: z.string().trim().min(1).max(240),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  capacity: z.coerce.number().int().positive()
}).refine((event) => event.endsAt > event.startsAt, {
  message: 'endsAt must be after startsAt'
});

export const registrationSchema = z.object({
  eventId: z.string().uuid(),
  participantId: z.string().uuid()
});
