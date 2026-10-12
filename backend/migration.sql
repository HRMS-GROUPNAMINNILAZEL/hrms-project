-- =====================================================================
-- HRMS Database Migration & Setup Helper
-- Run this in phpMyAdmin or MySQL CLI against your `hrms_db` database.
-- All statements are safe to run (idempotent / IF NOT EXISTS).
-- =====================================================================

USE `hrms_db`;

-- 1. Notifications table
-- (Used by in-app alert and notification system)
CREATE TABLE IF NOT EXISTS `notifications` (
    `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'info',
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Password reset tokens table
-- (Used by the "Forgot Password" / self-service recovery system)
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `token_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` TIMESTAMP NOT NULL,
    `used` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_reset_token` (`token`),
    KEY `idx_reset_user_id` (`user_id`),
    CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Profile photo column on employees table
-- (Enables profile picture upload & camera avatar snapshot)
-- Note: Running this procedure adds `profile_photo` ONLY if it doesn't exist yet.
SET @col_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'employees'
      AND COLUMN_NAME = 'profile_photo'
);

SET @alter_sql = IF(@col_exists = 0,
    'ALTER TABLE `employees` ADD COLUMN `profile_photo` LONGTEXT NULL;',
    'SELECT "Column profile_photo already exists in employees table." AS info;'
);

PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

