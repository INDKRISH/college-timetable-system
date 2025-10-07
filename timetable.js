const express = require('express');
const db = require('../config/database');
const TimetableScheduler = require('../utils/scheduler');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate new timetable (admin only)
router.post('/generate', authenticateToken, requireRole('admin'), async (req, res) => {
    try {
        const scheduler = new TimetableScheduler();
        const result = await scheduler.generateTimetable();

        res.json({
            message: 'Timetable generated successfully',
            ...result
        });
    } catch (error) {
        console.error('Timetable generation error:', error);
        res.status(500).json({ error: 'Failed to generate timetable' });
    }
});

// Get timetable data
router.get('/', (req, res) => {
    const { branch, semester, year, teacher } = req.query;

    let query = `
        SELECT 
            sc.*,
            c.name as course_name,
            c.code as course_code,
            c.type as course_type,
            t.name as teacher_name,
            r.name as room_name,
            r.type as room_type,
            ts.day_of_week,
            ts.slot_index,
            ts.start_time,
            ts.end_time,
            b.name as batch_name,
            b.section,
            b.semester,
            b.year,
            br.name as branch_name
        FROM scheduled_classes sc
        JOIN courses c ON sc.course_id = c.id
        JOIN teachers t ON sc.teacher_id = t.id
        JOIN rooms r ON sc.room_id = r.id
        JOIN time_slots ts ON sc.time_slot_id = ts.id
        JOIN batches b ON sc.batch_id = b.id
        JOIN branches br ON b.branch_id = br.id
        WHERE 1=1
    `;

    const params = [];

    if (branch) {
        query += ' AND br.id = ?';
        params.push(branch);
    }

    if (semester) {
        query += ' AND b.semester = ?';
        params.push(semester);
    }

    if (year) {
        query += ' AND b.year = ?';
        params.push(year);
    }

    if (teacher) {
        query += ' AND t.id = ?';
        params.push(teacher);
    }

    query += ' ORDER BY ts.day_of_week, ts.slot_index';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

module.exports = router;
