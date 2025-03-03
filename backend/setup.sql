
-- Database initialization script
-- Run this script to set up the tables in your database

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date VARCHAR(10) NOT NULL, -- Using VARCHAR to store DD/MM/YYYY format
  time_slot VARCHAR(20) NOT NULL,
  status ENUM('Pending', 'Confirmed', 'Canceled', 'Not Responding') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: password)
-- In production, change the default password
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2y$10$8x5qOtDGEVkGt/yBSIRgOuWZHMSGLZJ/JwodlrYTrAFKIm5I5aLa2')
ON DUPLICATE KEY UPDATE username = username;
