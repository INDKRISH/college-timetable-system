const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../config/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }

        // Query user
        const query = 'SELECT * FROM users WHERE username = ? AND role = ?';
        db.query(query, [username, role], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = results[0];

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user.id, user.role);

            // Get additional user info
            let userInfo = { id: user.id, username: user.username, role: user.role };

            if (user.role === 'teacher') {
                const teacherQuery = 'SELECT * FROM teachers WHERE user_id = ?';
                db.query(teacherQuery, [user.id], (err, teacherResults) => {
                    if (err) {
                        console.error('Teacher query error:', err);
                    } else if (teacherResults.length > 0) {
                        userInfo.teacherInfo = teacherResults[0];
                    }

                    res.json({
                        token,
                        user: userInfo,
                        message: 'Login successful'
                    });
                });
            } else {
                res.json({
                    token,
                    user: userInfo,
                    message: 'Login successful'
                });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Register new user (admin only)
router.post('/register', async (req, res) => {
    try {
        const { username, password, role, email, name } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const userQuery = 'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)';
        db.query(userQuery, [username, hashedPassword, role, email], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const userId = result.insertId;

            // If teacher, also insert into teachers table
            if (role === 'teacher' && name) {
                const teacherQuery = 'INSERT INTO teachers (user_id, name, email) VALUES (?, ?, ?)';
                db.query(teacherQuery, [userId, name, email], (err) => {
                    if (err) {
                        console.error('Teacher insert error:', err);
                    }
                });
            }

            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
