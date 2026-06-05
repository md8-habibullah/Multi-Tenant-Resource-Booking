import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const dbUri = env.NODE_ENV === 'test'
      ? env.MONGO_TEST_URI || `${env.MONGO_URI}-test`
      : env.MONGO_URI;

    const conn = await mongoose.connect(dbUri);
    
    if (env.NODE_ENV === 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host} (Connected safely to TEST database)`);
    } else {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
