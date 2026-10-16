import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboard.service.js';

 
 
export const getStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getStats();
  res.json(stats);
});