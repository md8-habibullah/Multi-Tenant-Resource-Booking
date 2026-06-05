import mongoose from 'mongoose';
import { connectDB } from '../src/config/database';

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
