import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  // Avoid throwing during import — log a warning so build can complete.
  // At runtime, attempts to use the DB will fail until this env is set.
  // eslint-disable-next-line no-console
  console.warn('Warning: MONGODB_URI not set. Mongo client will not be initialized.');
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient>;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise as Promise<MongoClient>;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Placeholder promise: do not reject immediately (would create unhandled rejection)
  // — this keeps module import safe. Any runtime attempt to use the DB will hang
  // until the env is set and the server restarted; that's preferable to a hard
  // crash during build.
  clientPromise = new Promise(() => {});
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise as Promise<MongoClient>;
