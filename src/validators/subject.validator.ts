import { body, param } from 'express-validator';

export const createSubjectValidator = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre es requerido y debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
];

export const updateSubjectValidator = [
  param('id').isMongoId().withMessage('ID de subject inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
];

export const getSubjectValidator = [param('id').isMongoId().withMessage('ID de subject inválido')];

export const subjectIdValidator = [param('id').isMongoId().withMessage('ID de subject inválido')];
