import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createEventSchema,
  updateEventSchema,
  updateEventStatusSchema,
  listEventsQuerySchema,
} from '../validators/event.validator.js';
import {
  createEvent,
  listEvents,
  getEvent,
  updateEvent,
  updateEventStatus,
} from '../controllers/events.controller.js';

const router = Router();

 
router.use(authenticate, authorize('admin', 'staff'));

router.post('/', validate({ body: createEventSchema }), createEvent);
router.get('/', validate({ query: listEventsQuerySchema }), listEvents);
router.get('/:id', validate({ params: idParamSchema }), getEvent);
router.put('/:id', validate({ params: idParamSchema, body: updateEventSchema }), updateEvent);
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: updateEventStatusSchema }),
  updateEventStatus
);

export default router;