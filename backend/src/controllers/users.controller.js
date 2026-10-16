import { asyncHandler } from '../utils/asyncHandler.js';
import * as usersService from '../services/users.service.js';

 
export const listUsers = asyncHandler(async (req, res) => {
  const users = await usersService.list();
  res.json({ data: users });
});

 
export const createUser = asyncHandler(async (req, res) => {
  const user = await usersService.create(req.body);
  res.status(201).json(user);
});

 
export const updateUser = asyncHandler(async (req, res) => {
  const user = await usersService.update(req.params.id, req.body, req.user);
  res.json(user);
});

 
export const deleteUser = asyncHandler(async (req, res) => {
  await usersService.remove(req.params.id, req.user);
  res.status(204).send();
});