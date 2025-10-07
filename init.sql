-- College Timetable Management System Database Schema

CREATE DATABASE IF NOT EXISTS college_timetable;
USE college_timetable;

-- Users table for authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher') NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE
);

-- Branches table
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Teachers table
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    max_hours_per_day INT DEFAULT 6,
    max_hours_per_week INT DEFAULT 30,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    type ENUM('LECTURE', 'LAB', 'SEMINAR') DEFAULT 'LECTURE'
);

-- Time slots table
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    slot_index INT,
    start_time TIME,
    end_time TIME
);

-- Batches/Sections table
CREATE TABLE batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    name VARCHAR(50) NOT NULL,
    year INT,
    section VARCHAR(10),
    semester INT,
    size INT DEFAULT 60,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Courses table
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    credits INT DEFAULT 3,
    type ENUM('Theory', 'Lab', 'Practical') DEFAULT 'Theory',
    hours_per_week INT DEFAULT 3,
    branch_id INT,
    semester INT,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Teaching assignments
CREATE TABLE teaching_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    teacher_id INT,
    batch_id INT,
    room_type_required ENUM('LECTURE', 'LAB', 'SEMINAR') DEFAULT 'LECTURE',
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (batch_id) REFERENCES batches(id)
);

-- Scheduled classes (generated timetable)
CREATE TABLE scheduled_classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    batch_id INT,
    teacher_id INT,
    room_id INT,
    time_slot_id INT,
    week INT DEFAULT 1,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
);

-- Change requests from teachers
CREATE TABLE change_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    scheduled_class_id INT,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    admin_notes TEXT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (scheduled_class_id) REFERENCES scheduled_classes(id)
);

-- Teacher availability
CREATE TABLE teacher_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    slot_index INT,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- Room availability
CREATE TABLE room_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
    slot_index INT,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
