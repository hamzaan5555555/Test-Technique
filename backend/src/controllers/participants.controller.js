import { asyncHandler } from '../utils/asyncHandler.js';
import * as participantsService from '../services/participants.service.js';

 
export const createParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.create(req.body);
  res.status(201).json(participant);
});

 
export const listParticipants = asyncHandler(async (req, res) => {
  const result = await participantsService.list(req.query);
  res.json(result);
});

 
export const getParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.getById(req.params.id);
  res.json(participant);
});

 
export const updateParticipant = asyncHandler(async (req, res) => {
  const participant = await participantsService.update(req.params.id, req.body);
  res.json(participant);
});

 
export const deleteParticipant = asyncHandler(async (req, res) => {
  await participantsService.remove(req.params.id);
  res.status(204).send();
});