import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/routes';
import organizationRoutes from './modules/organizations/routes';
import resourceRoutes from './modules/resources/routes';
import bookingRoutes from './modules/bookings/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use(errorHandler);

export default app;
