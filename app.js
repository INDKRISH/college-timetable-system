const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const timetableRoutes = require('./routes/timetable');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/timetable', timetableRoutes);

// Default route to serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/login.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 College Timetable Management System`);
    console.log(`👨‍💻 Admin Login: admin/admin123`);
    console.log(`👩‍🏫 Teacher Login: teacher1/pass123`);
    console.log(`👨‍🎓 Student: No login required`);
});

module.exports = app;
