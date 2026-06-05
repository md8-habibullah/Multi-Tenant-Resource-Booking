import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './modules/auth/routes';
import organizationRoutes from './modules/organizations/routes';
import resourceRoutes from './modules/resources/routes';
import bookingRoutes from './modules/bookings/routes';
import memberRoutes from './modules/members/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Uncomment before go to production
// if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
app.use(morgan('dev'));
// }

const swaggerUiOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js'
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Yahoo! Backend server is running.'
  });
});

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
app.use('/api/members', memberRoutes);

app.use(errorHandler);

export default app;
