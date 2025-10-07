const db = require('../config/database');

class TimetableScheduler {
    constructor() {
        this.conflicts = [];
    }

    // Simple scheduling algorithm - can be replaced with OR-Tools later
    async generateTimetable() {
        try {
            this.conflicts = [];

            // Clear existing schedules (for demo)
            await this.clearExistingSchedule();

            // Get all teaching assignments
            const assignments = await this.getTeachingAssignments();

            // Get available time slots
            const timeSlots = await this.getTimeSlots();

            // Get available rooms
            const rooms = await this.getRooms();

            // Schedule each assignment
            for (const assignment of assignments) {
                await this.scheduleAssignment(assignment, timeSlots, rooms);
            }

            return {
                success: true,
                scheduled: assignments.length,
                conflicts: this.conflicts
            };

        } catch (error) {
            console.error('Scheduling error:', error);
            throw error;
        }
    }

    async clearExistingSchedule() {
        return new Promise((resolve, reject) => {
            db.query('DELETE FROM scheduled_classes WHERE is_locked = FALSE', (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    async getTeachingAssignments() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    ta.*,
                    c.hours_per_week,
                    c.type as course_type,
                    b.size as batch_size
                FROM teaching_assignments ta
                JOIN courses c ON ta.course_id = c.id
                JOIN batches b ON ta.batch_id = b.id
            `;

            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async getTimeSlots() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM time_slots ORDER BY day_of_week, slot_index';
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async getRooms() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM rooms ORDER BY capacity DESC';
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    async scheduleAssignment(assignment, timeSlots, rooms) {
        const hoursNeeded = assignment.hours_per_week || 1;
        let hoursScheduled = 0;

        // Find suitable rooms
        const suitableRooms = rooms.filter(room => 
            room.type === assignment.room_type_required &&
            room.capacity >= assignment.batch_size
        );

        if (suitableRooms.length === 0) {
            this.conflicts.push({
                assignment: assignment.id,
                reason: 'No suitable rooms available'
            });
            return;
        }

        // Try to schedule required hours
        for (const timeSlot of timeSlots) {
            if (hoursScheduled >= hoursNeeded) break;

            for (const room of suitableRooms) {
                if (hoursScheduled >= hoursNeeded) break;

                // Check for conflicts
                const hasConflict = await this.checkConflicts(
                    assignment.teacher_id,
                    assignment.batch_id,
                    room.id,
                    timeSlot.id
                );

                if (!hasConflict) {
                    // Schedule the class
                    await this.createScheduledClass(
                        assignment.course_id,
                        assignment.batch_id,
                        assignment.teacher_id,
                        room.id,
                        timeSlot.id
                    );
                    hoursScheduled++;
                }
            }
        }

        if (hoursScheduled < hoursNeeded) {
            this.conflicts.push({
                assignment: assignment.id,
                reason: `Only scheduled ${hoursScheduled}/${hoursNeeded} hours`,
                course_id: assignment.course_id,
                batch_id: assignment.batch_id
            });
        }
    }

    async checkConflicts(teacherId, batchId, roomId, timeSlotId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count FROM scheduled_classes
                WHERE time_slot_id = ? AND (
                    teacher_id = ? OR
                    batch_id = ? OR
                    room_id = ?
                )
            `;

            db.query(query, [timeSlotId, teacherId, batchId, roomId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count > 0);
            });
        });
    }

    async createScheduledClass(courseId, batchId, teacherId, roomId, timeSlotId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO scheduled_classes (course_id, batch_id, teacher_id, room_id, time_slot_id)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(query, [courseId, batchId, teacherId, roomId, timeSlotId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = TimetableScheduler;
