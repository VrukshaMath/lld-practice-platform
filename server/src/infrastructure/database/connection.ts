import mongoose from 'mongoose';

let memoryServer: any = null;

export async function connectDatabase(customUri?: string): Promise<string> {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection.host;
  }

  const envUri = customUri || process.env.MONGODB_URI;

  if (envUri && envUri.trim() !== '') {
    try {
      console.log(`Connecting to MongoDB at ${envUri}...`);
      await mongoose.connect(envUri, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to external MongoDB successfully.');
      return envUri;
    } catch (err: any) {
      console.warn(`External MongoDB connection failed (${err.message}). Falling back to in-memory database...`);
    }
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    console.log(`Starting isolated in-memory MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected to in-memory MongoDB successfully.');
    return uri;
  } catch (err: any) {
    console.error('Failed to initialize MongoDB connection:', err);
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
