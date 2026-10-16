import { asyncHandler } from '../utils/asyncHandler.js';
import * as usersService from '../services/users.service.js';

// GET /api/users  ->  200 { data: [users] }
export const listUsers = asyncHandler(async (req, res) => {
  const users = await usersService.list();
  res.json({ data: users });
});

// POST /api/users  ->  201 user
export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);
  res.status(201).json(user);
});

// PUT /api/users/:id  ->  200 user
export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.update(req.params.id, req.body, req.user);
  res.json(user);
});

// DELETE /api/users/:id  ->  204  (le service interdit de se supprimer soi-même)
export const deleteUser = asyncHandler(async (req, res) => {
  await usersService.remove(req.params.id, req.user);
  res.status(204).send();
});