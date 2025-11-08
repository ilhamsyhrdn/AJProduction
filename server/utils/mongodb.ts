import mongoose from 'mongoose';

// Do not throw at module import time — that prevents builds when envs are not yet set.
// We delay runtime errors to the actual connection attempt inside `dbConnect()`.
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  // friendly warning for build logs — actual connection will fail later if attempted
  // (we avoid throwing here so Vercel / CI can complete the build even before secrets
  //  are provided; the app will still require the env to function at runtime)
  // eslint-disable-next-line no-console
  console.warn('Warning: MONGODB_URI not set. Database connections will fail at runtime if used.');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable at runtime. Set MONGODB_URI in your environment.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;

