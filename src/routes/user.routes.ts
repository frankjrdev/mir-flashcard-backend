import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '@/middlewares/auth.middelware';
import {
  loginValidator,
  registerValidator,
  verifyEmailValidator,
} from '@/validator/user.validator';
import { validate } from '@/middlewares/validation.middelware';

const userRouter = Router();
const userController = new UserController();

// Public routes
userRouter.post('/register', registerValidator, validate, userController.register);
userRouter.post('/login', loginValidator, validate, userController.login);
userRouter.post('/verify-email', verifyEmailValidator, validate, userController.verifyEmail);
// userRouter.post('/resend-verification', userController.resendVerification);
// userRouter.post('/forgot-password', userController.forgotPassword);
// userRouter.post('/reset-password', userController.resetPassword);
// userRouter.post('/refresh-token', userController.refreshToken);

// Protected routes
userRouter.get('/profile', authMiddleware, userController.getProfile);
// userRouter.post('/logout', authMiddleware, userController.logout);
// userRouter.put('/profile', authMiddleware, userController.updateProfile);
// userRouter.patch('/profile/password', authMiddleware, userController.changePassword);

// Admin / management (require appropriate admin check inside controller or additional middleware)
userRouter.get('/', authMiddleware, userController.getUsers);
userRouter.get('/:id', authMiddleware, userController.getUser);
userRouter.put('/:id', authMiddleware, userController.updateUser);
userRouter.delete('/:id', authMiddleware, userController.deleteUser);

export default userRouter;
