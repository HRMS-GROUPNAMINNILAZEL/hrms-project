-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 12, 2026 at 07:10 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hrms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in` time DEFAULT NULL,
  `time_out` time DEFAULT NULL,
  `status` enum('present','late','absent','on_leave') NOT NULL DEFAULT 'present'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `employee_id`, `date`, `time_in`, `time_out`, `status`) VALUES
(1, 5, '2026-08-20', '04:30:57', '04:31:07', 'present'),
(2, 4, '2026-08-28', '18:32:36', '18:33:11', 'present'),
(3, 4, '2026-10-12', '13:09:51', '14:02:20', 'present');

-- --------------------------------------------------------

--
-- Table structure for table `attrition_indicators`
--

CREATE TABLE `attrition_indicators` (
  `indicator_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `snapshot_date` date NOT NULL,
  `late_attendance_count_30d` int(11) NOT NULL DEFAULT '0',
  `leave_frequency_30d` int(11) NOT NULL DEFAULT '0',
  `days_since_last_promotion` int(11) DEFAULT NULL,
  `performance_trend` enum('declining','stable','improving') DEFAULT NULL,
  `risk_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `risk_level` enum('low','medium','high') NOT NULL DEFAULT 'low'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attrition_indicators`
--

INSERT INTO `attrition_indicators` (`indicator_id`, `employee_id`, `snapshot_date`, `late_attendance_count_30d`, `leave_frequency_30d`, `days_since_last_promotion`, `performance_trend`, `risk_score`, `risk_level`) VALUES
(1, 1, '2026-08-28', 0, 0, NULL, NULL, '0.00', 'low'),
(2, 4, '2026-08-28', 0, 2, NULL, NULL, '10.00', 'low'),
(3, 5, '2026-08-28', 0, 1, NULL, NULL, '5.00', 'low'),
(4, 6, '2026-08-28', 0, 0, NULL, NULL, '0.00', 'low'),
(5, 1, '2026-09-28', 0, 0, NULL, NULL, '0.00', 'low'),
(6, 4, '2026-09-28', 0, 2, NULL, NULL, '10.00', 'low'),
(7, 5, '2026-09-28', 0, 0, NULL, NULL, '0.00', 'low'),
(8, 6, '2026-09-28', 0, 0, NULL, NULL, '0.00', 'low');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `department_head_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `department_name`, `department_head_id`) VALUES
(1, 'Human Resources', 5),
(2, 'Engineering', NULL),
(3, 'Sales', NULL),
(4, 'Finance', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `hire_date` date NOT NULL,
  `status` enum('active','resigned','terminated','on_leave') NOT NULL DEFAULT 'active',
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_photo` longtext
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `user_id`, `first_name`, `last_name`, `department_id`, `position`, `manager_id`, `hire_date`, `status`, `contact_number`, `address`, `created_at`, `profile_photo`) VALUES
(1, 1, 'Juan', 'Dela Cruz', 2, 'Software Engineer', NULL, '2026-08-20', 'active', '09171234567', 'Bacoor, Cavite', '2026-08-20 14:06:51', NULL),
(4, 3, 'Axzel Aze', 'Andres', 4, 'Accountant', NULL, '2026-08-20', 'active', '09939480398', 'Bacoor, Cavite', '2026-08-20 19:05:58', 'data:image/jpeg;base64,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'),
(5, 4, 'Jacob', 'Santarin', 1, 'HR', NULL, '2026-08-20', 'active', '09929379876', 'Bacoor, Cavite', '2026-08-20 19:14:11', NULL),
(6, 5, 'John', 'Doe', 2, 'Electrical Engineer', NULL, '2026-08-21', 'active', '09166961015', 'Bacoor, Cavite', '2026-08-21 19:28:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_skills`
--

CREATE TABLE `employee_skills` (
  `employee_skill_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency_level` enum('beginner','intermediate','expert') NOT NULL DEFAULT 'beginner',
  `acquired_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `employee_skills`
--

INSERT INTO `employee_skills` (`employee_skill_id`, `employee_id`, `skill_id`, `proficiency_level`, `acquired_date`) VALUES
(1, 4, 4, 'intermediate', '2026-08-28');

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `balance_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type` enum('sick','vacation','emergency','maternity','paternity','unpaid') NOT NULL,
  `total_days` int(11) NOT NULL DEFAULT '0',
  `used_days` int(11) NOT NULL DEFAULT '0',
  `year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `leave_balances`
--

INSERT INTO `leave_balances` (`balance_id`, `employee_id`, `leave_type`, `total_days`, `used_days`, `year`) VALUES
(1, 5, 'sick', 15, 0, 2026),
(2, 5, 'vacation', 15, 0, 2026),
(3, 5, 'emergency', 5, 0, 2026),
(4, 5, 'maternity', 105, 0, 2026),
(5, 5, 'paternity', 7, 0, 2026),
(6, 5, 'unpaid', 10, 0, 2026),
(7, 1, 'sick', 15, 0, 2026),
(8, 1, 'vacation', 15, 0, 2026),
(9, 1, 'emergency', 5, 0, 2026),
(10, 1, 'maternity', 105, 0, 2026),
(11, 1, 'paternity', 7, 0, 2026),
(12, 1, 'unpaid', 0, 0, 2026),
(13, 4, 'sick', 15, 6, 2026),
(14, 4, 'vacation', 15, 8, 2026),
(15, 4, 'emergency', 5, 0, 2026),
(16, 4, 'maternity', 105, 0, 2026),
(17, 4, 'paternity', 7, 0, 2026),
(18, 4, 'unpaid', 0, 0, 2026),
(19, 6, 'sick', 15, 0, 2026),
(20, 6, 'vacation', 15, 0, 2026),
(21, 6, 'emergency', 5, 0, 2026),
(22, 6, 'maternity', 105, 0, 2026),
(23, 6, 'paternity', 7, 0, 2026),
(24, 6, 'unpaid', 0, 0, 2026);

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `leave_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type` enum('sick','vacation','emergency','maternity','paternity','unpaid') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`leave_id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `approved_by`, `requested_at`) VALUES
(7, 4, 'sick', '2026-10-05', '2026-10-10', 'sumakit po bayag ko', 'approved', 2, '2026-09-28 10:59:16'),
(11, 4, 'sick', '2026-10-12', '2026-10-17', 'Sick Leave', 'rejected', 2, '2026-10-12 06:03:46'),
(12, 4, 'sick', '2026-10-12', '2026-10-16', 'Sick leave', 'rejected', 2, '2026-10-12 06:27:06'),
(14, 4, 'vacation', '2026-10-12', '2026-10-19', 'Overnight', 'approved', 2, '2026-10-12 06:32:19');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(500) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, 3, 'Your sick leave request (2026-10-05 to 2026-10-10) has been approved.', 'leave_approved', 1, '2026-09-28 02:59:37'),
(2, 3, 'Your sick leave request (2026-10-12 to 2026-10-17) has been rejected.', 'leave_rejected', 1, '2026-10-11 22:04:15'),
(3, 3, 'Your sick leave request (2026-10-12 to 2026-10-16) has been rejected. Reason: POTANGINA MO AJSDJASDJAJDJASD', 'leave_rejected', 1, '2026-10-11 22:27:28'),
(4, 3, 'Your vacation leave request (2026-10-12 to 2026-10-23) has been rejected. Reason: AYOKO', 'leave_rejected', 1, '2026-10-11 22:30:18'),
(5, 3, 'Your vacation leave request (2026-10-12 to 2026-10-19) has been approved.', 'leave_approved', 1, '2026-10-11 22:32:31');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `token_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`token_id`, `user_id`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 4, 'uqQ_yuXssrcWE7t5WVfpdOn-3lqUj5wfYAB4aojDTl0', '2026-08-27 22:52:26', 0, '2026-08-28 06:22:25'),
(2, 4, '7mNA8RIqwCsp4NrfbGObDTnhDuq3ruw-LcxGPTWwKt4', '2026-08-27 23:57:27', 1, '2026-08-28 07:27:27'),
(3, 3, 'GdX_eHeCxMP1eTYD9fAzRS5It5HuufdX_go_Ymubsl4', '2026-08-28 00:10:49', 1, '2026-08-28 07:40:48'),
(4, 3, 'TNAv4Olh3nglizCUEiXF4B9Wz1kGbItty-av4Qu5PWI', '2026-09-28 00:44:17', 1, '2026-09-28 08:14:17'),
(5, 4, 'rDqmnh-kylS6Eo-JSThX20rrlc--jAGMgEgiK0S-yVk', '2026-09-28 00:45:46', 1, '2026-09-28 08:15:45'),
(6, 5, '1WaKHhiLvisJs1ZRLlur1kDubtr9sx9hSkijraJHcoQ', '2026-09-28 00:47:20', 1, '2026-09-28 08:17:20');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `payroll_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `pay_period_start` date NOT NULL,
  `pay_period_end` date NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL,
  `deductions` decimal(12,2) NOT NULL DEFAULT '0.00',
  `bonuses` decimal(12,2) NOT NULL DEFAULT '0.00',
  `net_pay` decimal(12,2) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`payroll_id`, `employee_id`, `pay_period_start`, `pay_period_end`, `basic_salary`, `deductions`, `bonuses`, `net_pay`, `generated_at`) VALUES
(1, 5, '2026-08-21', '2026-08-28', '18000.00', '5000.00', '2000.00', '15000.00', '2026-08-20 20:30:16');

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `review_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `review_period` varchar(50) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT NULL,
  `comments` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`review_id`, `employee_id`, `reviewer_id`, `review_period`, `rating`, `comments`, `created_at`) VALUES
