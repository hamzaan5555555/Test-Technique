import { asyncHandler } from '../utils/asyncHandler.js';
import * as eventsService from '../services/events.service.js';

// POST /api/events  ->  201 event
export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.create(req.body, req.user.id);
  res.status(201).json(event);
});

// GET /api/events?status=&date=&page=&limit=  ->  200 { data, pagination }
export const listEvents = asyncHandler(async (req, res) => {
  const result = await eventsService.list(req.query);
  res.json(result);
});

// GET /api/events/:id  ->  200 event
export const getEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.getById(req.params.id);
  res.json(event);
});

// PUT /api/events/:id  ->  200 event
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventsService.update(req.params.id, req.body);
  res.json(event);
});

// PATCH /api/events/:id/status  ->  200 event
// draft -> published, ou * -> cancelled (annule aussi toutes les inscriptions)
export const updateEventStatus = asyncHandler(async (req, res) => {
  const event = await eventsService.updateStatus(req.params.id, req.body.status);
  res.json(event);
});