import { Router } from 'express';
import { create, getAll, getById, update, softDelete } from './controller';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { Role } from '../auth/model';

const router = Router();

router.use(requireAuth);

router.get('/', getAll);
router.get('/:id', getById);

router.post('/', requireRole(Role.ORG_ADMIN), create);
router.put('/:id', requireRole(Role.ORG_ADMIN), update);
router.delete('/:id', requireRole(Role.ORG_ADMIN), softDelete);

export default router;
