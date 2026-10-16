import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventRoutes from './events.routes.js';
import participantRoutes from './participants.routes.js';
import registrationRoutes from './registrations.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import userRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/participants', participantRoutes);
router.use('/registrations', registrationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;