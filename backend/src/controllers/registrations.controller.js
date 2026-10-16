import { asyncHandler } from '../utils/asyncHandler.js';
import * as registrationsService from '../services/registrations.service.js';

// POST /api/registrations  { eventId, participantId, status? }  ->  201 registration
// Règles (dans le service) : événement publié, pas de doublon, capacité non dépassée.
export const createRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationsService.create(req.body);
  res.status(201).json(registration);
});

// GET /api/registrations?eventId=&status=&page=&limit=  ->  200 { data, pagination }
export const listRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationsService.list(req.query);
  res.json(result);
});

// PATCH /api/registrations/:id/status  { status }  ->  200 registration
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const registration = await registrationsService.updateStatus(req.params.id, req.body.status);
  res.json(registration);
});