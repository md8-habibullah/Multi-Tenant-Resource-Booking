import { Router } from 'express';
import { BookingController } from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', BookingController.create);

router.get('/availability/:resourceId', BookingController.getAvailability);

export default router;
