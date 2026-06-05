import { Router } from 'express';
import { BookingController } from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resourceId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', BookingController.create);

/**
 * @swagger
 * /api/bookings/availability/{resourceId}:
 *   get:
 *     summary: Get availability for a resource
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Returns array of available time slots
 */
router.get('/availability/:resourceId', BookingController.getAvailability);

export default router;
