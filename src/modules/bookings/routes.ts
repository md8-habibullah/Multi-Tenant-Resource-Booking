import { Router } from 'express';
import { create, getAvailability } from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);

router.get('/availability/:resourceId', getAvailability);

export default router;
