import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name').notEmpty().trim().withMessage('El nombre es requerido'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Debe proporcionar un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

export const verifyEmailValidator = [
  body('token').notEmpty().withMessage('El token de verificación es requerido'),
];
export const updateUserValidator = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('name').optional().notEmpty().trim().withMessage('El nombre no puede estar vacío'),
];
export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Debe proporcionar un email válido'),
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('El token de restablecimiento es requerido'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
];

export const updateProfileValidator = [
  body('name').optional().notEmpty().trim().withMessage('El nombre no puede estar vacío'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
];

export const updateRoleValidator = [
  body('role')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isIn(['user', 'admin'])
    .withMessage('Rol inválido, debe ser user o admin'),
];

export const validateObjectId = (param: string) => {
  return body(param).isMongoId().withMessage(`El parámetro ${param} debe ser un ID válido`);
};
