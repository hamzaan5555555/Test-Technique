import { asyncHandler } from '../utils/asyncHandler.js';
import * as participantsService from '../services/participants.service.js';

// POST /api/participants  ->  201 participant
export const createParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.create(req.body);
  res.status(201).json(participant);
});

// GET /api/participants?search=&page=&limit=  ->  200 { data, pagination }
export const listParticipants = asyncHandler(async (req, res) => {
  const result = await participantsService.list(req.query);
  res.json(result);
});

// GET /api/participants/:id  ->  200 participant
export const getParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.getById(req.params.id);
  res.json(participant);
});

// PUT /api/participants/:id  ->  200 participant
export const updateParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.update(req.params.id, req.body);
  res.json(participant);
});

// DELETE /api/participants/:id  ->  204
export const deleteParticipant = asyncHandler(async (req, res) => {
  await participantsService.remove(req.params.id);
  res.status(204).send();
});