require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');// frontend ko backend ka access dene ke lie

// Import routes
// Note: If any routes are missing, they should be created or commented out.
// For this merge, assuming the routes exist from Diksha's branch.
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const coordinatorRoutes = require('./routes/coordinatorRoutes');
const prepRoutes = require('./routes/prepRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes        = require('./routes/aiRoutes');

const app = express();

// Middleware
// Allow all origins for seamless local development (Vite can run on 5174, 5175 etc)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
if (authRoutes) app.use('/api/auth', authRoutes);
if (studentRoutes) app.use('/api/students', studentRoutes);
if (jobRoutes) {
  app.use('/api/jobs', jobRoutes);
  app.use('/api/opportunities', jobRoutes);
}
if (applicationRoutes) app.use('/api/applications', applicationRoutes);
if (interviewRoutes) app.use('/api/interviews', interviewRoutes);
if (coordinatorRoutes) app.use('/api/coordinator', coordinatorRoutes);
if (notificationRoutes) app.use('/api/notifications', notificationRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (prepRoutes) app.use('/api/prep', prepRoutes);
if (aiRoutes) app.use('/api/ai', aiRoutes);

// [DEBUG] TEMPORARY route to verify database connection and collections
app.get('/api/debug/db-status', async (req, res) => {
  try {
    const dbName = mongoose.connection.name;
    // Query MongoDB natively for explicit collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Import and verify Student model dynamically
    const Student = require('./models/Student');
    const studentCount = await Student.countDocuments();

    res.json({
      status: "success",
      database: dbName,
      availableCollections: collectionNames,
      studentCollectionName: Student.collection.name,
      totalStudentProfiles: studentCount,
      warning: "Ensure you remove this debug route before production deployment"
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: "Placement Dashboard API Backend Running with MongoDB!" });
});

// Environment setup
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/applywise_db';

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then((conn) => {
    console.log(`✅ Connected to MongoDB Database: ${conn.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running on port ${PORT}`);
  console.log(`🛠️  Debug Route ready: http://localhost:${PORT}/api/debug/db-status`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is in use. Attempting fallback to port 5002...`);
    app.listen(5002, () => {
      console.log(`Server is successfully running on port 5002`);
    });
  } else {
    console.error(err);
  }
});
