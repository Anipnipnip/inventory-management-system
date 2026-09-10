import mongoose from 'mongoose';

// Fires once, whenever the connection drops after it was first established
// (e.g. MongoDB restarts). Logging this is what turns a silent, confusing
// "requests suddenly stop working" bug into something you can diagnose.
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

// Opens the connection to MongoDB. Called once, before the Express server
// starts listening, so the app never accepts requests it can't actually
// serve. On failure we exit immediately instead of limping along -- a
// server "half working" without a database is worse than one that failed
// to start clearly.
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
};
