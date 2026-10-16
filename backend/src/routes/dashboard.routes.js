import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate, authorize('admin', 'staff'));

// GET /api/dashboard/stats
// -> { totalEvents, publishedEvents, registrationsToday, topEvents: [...5] }
router.get('/stats', getStats);

export default router;