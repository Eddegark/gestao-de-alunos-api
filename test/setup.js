import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seed } from '../src/database/seed.js';

let mongoServer;

export async function setupTestDB() {
  if (mongoose.connection.readyState !== 0) {
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await seed();
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
