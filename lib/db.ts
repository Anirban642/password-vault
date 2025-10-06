import mongoose from 'mongoose';

export async function connectDB() {
  // Check if already connected (readyState 1 means connected)
  if (mongoose.connections[0].readyState) {
    console.log('Already connected to DB');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');
  } catch (error) {
    console.error('DB connection error:', error);
    throw new Error('Failed to connect to DB');
  }
}