import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate, authorize('admin', 'staff'));

 
 
router.get('/stats', getStats);

export default router;