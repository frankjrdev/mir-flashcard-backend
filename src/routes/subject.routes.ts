import { Router } from 'express';
import { SubjectController } from '@/controllers/subject.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import {
  createSubjectValidator,
  updateSubjectValidator,
  subjectIdValidator,
} from '@/validators/subject.validator';

const subjectRouter = Router();
const subjectController = new SubjectController();

// Todas las rutas requieren autenticación
subjectRouter.use(authMiddleware);

// Routes
subjectRouter.post('/', createSubjectValidator, validate, subjectController.createSubject);
subjectRouter.get('/', subjectController.getUserSubjects);
subjectRouter.get('/:id', subjectIdValidator, validate, subjectController.getSubjectById);
subjectRouter.put('/:id', updateSubjectValidator, validate, subjectController.updateSubject);
subjectRouter.delete('/:id', subjectIdValidator, validate, subjectController.deleteSubject);
subjectRouter.get('/:id/stats', subjectIdValidator, validate, subjectController.getSubjectStats);

export default subjectRouter;
