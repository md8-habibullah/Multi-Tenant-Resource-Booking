import { Router } from 'express';
import { AuthController } from './controller';

const router = Router();

router.post('/register', AuthController.register);

router.post('/employee', AuthController.registerEmployee);

router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);

export default router;
