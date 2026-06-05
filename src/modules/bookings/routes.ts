import { Router } from 'express';
import { create, getAvailability, getMyBookings, deleteBooking } from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);

router.get('/my', getMyBookings);

router.delete('/:id', deleteBooking);

router.get('/availability/:resourceId', getAvailability);

export default router;