(1, 4, 5, 'Q3 2026', '3.5', 'Can improve punctuality and performance.', '2026-08-28 10:26:10');

-- --------------------------------------------------------

--
-- Table structure for table `role_required_skills`
--

CREATE TABLE `role_required_skills` (
  `id` int(11) NOT NULL,
  `position` varchar(100) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `skill_id` int(11) NOT NULL,
  `required_level` enum('beginner','intermediate','expert') NOT NULL DEFAULT 'intermediate'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `role_required_skills`
--

INSERT INTO `role_required_skills` (`id`, `position`, `department_id`, `skill_id`, `required_level`) VALUES
(1, 'Accountant', 4, 4, 'intermediate');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `category` enum('technical','soft','certification') NOT NULL DEFAULT 'technical'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `skills`
--

INSERT INTO `skills` (`skill_id`, `skill_name`, `category`) VALUES
(1, 'Java', 'technical'),
(2, 'React', 'technical'),
(3, 'Project Management', 'soft'),
(4, 'Communication', 'soft'),
(5, 'PMP Certification', 'certification');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('admin','hr','manager','employee') NOT NULL DEFAULT 'employee',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `role`, `is_active`, `created_at`) VALUES
(1, 'jdela_cruz', '$2a$10$i9C8QyviHwb62UlPJbs19.AKuCgOvajYx0MUGjTd2IvCudLRkiFRO', 'jdela_cruz@example.com', 'hr', 1, '2026-08-20 13:56:10'),
(2, 'admin', '$2a$10$qZ5azcLyeXWzfUKJxxjXJuBTS4NaCR7MbY7bfGkqQZJXFagQs9W/i', 'admin@test.com', 'admin', 1, '2026-08-20 14:43:11'),
(3, 'Andres', '$2a$10$EzOrlenRxR/Qx2c7R5RsSOXxVE3aUPbgkZFgbdpKZLZt0DeQ79Dja', 'aaandress@employee.work.com', 'employee', 1, '2026-08-20 19:05:58'),
(4, 'Jacob', '$2a$10$lxAyBx3Q5OZcpo0mGHv2x.I79vhZUJbO3YKvKZEcVcjRBnaKTCbXC', 'jacob@example.com', 'hr', 1, '2026-08-20 19:14:11'),
(5, 'john', '$2a$10$af.2KAtO7lKcqo1EuCE3UeO5ZfheueE4Ohs5OoKGXUr2jH.AObc3q', 'aambatali3@gmail.com', 'manager', 1, '2026-08-21 19:28:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `attrition_indicators`
--
ALTER TABLE `attrition_indicators`
  ADD PRIMARY KEY (`indicator_id`),
  ADD UNIQUE KEY `unique_employee_snapshot` (`employee_id`,`snapshot_date`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`),
  ADD KEY `fk_department_head` (`department_head_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `employee_skills`
--
ALTER TABLE `employee_skills`
  ADD PRIMARY KEY (`employee_skill_id`),
  ADD UNIQUE KEY `unique_employee_skill` (`employee_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`balance_id`),
  ADD UNIQUE KEY `unique_employee_leave_year` (`employee_id`,`leave_type`,`year`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`leave_id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `leave_requests_ibfk_2` (`approved_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`payroll_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `role_required_skills`
--
ALTER TABLE `role_required_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`skill_id`),
  ADD UNIQUE KEY `skill_name` (`skill_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `attrition_indicators`
--
ALTER TABLE `attrition_indicators`
  MODIFY `indicator_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `employee_skills`
--
ALTER TABLE `employee_skills`
  MODIFY `employee_skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `balance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `leave_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `payroll_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role_required_skills`
--
ALTER TABLE `role_required_skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `attrition_indicators`
--
ALTER TABLE `attrition_indicators`
  ADD CONSTRAINT `attrition_indicators_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `fk_department_head` FOREIGN KEY (`department_head_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL;

--
-- Constraints for table `employee_skills`
--
ALTER TABLE `employee_skills`
  ADD CONSTRAINT `employee_skills_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `employee_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_required_skills`
--
ALTER TABLE `role_required_skills`
  ADD CONSTRAINT `role_required_skills_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `role_required_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
