const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./src/seed');
const { authenticateToken } = require('./src/middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For profile photo base64

const PORT = process.env.PORT || 1227;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms_db';

async function startServer() {
  let mongoUri = MONGODB_URI;

  // Use memory server if local MongoDB fails or is not found
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log('Local MongoDB failed, starting in-memory database...');
    const mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB');
  }

  await seedDatabase();

  // Routes
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/employees', require('./src/routes/employees'));
  app.use('/api/attendance', require('./src/routes/attendance'));
  app.use('/api/users', require('./src/routes/users'));
  app.use('/api/departments', require('./src/routes/departments'));
  app.use('/api/leave-requests', require('./src/routes/leave-requests'));
  app.use('/api/leave-balances', require('./src/routes/leave-balances'));
  app.use('/api/performance-reviews', require('./src/routes/performance-reviews'));
  app.use('/api/attrition', require('./src/routes/attrition'));
  app.use('/api/notifications', require('./src/routes/notifications'));
  app.use('/api/analytics', require('./src/routes/analytics'));
  app.use('/api/skills', require('./src/routes/skills'));
  app.use('/api/employee-skills', require('./src/routes/employee-skills'));
  app.use('/api/role-required-skills', require('./src/routes/role-required-skills'));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
