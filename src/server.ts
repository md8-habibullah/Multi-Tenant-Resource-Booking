import app from './app';
import { connectDB } from './config/database';
import { env } from './config/env';

const PORT = env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
