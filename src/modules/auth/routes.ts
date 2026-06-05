import { Router } from 'express';
import { register, registerEmployee, login, logout } from './controller';

const router = Router();

router.post('/register', register);

router.post('/employee', registerEmployee);

router.post('/login', login);

router.post('/logout', logout);

export default router;
