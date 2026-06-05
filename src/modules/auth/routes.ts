import { Router } from 'express';
import { AuthController } from './controller';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register an ORG_ADMIN and a new Organization
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               organizationName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/employee:
 *   post:
 *     summary: Register an EMPLOYEE under an existing organization
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               organizationId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee registered successfully
 */
router.post('/employee', AuthController.registerEmployee);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', AuthController.login);

export default router;
