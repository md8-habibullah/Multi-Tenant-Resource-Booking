import { Router } from 'express';
import { get, update } from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { Role } from '../auth/model';

const router = Router();

router.use(requireAuth);

router.get('/', get);
router.put('/', requireRole(Role.ORG_ADMIN), update);

export default router;
