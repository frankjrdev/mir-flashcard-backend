import { Request, Response, NextFunction } from 'express';
import { User } from '@/models/User';
import sendResponse from '../utils/responseHandler';
import asyncHandler from '../utils/asyncHandler';
import { USerService } from '@/services/user.service';

export class UserController {
  private userService: USerService;

  constructor(userService: USerService) {
    this.userService = userService;
  }

  /**
   * @swagger
   * tags:
   *   name: Users
   *   description: Gestión de usuarios del sistema
   */

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Registrar un nuevo usuario
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       201:
   *         description: Usuario registrado correctamente. Esperar verificación por parte del administrador.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Petición inválida
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: Usuario ya existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.registerUser(req.body);
      res.status(201).json({
        message: 'User registered successfully, Wait for Admin verification',
        user,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

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
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      sendResponse(res, 200, true, 'Users retrieved successfully', { users });
    } catch (error) {
      next(error);
    }
  };

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
  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
      }
      sendResponse(res, 200, true, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Update user
  // @route   PUT /api/v1/users/:id
  // @access  Private/Admin
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, role } = req.body;
    try {
      const user = await this.userService.editUser(req.params.id, { name, email });
      if (!user) {
        return next(new Error(`User not found with id of ${req.params.id}`));
      }
      sendResponse(res, 200, true, 'User updated successfully', { user });
    } catch (error) {
      next(error);
    }
  };

  // @desc    Delete user
  // @route   DELETE /api/v1/users/:id
  // @access  Private/Admin
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.deleteUser(req.params.id);
      sendResponse(res, 200, true, 'User deleted successfully', {});
    } catch (error) {
      next(error);
    }
  };
}
