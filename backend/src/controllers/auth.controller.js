import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

// POST /api/auth/login  ->  200 { token, user }
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

// GET /api/auth/me  ->  200 { user }
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});