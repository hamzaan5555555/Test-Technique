import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

 
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

 
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});