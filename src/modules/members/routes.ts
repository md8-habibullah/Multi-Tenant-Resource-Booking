import { Router } from 'express';
import { getMembers } from './controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', getMembers);

export default router;
