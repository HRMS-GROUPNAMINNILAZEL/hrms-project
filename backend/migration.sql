-- Run this in phpMyAdmin against hrms_db

-- 1. Notifications table (already created successfully)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 2. Profile photo column on employees
-- NOTE: MySQL does not support "ADD COLUMN IF NOT EXISTS"
-- If you get "Duplicate column" error, the column already exists and you can ignore it.
ALTER TABLE employees ADD COLUMN profile_photo LONGTEXT;
