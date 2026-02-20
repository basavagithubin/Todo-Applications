const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || '';
  if (!uri) {
    throw new Error('MONGO_URI is required');
  }
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || 'todoapp',
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '40', 10),
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '4', 10),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
};

module.exports = { connectDB };
