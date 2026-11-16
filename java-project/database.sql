-- ========================================================
-- DATABASE SCRIPT FOR COLLEGE LIBRARY MANAGEMENT SYSTEM
-- Course: Object-Oriented Programming (OOP) Lab
-- Database: MySQL
-- ========================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- 1. Books Table (Supports Multiple Genres: English Literature, Mathematics, Coding, Science)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    genre VARCHAR(50) DEFAULT 'General',
    is_available BOOLEAN DEFAULT TRUE
);

-- 2. Members Table (Supports Student and Faculty Member Classifications)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    member_type VARCHAR(20) DEFAULT 'STUDENT'
);

-- 3. Issue Records Table with Time of Issue and Time of Return
CREATE TABLE IF NOT EXISTS issue_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    issue_time VARCHAR(40) NOT NULL,
    return_time VARCHAR(40) DEFAULT '-',
    status VARCHAR(20) DEFAULT 'ISSUED',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- 4. View: JOINs all three tables so the Java backend can just SELECT * FROM borrow_overview
CREATE OR REPLACE VIEW borrow_overview AS
SELECT ir.id,
       ir.book_id,
       b.title,
       ir.member_id,
       m.name,
       m.member_type,
       ir.issue_time,
       ir.return_time,
       ir.status
FROM issue_records ir
JOIN books b   ON ir.book_id   = b.id
JOIN members m ON ir.member_id = m.id;

-- 5. View: Member borrowing summary (how many books each member currently holds)
CREATE OR REPLACE VIEW member_summary AS
SELECT m.id,
       m.name,
       m.phone,
       m.member_type,
       COUNT(ir.id) AS total_borrowed,
       SUM(CASE WHEN ir.status = 'ISSUED' THEN 1 ELSE 0 END) AS active_holds
FROM members m
LEFT JOIN issue_records ir ON ir.member_id = m.id
GROUP BY m.id, m.name, m.phone, m.member_type;

-- Seed Books across multiple academic genres
INSERT INTO books (title, author, genre, is_available) VALUES 
('Introduction to Java Programming', 'Daniel Liang', 'Coding', TRUE),
('Head First Java', 'Kathy Sierra', 'Coding', FALSE),
('Clean Code: A Handbook of Agile Craftsmanship', 'Robert C. Martin', 'Coding', TRUE),
('Data Structures and Algorithms in Java', 'Robert Lafore', 'Coding', TRUE),
('Higher Engineering Mathematics', 'Dr. B. S. Grewal', 'Mathematics', TRUE),
('Discrete Mathematics & Its Applications', 'Kenneth H. Rosen', 'Mathematics', FALSE),
('Linear Algebra Done Right', 'Sheldon Axler', 'Mathematics', TRUE),
('The Great Gatsby', 'F. Scott Fitzgerald', 'English Literature', FALSE),
('The Catcher in the Rye', 'J. D. Salinger', 'English Literature', FALSE),
('To Kill a Mockingbird', 'Harper Lee', 'English Literature', TRUE),
('Pride and Prejudice', 'Jane Austen', 'English Literature', TRUE),
('University Physics with Modern Physics', 'Hugh D. Young', 'Science', TRUE),
('Concepts of Physics', 'Dr. H. C. Verma', 'Science', TRUE),
('The Lean Startup', 'Eric Ries', 'Coding', FALSE);

-- Seed Members
INSERT INTO members (name, phone, member_type) VALUES 
('Rahul Sharma', '9876543210', 'STUDENT'),
('Priya Verma', '9123456780', 'STUDENT'),
('Dr. S. K. Gupta', '9811223344', 'FACULTY'),
('Ananya Deshmukh', '9820011223', 'STUDENT');

-- Seed Borrow Records with Time of Issue and Time of Return
INSERT INTO issue_records (book_id, member_id, issue_time, return_time, status) VALUES 
(2, 1, '2026-10-20 09:30 AM', '-', 'ISSUED'),
(6, 2, '2026-10-20 11:15 AM', '-', 'ISSUED'),
(8, 3, '2026-10-20 02:45 PM', '-', 'ISSUED'),
(9, 4, '2026-10-21 08:00 AM', '-', 'ISSUED'),
(14, 1, '2026-10-21 10:20 AM', '-', 'ISSUED');
