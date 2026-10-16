import { asyncHandler } from '../utils/asyncHandler.js';
import * as eventsService from '../services/events.service.js';

 
export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.create(req.body, req.user.id);
  res.status(201).json(event);
});

 
export const listEvents = asyncHandler(async (req, res) => {
  const result = await eventsService.list(req.query);
  res.json(result);
});

 
export const getEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.getById(req.params.id);
  res.json(event);
});

 
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.update(req.params.id, req.body);
  res.json(event);
});

 
 
export const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await eventsService.updateStatus(req.params.id, req.body.status);
  res.json(event);
});