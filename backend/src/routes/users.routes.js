import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import { createUserSchema, updateUserSchema } from '../validators/user.validator.js';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller.js';

const router = Router();

 
router.use(authenticate, authorize('admin'));

router.get('/', listUsers);
router.post('/', validate({ body: createUserSchema }), createUser);
router.put('/:id', validate({ params: idParamSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', validate({ params: idParamSchema }), deleteUser);

export default router;