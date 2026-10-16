import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createRegistrationSchema,
  updateRegistrationStatusSchema,
  listRegistrationsQuerySchema,
} from '../validators/registration.validator.js';
import {
  createRegistration,
  listRegistrations,
  updateRegistrationStatus,
} from '../controllers/registrations.controller.js';

const router = Router();

 
router.use(authenticate, authorize('admin', 'staff'));

router.post('/', validate({ body: createRegistrationSchema }), createRegistration);
 
router.get('/', validate({ query: listRegistrationsQuerySchema }), listRegistrations);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateRegistrationStatusSchema }),
  updateRegistrationStatus
);

export default router;