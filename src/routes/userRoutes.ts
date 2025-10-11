import { Router } from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '@/middlewares/auth';

const router = Router();

// All routes below are protected and only accessible by admin
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

export default router;