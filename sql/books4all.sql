CREATE DATABASE IF NOT EXISTS books4all;
USE books4all;
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(100),email VARCHAR(100) UNIQUE);
CREATE TABLE IF NOT EXISTS books (id INT AUTO_INCREMENT PRIMARY KEY,title VARCHAR(200),author VARCHAR(100),file_url VARCHAR(300));
CREATE TABLE IF NOT EXISTS downloads (id INT AUTO_INCREMENT PRIMARY KEY,user_id INT,book_id INT,download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id),FOREIGN KEY(book_id) REFERENCES books(id));
INSERT IGNORE INTO users(name,email) VALUES ('Lector de prueba','lector@example.com');
INSERT INTO books(title,author,file_url) SELECT 'Libro de prueba','Autor de prueba','https://books4all-library-135425822911.s3.us-east-1.amazonaws.com/libro1.pdf' WHERE NOT EXISTS (SELECT 1 FROM books WHERE title='Libro de prueba');
INSERT INTO downloads(user_id,book_id) SELECT u.id,b.id FROM users u JOIN books b ON b.title='Libro de prueba' WHERE u.email='lector@example.com' AND NOT EXISTS(SELECT 1 FROM downloads d WHERE d.user_id=u.id AND d.book_id=b.id);
SELECT u.name,b.title,d.download_date FROM downloads d JOIN users u ON d.user_id=u.id JOIN books b ON d.book_id=b.id;
