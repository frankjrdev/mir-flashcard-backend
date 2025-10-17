import { Request, Response, NextFunction } from 'express';
import sendResponse from '../utils/responseHandler';
import { USerService } from '@/services/user.service';
import { AuthRequest } from '@/middleware/auth.middleware';

export class UserController {
  private userService: USerService;

  constructor() {
    this.userService = new USerService();
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

  /**
   * @swagger
   * /api/users/login:
   *   post:
   *     summary: Login a user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await this.userService.login(req.body);
      res.json(authResponse);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/users/verify-email:
   *   post:
   *     summary: Verify user email
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - token
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: User verified successfully
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
   *         description: Invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.userService.verifyEmail(req.body.token);
      res.json({
        message: 'Usuario verificado exitosamente',
        user,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * @swagger
   * /api/users/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
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
   *       404:
   *         description: User not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.user.id);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };
}
