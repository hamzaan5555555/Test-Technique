import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createParticipantSchema,
  updateParticipantSchema,
  listParticipantsQuerySchema,
} from '../validators/participant.validator.js';
import {
  createParticipant,
  listParticipants,
  getParticipant,
  updateParticipant,
  deleteParticipant,
} from '../controllers/participants.controller.js';

const router = Router();

router.use(authenticate, authorize('admin', 'staff'));

router.post('/', validate({ body: createParticipantSchema }), createParticipant);
// GET /api/participants?search=
router.get('/', validate({ query: listParticipantsQuerySchema }), listParticipants);
router.get('/:id', validate({ params: idParamSchema }), getParticipant);
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateParticipantSchema }),
  updateParticipant
);
router.delete('/:id', validate({ params: idParamSchema }), deleteParticipant);

export default router;