import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginSchema } from '../validators/auth.validator.js';
import { login, me } from '../controllers/auth.controller.js';

const router = Router();

 
router.post('/login', validate({ body: loginSchema }), login);

 
router.get('/me', authenticate, me);

export default router;