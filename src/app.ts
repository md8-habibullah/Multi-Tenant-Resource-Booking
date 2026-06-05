import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/routes';
import organizationRoutes from './modules/organizations/routes';
import resourceRoutes from './modules/resources/routes';
import bookingRoutes from './modules/bookings/routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Yahoo! Server is running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookings', bookingRoutes);

// Error Handler
app.use(errorHandler);

export default app;
