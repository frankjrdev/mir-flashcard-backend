import { Router } from 'express';
import { basicHealthCheck, dbHealthCheck } from '../controllers/healthCheckController';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/', basicHealthCheck);

/**
 * @route   GET /api/health/db
 * @desc    Database health check endpoint
 * @access  Public
 */
router.get('/db', dbHealthCheck);

export default router;
