import { asyncHandler } from '../utils/asyncHandler.js';
import * as registrationsService from '../services/registrations.service.js';

 
 
export const createRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationsService.create(req.body);
  res.status(201).json(registration);
});

 
export const listRegistrations = asyncHandler(async (req, res) => {
  const result = await registrationsService.list(req.query);
  res.json(result);
});

 
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const registration = await registrationsService.updateStatus(req.params.id, req.body.status);
  res.json(registration);
});