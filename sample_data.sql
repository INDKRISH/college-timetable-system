-- Sample data for College Timetable Management System

USE college_timetable;

-- Insert sample users (password: admin123 for admin, pass123 for teachers)
INSERT INTO users (username, password, role, email) VALUES
('admin', '$2a$10$8K4QUfx.iXKVPFjcyOjU3OgXqKFdZbYbJ0fW5vLyOzKJmUaWYXHmC', 'admin', 'admin@college.edu'),
('teacher1', '$2a$10$8K4QUfx.iXKVPFjcyOjU3OgXqKFdZbYbJ0fW5vLyOzKJmUaWYXHmC', 'teacher', 'sarah@college.edu'),
('teacher2', '$2a$10$8K4QUfx.iXKVPFjcyOjU3OgXqKFdZbYbJ0fW5vLyOzKJmUaWYXHmC', 'teacher', 'michael@college.edu'),
('teacher3', '$2a$10$8K4QUfx.iXKVPFjcyOjU3OgXqKFdZbYbJ0fW5vLyOzKJmUaWYXHmC', 'teacher', 'emily@college.edu');

-- Insert sample departments
INSERT INTO departments (name, code) VALUES
('Computer Science Engineering', 'CSE'),
('Electronics & Communication', 'ECE'),
('Mechanical Engineering', 'ME');

-- Insert sample branches
INSERT INTO branches (department_id, name, full_name) VALUES
(1, 'CSE', 'Computer Science Engineering'),
(2, 'ECE', 'Electronics & Communication Engineering'),
(3, 'ME', 'Mechanical Engineering');

-- Insert sample teachers
INSERT INTO teachers (user_id, name, email, max_hours_per_day, max_hours_per_week) VALUES
(2, 'Dr. Sarah Johnson', 'sarah@college.edu', 6, 30),
(3, 'Prof. Michael Chen', 'michael@college.edu', 5, 25),
(4, 'Dr. Emily Rodriguez', 'emily@college.edu', 6, 28);

-- Insert sample rooms
INSERT INTO rooms (name, capacity, type) VALUES
('Room 101', 60, 'LECTURE'),
('Room 102', 45, 'LECTURE'),
('Lab 201', 30, 'LAB'),
('Lab 202', 25, 'LAB'),
('Seminar Hall', 100, 'SEMINAR');

-- Insert time slots (Monday to Friday, 6 slots per day)
INSERT INTO time_slots (day_of_week, slot_index, start_time, end_time) VALUES
-- Monday
('Monday', 1, '09:00:00', '10:00:00'),
('Monday', 2, '10:00:00', '11:00:00'),
('Monday', 3, '11:15:00', '12:15:00'),
('Monday', 4, '12:15:00', '13:15:00'),
('Monday', 5, '14:00:00', '15:00:00'),
('Monday', 6, '15:00:00', '16:00:00'),
-- Tuesday
('Tuesday', 1, '09:00:00', '10:00:00'),
('Tuesday', 2, '10:00:00', '11:00:00'),
('Tuesday', 3, '11:15:00', '12:15:00'),
('Tuesday', 4, '12:15:00', '13:15:00'),
('Tuesday', 5, '14:00:00', '15:00:00'),
('Tuesday', 6, '15:00:00', '16:00:00'),
-- Wednesday
('Wednesday', 1, '09:00:00', '10:00:00'),
('Wednesday', 2, '10:00:00', '11:00:00'),
('Wednesday', 3, '11:15:00', '12:15:00'),
('Wednesday', 4, '12:15:00', '13:15:00'),
('Wednesday', 5, '14:00:00', '15:00:00'),
('Wednesday', 6, '15:00:00', '16:00:00'),
-- Thursday
('Thursday', 1, '09:00:00', '10:00:00'),
('Thursday', 2, '10:00:00', '11:00:00'),
('Thursday', 3, '11:15:00', '12:15:00'),
('Thursday', 4, '12:15:00', '13:15:00'),
('Thursday', 5, '14:00:00', '15:00:00'),
('Thursday', 6, '15:00:00', '16:00:00'),
-- Friday
('Friday', 1, '09:00:00', '10:00:00'),
('Friday', 2, '10:00:00', '11:00:00'),
('Friday', 3, '11:15:00', '12:15:00'),
('Friday', 4, '12:15:00', '13:15:00'),
('Friday', 5, '14:00:00', '15:00:00'),
('Friday', 6, '15:00:00', '16:00:00');

-- Insert sample batches
INSERT INTO batches (branch_id, name, year, section, semester, size) VALUES
(1, 'CSE-A', 2, 'A', 3, 55),
(1, 'CSE-B', 2, 'B', 3, 52),
(1, 'CSE-A', 3, 'A', 5, 48),
(2, 'ECE-A', 2, 'A', 3, 45);

-- Insert sample courses
INSERT INTO courses (code, name, credits, type, hours_per_week, branch_id, semester) VALUES
('CS301', 'Data Structures', 4, 'Theory', 4, 1, 3),
('CS302', 'Database Systems', 4, 'Theory', 4, 1, 5),
('CS303', 'Computer Networks', 3, 'Theory', 3, 1, 6),
('CS341', 'Data Structures Lab', 2, 'Lab', 2, 1, 3),
('EC301', 'Digital Electronics', 4, 'Theory', 4, 2, 3),
('EC302', 'Microprocessors', 3, 'Theory', 3, 2, 5);

-- Insert teaching assignments
INSERT INTO teaching_assignments (course_id, teacher_id, batch_id, room_type_required) VALUES
(1, 1, 1, 'LECTURE'), -- Data Structures for CSE-A (3rd sem)
(2, 2, 3, 'LECTURE'), -- Database Systems for CSE-A (5th sem)
(4, 1, 1, 'LAB'),     -- Data Structures Lab for CSE-A (3rd sem)
(5, 3, 4, 'LECTURE'), -- Digital Electronics for ECE-A
(1, 1, 2, 'LECTURE'); -- Data Structures for CSE-B (3rd sem)

-- Insert some sample scheduled classes
INSERT INTO scheduled_classes (course_id, batch_id, teacher_id, room_id, time_slot_id) VALUES
(1, 1, 1, 1, 1), -- Data Structures, CSE-A, Dr. Sarah, Room 101, Monday 9-10
(4, 1, 1, 3, 7), -- Data Structures Lab, CSE-A, Dr. Sarah, Lab 201, Tuesday 9-10
(2, 3, 2, 2, 2), -- Database Systems, CSE-A (5th), Prof. Michael, Room 102, Monday 10-11
(5, 4, 3, 1, 8), -- Digital Electronics, ECE-A, Dr. Emily, Room 101, Tuesday 10-11
(1, 2, 1, 2, 9); -- Data Structures, CSE-B, Dr. Sarah, Room 102, Tuesday 11:15-12:15
