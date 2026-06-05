import { Router } from 'express';
import { OrganizationController } from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { Role } from '../auth/model';

const router = Router();

router.use(requireAuth);

router.get('/', OrganizationController.get);
router.put('/', requireRole(Role.ORG_ADMIN), OrganizationController.update);

export default router;
