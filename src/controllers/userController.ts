
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
const getUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find().select('-password');

    sendResponse(res, 200, true, 'Users retrieved successfully', { users });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a buscar
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User retrieved successfully', { user });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, role } = req.body;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role },
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User updated successfully', { user });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
    }

    sendResponse(res, 200, true, 'User deleted successfully', {});
});

export { getUsers, getUser, updateUser, deleteUser };