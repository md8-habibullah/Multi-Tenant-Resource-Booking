import { Router } from 'express';
import { ResourceController } from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { Role } from '../auth/model';

const router = Router();

router.use(requireAuth);

router.get('/', ResourceController.getAll);
router.get('/:id', ResourceController.getById);

router.post('/', requireRole(Role.ORG_ADMIN), ResourceController.create);
router.put('/:id', requireRole(Role.ORG_ADMIN), ResourceController.update);
router.delete('/:id', requireRole(Role.ORG_ADMIN), ResourceController.softDelete);

export default router;
