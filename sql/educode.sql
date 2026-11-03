CREATE DATABASE IF NOT EXISTS educode;
USE educode;
CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100),email VARCHAR(100) UNIQUE);
INSERT IGNORE INTO students(name,email) VALUES ('Estudiante de prueba','estudiante@example.com');
SELECT id,name,email FROM students;
