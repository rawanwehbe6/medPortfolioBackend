-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2025 at 07:27 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medportfolio`
--

-- --------------------------------------------------------

--
-- Table structure for table `accomplishments`
--

CREATE TABLE `accomplishments` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `User_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accomplishments`
--

INSERT INTO `accomplishments` (`id`, `title`, `description`, `file_path`, `User_ID`) VALUES
(3, 'test2', 'test', '/uploads/1741390401930.jpg', 22),
(7, 'test', 'test', 'uploads/1745867548353.png', 22);

-- --------------------------------------------------------

--
-- Table structure for table `bau`
--

CREATE TABLE `bau` (
  `Bau_ID` int(11) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Location` varchar(255) NOT NULL,
  `ContactNumber` varchar(50) NOT NULL,
  `Campus` varchar(255) NOT NULL,
  `NbOfTrainees` int(11) NOT NULL,
  `Logo` varchar(255) NOT NULL,
  `AffiliatedInstitutions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`AffiliatedInstitutions`)),
  `AdministrationContact` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `case_based_discussion_assessment`
--

CREATE TABLE `case_based_discussion_assessment` (
  `id` int(9) NOT NULL,
  `resident_id` int(9) NOT NULL,
  `supervisor_id` int(9) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `diagnosis` varchar(512) DEFAULT NULL,
  `case_complexity` enum('Low','Moderate','High') DEFAULT NULL,
  `Investigation_Referral` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `treatment` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `future_planning` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `history_taking` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `overall_clinical_care` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `assessor_comment` varchar(4096) DEFAULT NULL,
  `resident_comment` varchar(4096) DEFAULT NULL,
  `resident_signature` varchar(255) DEFAULT NULL,
  `assessor_signature` varchar(255) DEFAULT NULL,
  `sent` tinyint(1) NOT NULL DEFAULT 0,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `agreed_action_plan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_based_discussion_assessment`
--

INSERT INTO `case_based_discussion_assessment` (`id`, `resident_id`, `supervisor_id`, `date`, `diagnosis`, `case_complexity`, `Investigation_Referral`, `treatment`, `future_planning`, `history_taking`, `overall_clinical_care`, `assessor_comment`, `resident_comment`, `resident_signature`, `assessor_signature`, `sent`, `completed`, `updated_at`, `agreed_action_plan`) VALUES
(3, 22, 28, '2025-03-30', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'uploads\\1743289824406.png', 0, 0, '2025-04-16 18:24:27', ''),
(5, 22, 28, '2025-04-02', 'Flu23', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment22', 'Updated Comment', 'uploads\\1744411343092.jpg', 'uploads\\1743549471199.jpg', 1, 1, '2025-04-16 18:24:27', ''),
(6, 22, 28, '2025-04-02', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, NULL, 1, 0, '2025-04-16 18:24:27', ''),
(9, 22, 28, '2025-04-28', 'Flu', NULL, 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, NULL, 1, 0, '2025-04-28 19:14:29', ''),
(10, 22, 28, '2025-05-05', 'Flu23', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment22', 'Updated Comment', 'http://localhost:3000/uploads/1746457744303.png', 'http://localhost:3000/uploads/1746457738970.png', 1, 1, '2025-05-05 15:09:04', ''),
(13, 22, 28, '2025-05-07', 'Flu', NULL, 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, '/uploads/1746637402589ef14b6b81e938d31e2400b6e497af2a57c6c.png', 0, 0, '2025-05-07 17:03:22', ''),
(14, 22, 28, '2025-05-12', 'Flu', NULL, 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, '/uploads/174706243662205fa20ecfc4ab8da62571d51eb94596e239f.png', 0, 0, '2025-05-12 15:07:16', 'abc');

-- --------------------------------------------------------

--
-- Table structure for table `case_presentations`
--

CREATE TABLE `case_presentations` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `diagnosis_problem` text DEFAULT NULL,
  `presented_attended` enum('P','A') DEFAULT NULL,
  `moderator_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `message`, `created_at`, `user_id`, `is_visible`) VALUES
(1, 'Lorence', 'This is a test message for the contact form.', '2025-04-06 09:39:13', NULL, 0),
(2, 'Lorence', 'This is a test message for the contact form.', '2025-04-06 09:40:27', NULL, 0),
(3, 'Lorence', 'This is a test message for the contact form.', '2025-04-06 09:42:14', NULL, 0),
(4, 'Lorence', 'This is a test message for the contact form.', '2025-04-12 19:11:02', 27, 0),
(5, 'supervisor', 'This is a test message for the contact form.', '2025-04-12 19:11:33', 29, 1),
(7, 'trainee', 'This is a test message for the contact form.', '2025-04-12 19:14:43', 27, 1),
(8, 'supervisor test', 'This is a test message for the contact form.', '2025-04-12 19:15:46', 29, 1),
(9, 'supervisor test', 'This is a test message for the contact form.', '2025-04-12 19:26:27', 29, 1);

-- --------------------------------------------------------

--
-- Table structure for table `departmental_activities`
--

CREATE TABLE `departmental_activities` (
  `id` int(11) NOT NULL,
  `activity_category` enum('Community Health Activities','Conferences/Workshops','Others') NOT NULL,
  `details` text NOT NULL,
  `date` date NOT NULL,
  `faculty_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dops`
--

CREATE TABLE `dops` (
  `id` int(11) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `trainee_name` varchar(255) DEFAULT NULL,
  `assessment_date` date DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `indications` int(11) DEFAULT NULL CHECK (`indications` between 1 and 4),
  `indications_comment` text DEFAULT NULL,
  `consent` int(11) DEFAULT NULL CHECK (`consent` between 1 and 4),
  `consent_comment` text DEFAULT NULL,
  `preparation` int(11) DEFAULT NULL CHECK (`preparation` between 1 and 4),
  `preparation_comment` text DEFAULT NULL,
  `analgesia` int(11) DEFAULT NULL CHECK (`analgesia` between 1 and 4),
  `analgesia_comment` text DEFAULT NULL,
  `asepsis` int(11) DEFAULT NULL CHECK (`asepsis` between 1 and 4),
  `asepsis_comment` text DEFAULT NULL,
  `technical_aspects` int(11) DEFAULT NULL CHECK (`technical_aspects` between 1 and 4),
  `technical_aspects_comment` text DEFAULT NULL,
  `unexpected_events` int(11) DEFAULT NULL CHECK (`unexpected_events` between 1 and 4),
  `unexpected_events_comment` text DEFAULT NULL,
  `documentation` int(11) DEFAULT NULL CHECK (`documentation` between 1 and 4),
  `documentation_comment` text DEFAULT NULL,
  `communication` int(11) DEFAULT NULL CHECK (`communication` between 1 and 4),
  `communication_comment` text DEFAULT NULL,
  `professionalism` int(11) DEFAULT NULL CHECK (`professionalism` between 1 and 4),
  `professionalism_comment` text DEFAULT NULL,
  `global_summary` enum('Level 0','Level 1a','Level 1b','Level 2a','Level 2b','Level 3a','Level 3b','Level 4a','Level 4b') DEFAULT NULL,
  `procedure_name` varchar(255) DEFAULT NULL,
  `previous_attempts` int(11) DEFAULT NULL,
  `procedure_type` enum('Emergency','Elective') DEFAULT NULL,
  `simulated` enum('Yes','No') DEFAULT NULL,
  `simulation_details` text DEFAULT NULL,
  `difficulty` enum('Easier','Average','More difficult') DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `developmental_needs` text DEFAULT NULL,
  `recommended_actions` text DEFAULT NULL,
  `trainee_reflection` text DEFAULT NULL,
  `trainee_signature` varchar(255) DEFAULT NULL,
  `supervisor_signature` varchar(255) DEFAULT NULL,
  `is_signed_by_supervisor` tinyint(1) DEFAULT 0,
  `is_signed_by_trainee` tinyint(1) DEFAULT 0,
  `is_draft` tinyint(1) DEFAULT 1,
  `is_sent_to_trainee` tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `do_well` text DEFAULT NULL,
  `improve_change` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dops`
--

INSERT INTO `dops` (`id`, `supervisor_id`, `supervisor_name`, `resident_id`, `trainee_name`, `assessment_date`, `hospital`, `indications`, `indications_comment`, `consent`, `consent_comment`, `preparation`, `preparation_comment`, `analgesia`, `analgesia_comment`, `asepsis`, `asepsis_comment`, `technical_aspects`, `technical_aspects_comment`, `unexpected_events`, `unexpected_events_comment`, `documentation`, `documentation_comment`, `communication`, `communication_comment`, `professionalism`, `professionalism_comment`, `global_summary`, `procedure_name`, `previous_attempts`, `procedure_type`, `simulated`, `simulation_details`, `difficulty`, `feedback`, `strengths`, `developmental_needs`, `recommended_actions`, `trainee_reflection`, `trainee_signature`, `supervisor_signature`, `is_signed_by_supervisor`, `is_signed_by_trainee`, `is_draft`, `is_sent_to_trainee`, `updated_at`, `do_well`, `improve_change`) VALUES
(6, 28, 'rimastest', 26, 'rima test', '2025-04-28', 'Example Hospital Name', 3, 'Clear indication for procedure.', 3, 'Proper informed consent obtained.', 4, 'Patient prepared adequately.', 3, 'Local analgesia applied.', 2, 'Aseptic technique maintained.', 4, 'Procedure technically sound.', 1, 'No unexpected events.', 2, 'Well-documented in patient chart.', 4, 'Communicated clearly.', 2, 'Highly professional behavior.', 'Level 2a', 'Central Line Insertion', 1, 'Emergency', 'No', 'N/A', '', 'Excellent Performance.', 'Steady hand, good judgment.', 'Practice more on communication.', 'Observe 2 more procedures.', 'I learned a lot from this experience.', '/uploads/1747060680454ec5a25c125867896da4f08303c8974cecdd7.PNG', 'http://localhost:3000/uploads/1746190276191.PNG', 1, 1, 0, 1, '2025-05-12 17:38:00', 'test', 'test');

-- --------------------------------------------------------

--
-- Table structure for table `eduactconferences`
--

CREATE TABLE `eduactconferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `host` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eduactconferences`
--

INSERT INTO `eduactconferences` (`id`, `user_id`, `title`, `date`, `host`, `description`, `certificate`) VALUES
(1, 26, 'conference1', '0000-00-00', 'host1', 'description1', NULL),
(3, 26, 'conference2', '2025-03-08', 'host2', 'description2', NULL),
(4, 26, 'conference', '2024-05-09', 'host', 'description', '1741544068694.PNG'),
(5, 26, 'conference', '2024-05-09', 'host', 'description', '1741544068694.PNG'),
(6, 26, 'new', '2025-03-08', 'update', 'new', '1741862709259.PNG');

-- --------------------------------------------------------

--
-- Table structure for table `eduactcourses`
--

CREATE TABLE `eduactcourses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `institution` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eduactcourses`
--

INSERT INTO `eduactcourses` (`id`, `user_id`, `title`, `date`, `institution`, `description`, `certificate`) VALUES
(5, 27, 'Advanced Medicine Updated', '2024-12-07', 'BAU', 'Advanced Medical Pratices', '1744486071860.png'),
(9, 27, 'Advanced Medicine', '2025-12-31', 'BAU', 'A course on advanced medical practices.', NULL),
(10, 22, 'sdfghjkl;sdfghjk', '2025-05-09', 'asdfghjk', 'asdfghjkl;\'', 'uploads/1746636962413d9da0796753e903481e998f40c0198faa07c.png');

-- --------------------------------------------------------

--
-- Table structure for table `eduactworkshops`
--

CREATE TABLE `eduactworkshops` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `organizer` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `eduactworkshops`
--

INSERT INTO `eduactworkshops` (`id`, `user_id`, `title`, `date`, `organizer`, `description`, `certificate`) VALUES
(1, 27, 'Pediatric Advanced Life Support Updated.', '2024-06-12', 'BAU', 'An updated workshop on pediatric life support techniques.', '1744487066365.png'),
(4, 27, 'Pediatric Advanced Life Support', '2024-06-15', 'BAU', 'A workshop on pediatric life support techniques.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `elearning_materials`
--

CREATE TABLE `elearning_materials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` enum('medical_course','books_articles','workshops_activities') NOT NULL,
  `description` text DEFAULT NULL,
  `resource_url` text NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `Host` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `elearning_materials`
--

INSERT INTO `elearning_materials` (`id`, `title`, `category`, `description`, `resource_url`, `uploaded_at`, `Host`) VALUES
(7, 'Introduction to Cardiology', 'workshops_activities', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:03:24', 'jad'),
(8, 'Introduction to Cardiology', 'books_articles', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:03:32', NULL),
(9, 'Introduction to Cardiology', 'medical_course', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-04-11 21:14:15', NULL),
(10, 'Introduction to Cardiology', 'books_articles', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-04-11 21:14:30', NULL),
(11, 'Introduction to Cardiology', 'workshops_activities', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-04-11 21:14:36', 'jad'),
(12, 'a', 'medical_course', 'aaa', 'a', '2025-05-08 18:35:06', NULL),
(13, 'ada', 'medical_course', 'asdasd', 'asdasda', '2025-05-13 11:03:54', NULL),
(14, 'asdasd', 'books_articles', 'asdasd', 'asdasd', '2025-05-13 11:03:59', NULL),
(15, 'asdasd', 'workshops_activities', 'asdasd', 'assdasd', '2025-05-13 11:04:04', 'asdasd');

-- --------------------------------------------------------

--
-- Table structure for table `fellow_resident_evaluation`
--

CREATE TABLE `fellow_resident_evaluation` (
  `id` int(11) NOT NULL,
  `fellow_name` varchar(255) DEFAULT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `date_of_rotation` date DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `supervisor_id` int(11) NOT NULL,
  `supervisor_signature` varchar(255) DEFAULT NULL,
  `punctuality` tinyint(4) DEFAULT NULL CHECK (`punctuality` >= 1 and `punctuality` <= 5),
  `dependable` tinyint(4) DEFAULT NULL CHECK (`dependable` >= 1 and `dependable` <= 5),
  `respectful` tinyint(4) DEFAULT NULL CHECK (`respectful` >= 1 and `respectful` <= 5),
  `positive_interaction` tinyint(4) DEFAULT NULL CHECK (`positive_interaction` >= 1 and `positive_interaction` <= 5),
  `self_learning` tinyint(4) DEFAULT NULL CHECK (`self_learning` >= 1 and `self_learning` <= 5),
  `communication` tinyint(4) DEFAULT NULL CHECK (`communication` >= 1 and `communication` <= 5),
  `history_taking` tinyint(4) DEFAULT NULL CHECK (`history_taking` >= 1 and `history_taking` <= 5),
  `physical_examination` tinyint(4) DEFAULT NULL CHECK (`physical_examination` >= 1 and `physical_examination` <= 5),
  `clinical_reasoning` tinyint(4) DEFAULT NULL CHECK (`clinical_reasoning` >= 1 and `clinical_reasoning` <= 5),
  `application_knowledge` tinyint(4) DEFAULT NULL CHECK (`application_knowledge` >= 1 and `application_knowledge` <= 5),
  `overall_marks` int(11) DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `suggestions` text DEFAULT NULL,
  `sent` tinyint(1) DEFAULT 0,
  `completed` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fellow_resident_evaluation`
--

INSERT INTO `fellow_resident_evaluation` (`id`, `fellow_name`, `resident_id`, `hospital`, `date_of_rotation`, `supervisor_name`, `supervisor_id`, `supervisor_signature`, `punctuality`, `dependable`, `respectful`, `positive_interaction`, `self_learning`, `communication`, `history_taking`, `physical_examination`, `clinical_reasoning`, `application_knowledge`, `overall_marks`, `strengths`, `suggestions`, `sent`, `completed`, `updated_at`) VALUES
(20, 'test', 22, '', '2025-05-09', 'supervisor', 28, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '', '', 0, 0, '2025-05-08 22:10:13');

-- --------------------------------------------------------

--
-- Table structure for table `first_year_rotations`
--

CREATE TABLE `first_year_rotations` (
  `rotation_id` int(11) NOT NULL,
  `trainee_id` int(11) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `total_duration` varchar(50) DEFAULT NULL,
  `area_of_rotation` text DEFAULT NULL,
  `overall_performance` enum('B','M','E') DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_signature` varchar(255) DEFAULT NULL,
  `is_signed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `first_year_rotations`
--

INSERT INTO `first_year_rotations` (`rotation_id`, `trainee_id`, `from_date`, `to_date`, `total_duration`, `area_of_rotation`, `overall_performance`, `supervisor_id`, `supervisor_signature`, `is_signed`, `created_at`, `updated_at`) VALUES
(1, 26, '2025-10-03', '2025-12-02', '5', 'test', '', 30, 'rima', 1, '2025-04-20 23:12:23', '2025-04-20 23:24:58');

-- --------------------------------------------------------

--
-- Table structure for table `forbidden_logs`
--

CREATE TABLE `forbidden_logs` (
  `User_ID` int(15) NOT NULL,
  `User_Name` varchar(500) NOT NULL,
  `Function_ID` int(15) NOT NULL,
  `Function_Name` varchar(500) NOT NULL,
  `timestamp` date NOT NULL DEFAULT current_timestamp(),
  `cumulative` int(5) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forbidden_logs`
--

INSERT INTO `forbidden_logs` (`User_ID`, `User_Name`, `Function_ID`, `Function_Name`, `timestamp`, `cumulative`) VALUES
(22, 'test', 2, 'update_user', '2025-05-01', 1),
(22, 'test', 58, 'get_cbda_form_by_id', '2025-05-01', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(22, 'test', 187, 'delete_procedure_eval_form', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(22, 'test', 2, 'update_user', '2025-05-01', 1),
(22, 'test', 58, 'get_cbda_form_by_id', '2025-05-01', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(22, 'test', 187, 'delete_procedure_eval_form', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(22, 'test', 2, 'update_user', '2025-05-01', 1),
(22, 'test', 58, 'get_cbda_form_by_id', '2025-05-01', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(22, 'test', 187, 'delete_procedure_eval_form', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(22, 'test', 2, 'update_user', '2025-05-01', 1),
(22, 'test', 58, 'get_cbda_form_by_id', '2025-05-01', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 35, 'get_All_Users_With_Roles', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 36, 'get_User_Types', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 134, 'assign_roles', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(22, 'test', 128, 'get_research', '2025-05-07', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(30, 'rimastest', 45, 'get_medical_courses', '2025-05-08', 1),
(30, 'rimastest', 46, 'get_books_and_articles', '2025-05-08', 1),
(30, 'rimastest', 47, 'get_workshops_and_activities', '2025-05-08', 1),
(22, 'test', 187, 'delete_procedure_eval_form', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1),
(28, 'supervisor', 106, 'create_or_update_single_procedure_log', '2025-05-10', 1);

-- --------------------------------------------------------

--
-- Table structure for table `functions`
--

CREATE TABLE `functions` (
  `Name` varchar(50) NOT NULL,
  `Id` int(9) NOT NULL,
  `Admin` tinyint(1) NOT NULL DEFAULT 0,
  `Trainee` tinyint(1) NOT NULL DEFAULT 0,
  `Supervisor` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `functions`
--

INSERT INTO `functions` (`Name`, `Id`, `Admin`, `Trainee`, `Supervisor`) VALUES
('register_user', 1, 1, 0, 0),
('update_user', 2, 1, 0, 0),
('delete_user', 3, 1, 0, 0),
('viewMaterial', 4, 0, 1, 0),
('completeMaterial', 5, 0, 1, 0),
('get_elearning_progress', 6, 0, 1, 0),
('add_portfolio_image', 7, 0, 1, 0),
('remove_portfolio_image', 8, 0, 1, 0),
('supervisor_get_trainees', 9, 0, 0, 1),
('get_contact_messages', 10, 1, 0, 0),
('trainee_add_course', 11, 0, 1, 0),
('contact_us', 12, 0, 1, 1),
('trainee_update_course', 14, 0, 1, 0),
('trainee_delete_course', 15, 0, 1, 0),
('trainee_add_workshop', 16, 0, 1, 0),
('trainee_update_workshop', 17, 0, 1, 0),
('trainee_delete_workshop', 18, 0, 1, 0),
('add_conference', 19, 0, 1, 0),
('update_conference', 20, 0, 1, 0),
('delete_conference', 21, 0, 1, 0),
('getCourses', 22, 0, 1, 0),
('getWorkshops', 23, 0, 1, 0),
('get_conference', 24, 0, 1, 1),
('create_mortality_morbidity_form', 25, 0, 0, 1),
('update_mortality_morbidity_form', 26, 0, 1, 1),
('delete_mortality_morbidity_form_by_id', 27, 0, 0, 1),
('get_mortality_morbidity_form_by_id', 28, 0, 1, 1),
('create_seminar_assessment', 29, 0, 0, 1),
('update_seminar_assessment', 30, 0, 1, 1),
('delete_seminar_assessment_by_id', 31, 0, 0, 1),
('get_seminar_assessment_by_id', 32, 0, 1, 1),
('get_Educational_Supervisors', 33, 1, 0, 0),
('get_Clinical_Supervisors_Or_Clinics', 34, 1, 0, 0),
('get_All_Users_With_Roles', 35, 1, 0, 0),
('get_User_Types', 36, 1, 0, 0),
('send_message', 37, 0, 0, 1),
('get_messages_for_trainee', 38, 0, 1, 0),
('get_message_forms', 39, 0, 1, 0),
('send_task', 40, 0, 0, 1),
('get_tasks_for_trainee', 41, 0, 1, 0),
('add_elearning_material', 42, 0, 0, 1),
('update_elearning_material', 43, 0, 0, 1),
('delete_elearning_material', 44, 0, 0, 1),
('get_medical_courses', 45, 0, 1, 1),
('get_books_and_articles', 46, 0, 1, 1),
('get_workshops_and_activities', 47, 0, 1, 1),
('create_accomplishment', 48, 0, 1, 0),
('update_accomplishment', 49, 0, 1, 0),
('delete_accomplishment', 50, 0, 1, 0),
('get_accomplishments', 51, 0, 1, 1),
('create_grpa_form', 52, 0, 0, 1),
('update_grpa_form', 53, 0, 1, 1),
('get_grpa_form_by_id', 54, 0, 1, 1),
('delete_grpa_form_by_id', 55, 0, 0, 1),
('create_cbda_form', 56, 0, 0, 1),
('update_cbda_form', 57, 0, 1, 1),
('get_cbda_form_by_id', 58, 0, 1, 1),
('delete_cbda_form_by_id', 59, 0, 0, 1),
('forgot_password', 60, 0, 1, 1),
('reset_pass_with_token', 61, 0, 1, 1),
('create_mini_cex', 62, 0, 0, 1),
('update_mini_cex', 63, 0, 1, 1),
('sign_mini_cex', 64, 0, 1, 1),
('send_mini_cex_to_trainee', 65, 0, 0, 1),
('get_mini_cex_by_id', 66, 0, 1, 1),
('delete_mini_cex_by_id', 67, 0, 0, 1),
('create_dops', 68, 0, 0, 1),
('update_dops', 69, 0, 1, 1),
('sign_dops', 70, 0, 1, 1),
('send_dops_to_trainee', 71, 0, 0, 1),
('get_dops_by_id', 72, 0, 1, 1),
('delete_dops_by_id', 73, 0, 0, 1),
('create_logbook_profile', 74, 0, 1, 0),
('get_logbook_profile_info', 75, 0, 1, 1),
('update_logbook_profile', 76, 0, 1, 0),
('get_logbook_profile', 77, 0, 1, 1),
('delete_logbook_profile', 78, 0, 1, 0),
('sign_logbook_certificate', 79, 0, 1, 1),
('get_certificate_signature', 80, 0, 1, 1),
('delete_logbook_certificate', 81, 0, 1, 0),
('create_rotation_1st_year_config', 82, 0, 1, 0),
('update_rotation_1st_year_config', 83, 0, 1, 0),
('get_rotation_1st_year_config', 84, 0, 1, 1),
('delete_rotation_1st_year_config', 85, 0, 1, 0),
('create_first_year_rotation_details', 86, 0, 1, 0),
('update_first_year_rotation_details', 87, 0, 1, 1),
('get_first_year_rotation_details', 88, 0, 1, 1),
('delete_first_year_rotation_details', 89, 0, 1, 0),
('create_rotation_2nd_year_config', 90, 0, 1, 0),
('update_rotation_2nd_year_config', 91, 0, 1, 0),
('get_rotation_2nd_year_config', 92, 0, 1, 1),
('delete_rotation_2nd_year_config', 93, 0, 1, 0),
('create_second_year_rotation_details', 94, 0, 1, 0),
('update_second_year_rotation_details', 95, 0, 1, 1),
('get_second_year_rotation_details', 96, 0, 1, 1),
('delete_second_year_rotation_details', 97, 0, 1, 0),
('create_rotation_3rd_year_config', 98, 0, 1, 0),
('update_rotation_3rd_year_config', 99, 0, 1, 0),
('get_rotation_3rd_year_config', 100, 0, 1, 1),
('delete_rotation_3rd_year_config', 101, 0, 1, 0),
('create_third_year_rotation_details', 102, 0, 1, 0),
('update_third_year_rotation_details', 103, 0, 1, 1),
('get_third_year_rotation_details', 104, 0, 1, 1),
('delete_third_year_rotation_details', 105, 0, 1, 0),
('create_or_update_single_procedure_log', 106, 0, 1, 0),
('get_procedure_logs', 107, 0, 1, 1),
('delete_procedure_logs', 108, 0, 1, 0),
('add_procedure_summary', 109, 0, 1, 0),
('get_procedure_summaries', 110, 0, 1, 1),
('update_procedure_summary', 111, 0, 1, 1),
('delete_procedure_summary', 112, 0, 1, 0),
('create_journal_club_form', 113, 0, 0, 1),
('update_journal_club_form', 114, 0, 1, 1),
('get_journal_club_form_by_id', 115, 0, 1, 1),
('delete_journal_club_form_by_id', 116, 0, 0, 1),
('create_fellow_resident_form', 117, 0, 0, 1),
('update_fellow_resident_form', 118, 0, 1, 1),
('get_fellow_resident_form_by_id', 119, 0, 1, 1),
('delete_fellow_resident_form_by_id', 120, 0, 0, 1),
('update_keyCompetency', 121, 0, 1, 0),
('delete_keyCompetency', 122, 0, 1, 0),
('get_keyCompetencies', 123, 0, 1, 0),
('create_keyCompetency', 124, 0, 1, 0),
('create_research', 125, 0, 1, 0),
('update_research', 126, 0, 1, 0),
('delete_research', 127, 0, 1, 0),
('get_research', 128, 0, 1, 0),
('create_surgicalExperience', 129, 0, 1, 0),
('update_surgicalExperience', 130, 0, 1, 0),
('delete_surgicalExperience', 131, 0, 1, 0),
('get_surgicalExperiences', 132, 0, 1, 0),
('add_user_type', 133, 1, 0, 0),
('assign_roles', 134, 1, 0, 0),
('supervisor_view_portfolio', 135, 0, 0, 1),
('view_supervisee_form_statuses', 136, 0, 0, 1),
('supervisor_view_drafts', 137, 0, 0, 1),
('view_completed_forms', 138, 0, 0, 1),
('view_sent_forms', 139, 0, 0, 1),
('update_user_type', 140, 1, 0, 0),
('delete_user_type', 141, 1, 0, 0),
('view_form_status', 142, 0, 0, 1),
('trainee_view_forms', 143, 0, 1, 0),
('getFormsProgressForTrainee', 144, 0, 1, 0),
('getLatestUpdatedForm', 145, 0, 1, 0),
('view_portfolio_images', 146, 0, 1, 1),
('create_teachings', 147, 0, 1, 1),
('get_teachings', 148, 0, 1, 1),
('delete_teachings', 149, 0, 1, 1),
('sign_teachings', 150, 0, 0, 1),
('create_researchPub', 151, 0, 1, 1),
('get_researchPub', 152, 0, 1, 1),
('delete_researchPub', 153, 0, 1, 1),
('sign_researchPub', 154, 0, 0, 1),
('create_depActivities', 155, 0, 1, 1),
('get_depActivities', 156, 0, 1, 1),
('delete_depActivities', 157, 0, 1, 1),
('sign_depActivities', 158, 0, 0, 1),
('create_miscellaneous-Activities', 159, 0, 1, 1),
('get_miscellaneous-Activities', 160, 0, 1, 1),
('delete_miscellaneous-Activities', 161, 0, 1, 1),
('sign_miscellaneous-Activities', 162, 0, 0, 1),
('get_miscellaneous-ActivitiesByID', 163, 0, 1, 1),
('create_case_presentation', 164, 0, 1, 1),
('get_case_presentation', 165, 0, 1, 1),
('delete_case_presentation', 166, 0, 1, 1),
('sign_case_presentation', 167, 0, 0, 1),
('create_seminars', 168, 0, 1, 1),
('get_seminars', 169, 0, 1, 1),
('delete_seminars', 170, 0, 1, 1),
('sign_seminars', 171, 0, 0, 1),
('update_teachings', 173, 0, 1, 1),
('update_researchPub', 174, 0, 1, 1),
('update_depActivities', 175, 0, 1, 1),
('update_miscellaneous-Activities', 176, 0, 1, 1),
('update_case_presentation', 177, 0, 1, 1),
('update_seminars', 178, 0, 1, 1),
('trainee-supervisor_get_forms', 179, 0, 1, 1),
('getUserCountsByRole', 180, 1, 0, 0),
('addSupervisorSuperviseeRelation', 181, 1, 0, 0),
('updateSupervisorSuperviseeRelation', 182, 1, 0, 0),
('deleteSupervisorSuperviseeRelation', 183, 1, 0, 0),
('create_procedure_eval_form', 184, 0, 1, 1),
('update_procedure_eval_form', 185, 0, 1, 1),
('get_procedure_eval_form', 186, 0, 1, 1),
('delete_procedure_eval_form', 187, 0, 0, 1),
('get_forbidden_logs', 188, 1, 0, 0),
('get_contact_messages', 189, 1, 0, 0),
('delete_contact_message', 190, 1, 0, 0),
('complete_task', 191, 0, 1, 0),
('view_trainee_tasks', 192, 0, 0, 1),
('get_Supervisors', 193, 1, 0, 0),
('get_Trainee_Supervisors', 194, 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `grand_round_presentation_assessment`
--

CREATE TABLE `grand_round_presentation_assessment` (
  `id` int(9) NOT NULL,
  `resident_id` int(9) NOT NULL,
  `supervisor_id` int(9) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `diagnosis` varchar(512) DEFAULT NULL,
  `case_complexity` enum('Low','Moderate','High') DEFAULT NULL,
  `history_taking` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `physical_examination` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `provisional_diagnosis` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `treatment` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `future_planning` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `assessor_comment` varchar(4096) DEFAULT NULL,
  `resident_comment` varchar(4096) DEFAULT NULL,
  `resident_signature` varchar(255) DEFAULT NULL,
  `assessor_signature` varchar(255) DEFAULT NULL,
  `sent` tinyint(1) NOT NULL DEFAULT 0,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `AgreedAction` varchar(2048) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grand_round_presentation_assessment`
--

INSERT INTO `grand_round_presentation_assessment` (`id`, `resident_id`, `supervisor_id`, `date`, `diagnosis`, `case_complexity`, `history_taking`, `physical_examination`, `provisional_diagnosis`, `treatment`, `future_planning`, `assessor_comment`, `resident_comment`, `resident_signature`, `assessor_signature`, `sent`, `completed`, `updated_at`, `AgreedAction`) VALUES
(1, 22, 28, '2025-04-02', 'Flu232', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment2', NULL, NULL, 'uploads\\1743542547183.png', 1, 0, '2025-04-16 18:24:27', NULL),
(2, 22, 28, '2025-04-02', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', 'Updated Commentasasas', 'uploads\\1745863968486.png', 'uploads\\1743542642230.png', 1, 1, '2025-04-28 18:12:48', NULL),
(4, 22, 28, '2025-04-12', 'Flu232', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment2', 'Updated Commentasasas', 'uploads\\1744410861909.jpg', NULL, 1, 1, '2025-05-01 14:53:51', 'updateddd'),
(5, 22, 28, '2025-04-28', 'Flu232', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment2', 'Updated Commentasasas', 'uploads\\1745863983430.png', 'uploads\\1745864041001.png', 1, 1, '2025-05-01 14:54:30', 'abc'),
(6, 22, 28, '2025-04-28', 'Flu232', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment2', 'Updated Commentasasas', 'uploads\\1745864057846.png', 'uploads\\1745864048007.png', 1, 1, '2025-04-28 18:14:17', NULL),
(7, 22, 28, '2025-05-01', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, NULL, 1, 0, '2025-05-01 14:45:41', NULL),
(16, 22, 28, '2025-05-05', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'http://localhost:3000/uploads/1746457139367.png', 1, 0, '2025-05-05 14:58:59', 'If you see this message you integrated successfully'),
(17, 22, 28, '2025-05-06', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'http://localhost:3000/uploads/1746557059917.png', 1, 0, '2025-05-06 18:44:19', 'If you see this message you integrated successfully');

-- --------------------------------------------------------

--
-- Table structure for table `journal_club_assessment`
--

CREATE TABLE `journal_club_assessment` (
  `id` int(11) NOT NULL,
  `resident_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `article_reference` varchar(255) NOT NULL,
  `paper_selection` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `background_knowledge` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `critical_analysis_methodology` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `critical_analysis_results` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `conclusions_drawn` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `audio_visual_aids` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `handling_questions` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `overall_performance` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `major_positive_feature` text DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `agreed_action_plan` text DEFAULT NULL,
  `resident_signature` varchar(255) DEFAULT NULL,
  `assessor_signature` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sent` tinyint(1) DEFAULT NULL,
  `complete` tinyint(1) DEFAULT 0,
  `resident_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `journal_club_assessment`
--

INSERT INTO `journal_club_assessment` (`id`, `resident_name`, `date`, `article_reference`, `paper_selection`, `background_knowledge`, `critical_analysis_methodology`, `critical_analysis_results`, `conclusions_drawn`, `audio_visual_aids`, `handling_questions`, `overall_performance`, `major_positive_feature`, `comments`, `agreed_action_plan`, `resident_signature`, `assessor_signature`, `created_at`, `updated_at`, `sent`, `complete`, `resident_id`, `supervisor_id`) VALUES
(2, 'test', '2024-12-12', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', '1', '2', '7', 'http://localhost:3000/uploads/1746454517938.png', 'http://localhost:3000/uploads/1746454508031.png', '2025-05-05 14:14:26', '2025-05-05 14:15:17', 1, 1, 22, 28),
(3, 'test', '2024-12-12', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', '1', '2', '7', NULL, NULL, '2025-05-05 15:16:20', '2025-05-05 15:16:20', 0, 0, 22, 28);

-- --------------------------------------------------------

--
-- Table structure for table `logbook_profile_info`
--

CREATE TABLE `logbook_profile_info` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `resident_name` varchar(255) DEFAULT NULL,
  `academic_year` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile_no` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `certificate_id` int(11) DEFAULT NULL,
  `trainee_signature` varchar(255) DEFAULT NULL,
  `hospital_signature` varchar(255) DEFAULT NULL,
  `hospital_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logbook_profile_info`
--

INSERT INTO `logbook_profile_info` (`id`, `trainee_id`, `resident_name`, `academic_year`, `email`, `mobile_no`, `created_at`, `updated_at`, `certificate_id`, `trainee_signature`, `hospital_signature`, `hospital_id`) VALUES
(1, 26, 'Rima Doe', '2025', 'johndoe@example.com', '9876543210', '2025-04-04 21:30:06', '2025-05-09 11:25:02', NULL, '/uploads/1746789860033c02df29fb8edb1680636e675b01a4e23cf5a.PNG', '/uploads/174678990249459ee89e6efb336b6d839d22252edaa3573a9.PNG', 30);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `subject`, `message`, `trainee_id`, `supervisor_id`, `date`) VALUES
(2, 'Training Schedule', 'Your next training session is on Monday.', 23, 28, '2025-03-29 23:51:53'),
(3, 'Training Schedule', 'Your next training session is on Monday.', 22, 28, '2025-03-29 23:54:53'),
(5, 'hi', '<script>alert()</script>', 22, 29, '2025-04-29 11:07:13');

-- --------------------------------------------------------

--
-- Table structure for table `mini_cex`
--

CREATE TABLE `mini_cex` (
  `id` int(11) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `trainee_name` varchar(255) DEFAULT NULL,
  `resident_level` enum('R-1/F-1','R-2/F-2','R-3/F-3') DEFAULT NULL,
  `evaluation_date` date DEFAULT NULL,
  `setting` enum('Ambulatory','In-patient','ED','Other') DEFAULT NULL,
  `patient_problem` varchar(255) DEFAULT NULL,
  `patient_age` int(11) DEFAULT NULL,
  `patient_sex` enum('Male','Female') DEFAULT NULL,
  `patient_type` enum('New','Follow-up') DEFAULT NULL,
  `complexity` enum('Low','Moderate','High') DEFAULT NULL,
  `focus` enum('Data Gathering','Diagnosis','Therapy','Counseling') DEFAULT NULL,
  `medical_interviewing` int(11) DEFAULT NULL CHECK (`medical_interviewing` between 0 and 9),
  `physical_exam` int(11) DEFAULT NULL CHECK (`physical_exam` between 0 and 9),
  `professionalism` int(11) DEFAULT NULL CHECK (`professionalism` between 0 and 9),
  `clinical_judgment` int(11) DEFAULT NULL CHECK (`clinical_judgment` between 0 and 9),
  `counseling_skills` int(11) DEFAULT NULL CHECK (`counseling_skills` between 0 and 9),
  `efficiency` int(11) DEFAULT NULL CHECK (`efficiency` between 0 and 9),
  `overall_competence` int(11) DEFAULT NULL CHECK (`overall_competence` between 0 and 9),
  `observer_time` int(11) DEFAULT NULL,
  `feedback_time` int(11) DEFAULT NULL,
  `evaluator_satisfaction` int(11) DEFAULT NULL CHECK (`evaluator_satisfaction` between 1 and 9),
  `resident_satisfaction` int(11) DEFAULT NULL CHECK (`resident_satisfaction` between 1 and 9),
  `comments` text DEFAULT NULL,
  `evaluator_signature_path` varchar(255) DEFAULT NULL,
  `trainee_signature_path` varchar(255) DEFAULT NULL,
  `is_signed_by_trainee` tinyint(1) DEFAULT 0,
  `is_signed_by_supervisor` tinyint(1) DEFAULT 0,
  `is_draft` tinyint(1) DEFAULT 1,
  `residentFellow` varchar(255) DEFAULT NULL,
  `sent_to_trainee` tinyint(4) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mini_cex`
--

INSERT INTO `mini_cex` (`id`, `supervisor_id`, `supervisor_name`, `resident_id`, `trainee_name`, `resident_level`, `evaluation_date`, `setting`, `patient_problem`, `patient_age`, `patient_sex`, `patient_type`, `complexity`, `focus`, `medical_interviewing`, `physical_exam`, `professionalism`, `clinical_judgment`, `counseling_skills`, `efficiency`, `overall_competence`, `observer_time`, `feedback_time`, `evaluator_satisfaction`, `resident_satisfaction`, `comments`, `evaluator_signature_path`, `trainee_signature_path`, `is_signed_by_trainee`, `is_signed_by_supervisor`, `is_draft`, `residentFellow`, `sent_to_trainee`, `updated_at`) VALUES
(4, 30, 'rimastest', 26, 'rima test', 'R-2/F-2', '2025-01-04', 'In-patient', 'Chronic headache', 40, 'Female', 'Follow-up', 'Moderate', 'Diagnosis', 4, 5, 5, 4, 4, 4, 4, 2025, 2025, 5, 8, 'Patient responded well to treatment.', 'uploads\\1743467698943.PNG', NULL, 1, 1, 1, NULL, 0, '2025-05-02 17:02:34'),
(5, 30, 'rimastest', 26, 'rima test', 'R-1/F-1', '0000-00-00', 'Ambulatory', NULL, NULL, 'Male', NULL, NULL, NULL, 4, 5, 5, 4, 4, 5, 4, 30, 15, 5, NULL, NULL, 'uploads\\1746039394745.PNG', NULL, 0, 1, 1, NULL, 0, '2025-05-02 17:02:34'),
(6, 30, 'rimastest', 26, 'rima test', 'R-1/F-1', '0000-00-00', 'Ambulatory', NULL, NULL, 'Male', NULL, NULL, NULL, 2, 2, 5, 5, 4, 4, 3, 30, 5, 5, NULL, NULL, 'http://localhost:3000/uploads/1746093640604.PNG', NULL, 0, 1, 1, NULL, 0, '2025-05-02 17:02:34'),
(7, 30, 'rimastest', 26, 'rima test', 'R-2/F-2', '2025-02-12', 'Ambulatory', 'Chronic headache', 22, 'Female', 'Follow-up', 'Moderate', 'Diagnosis', 2, 2, 5, 5, 4, 4, 3, 25, 5, 4, 8, 'good', 'http://localhost:3000/uploads/1746098872090.PNG', 'http://localhost:3000/uploads/1746110935481.PNG', 1, 1, 0, 'resident', 0, '2025-05-02 17:02:34'),
(9, 28, 'supervisor', 22, 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/17470618002717be00288b1715618ef734c13e954839e825f.png', NULL, 0, 1, 1, NULL, 1, '2025-05-12 17:56:40'),
(10, 28, 'supervisor', 22, 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/uploads/17470618598936a8b9b3657075e990ff380dc716e3f688520.png', NULL, 0, 1, 1, NULL, 1, '2025-05-12 17:57:39'),
(11, 28, 'supervisor', 22, 'test', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, 4, 4, 4, 4, NULL, NULL, 4, NULL, NULL, '/uploads/174706199941059d8594a77aa79f8bcfee84c043592379370.png', NULL, 0, 1, 1, NULL, 1, '2025-05-12 17:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `miscellaneous_activities`
--

CREATE TABLE `miscellaneous_activities` (
  `id` int(11) NOT NULL,
  `category` enum('Webinar','Training','Award') NOT NULL,
  `details` text NOT NULL,
  `date` date NOT NULL,
  `faculty_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mortality_morbidity_review_assessment`
--

CREATE TABLE `mortality_morbidity_review_assessment` (
  `id` int(9) NOT NULL,
  `resident_id` int(9) NOT NULL,
  `supervisor_id` int(9) NOT NULL,
  `resident_fellow_name` varchar(255) NOT NULL,
  `date_of_presentation` date NOT NULL DEFAULT current_timestamp(),
  `diagnosis` text NOT NULL,
  `cause_of_death_morbidity` text DEFAULT NULL,
  `brief_introduction` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `patient_details` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `assessment_analysis` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `review_of_literature` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `recommendations` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `handling_questions` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `overall_performance` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `major_positive_feature` text DEFAULT NULL,
  `suggested_areas_for_improvement` text DEFAULT NULL,
  `resident_signature_path` varchar(255) DEFAULT NULL,
  `assessor_signature_path` varchar(255) DEFAULT NULL,
  `sent` tinyint(1) NOT NULL DEFAULT 0,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `agreed_action_plan` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mortality_morbidity_review_assessment`
--

INSERT INTO `mortality_morbidity_review_assessment` (`id`, `resident_id`, `supervisor_id`, `resident_fellow_name`, `date_of_presentation`, `diagnosis`, `cause_of_death_morbidity`, `brief_introduction`, `patient_details`, `assessment_analysis`, `review_of_literature`, `recommendations`, `handling_questions`, `overall_performance`, `major_positive_feature`, `suggested_areas_for_improvement`, `resident_signature_path`, `assessor_signature_path`, `sent`, `completed`, `updated_at`, `agreed_action_plan`) VALUES
(1, 22, 1, 'Aaa', '0000-00-00', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550361695.png', 0, 0, '2025-04-16 18:24:27', NULL),
(2, 22, 1, 'Aaa', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743423365481.jpg', 0, 0, '2025-04-16 18:24:27', NULL),
(3, 22, 1, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743426406850.jpg', 0, 0, '2025-04-16 18:24:27', NULL),
(4, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550239405.png', 1, 0, '2025-04-16 18:24:27', NULL),
(5, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550270964.png', 1, 0, '2025-04-16 18:24:27', NULL),
(6, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', 'uploads\\1744665412571.png', 'uploads\\1744665375228.png', 1, 1, '2025-04-16 18:24:27', NULL),
(8, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', 'http://localhost:3000/uploads/1746454631273.png', 'http://localhost:3000/uploads/1746454628203.png', 1, 1, '2025-05-05 14:17:11', NULL),
(9, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, NULL, 0, 0, '2025-05-05 15:24:07', NULL),
(11, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, '/uploads/1747062462807375ce1b6545a626c9c0ffc664cfae76f06d7.png', 0, 0, '2025-05-12 15:07:42', 'abc');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `sender_id`, `message`, `is_read`, `created_at`) VALUES
(1, 26, 30, 'Your Mini-CEX form has been sent to you for review.', 0, '2025-03-30 23:04:31'),
(2, 30, 26, 'Your trainee has signed the Mini-CEX form.', 0, '2025-03-31 00:44:25'),
(3, 26, 30, 'Your supervisor has signed the Mini-CEX form.', 0, '2025-03-31 00:52:55'),
(4, 26, 30, 'Your Mini-CEX form has been sent to you for review.', 0, '2025-04-01 00:03:39'),
(5, 30, 26, 'Your trainee has signed the Mini-CEX form.', 0, '2025-04-01 00:18:14'),
(6, 26, 30, 'Your supervisor has signed the Mini-CEX form.', 0, '2025-04-01 00:34:58'),
(7, 22, 28, 'Your grand round presentation assessment form has been sent to you for review.', 0, '2025-04-01 21:22:27'),
(8, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 21:24:02'),
(9, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-01 21:24:52'),
(10, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-01 21:25:22'),
(11, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-01 21:25:33'),
(12, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:14:59'),
(13, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:16:35'),
(14, 28, 22, 'Your trainee test has signed the  case based discussion assessment form .', 0, '2025-04-01 23:17:10'),
(15, 22, 28, 'Your mortality morbidity review assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:31:10'),
(16, 22, 28, 'Your mortality morbidity review assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:33:02'),
(17, 28, 22, 'Your trainee test has signed the  mortality morbidity review assessment form .', 0, '2025-04-01 23:33:48'),
(18, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:39:32'),
(19, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-04-01 23:40:57'),
(20, 28, 22, 'Your trainee test has signed the  seminar assessment form .', 0, '2025-04-01 23:41:19'),
(23, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-04-11 22:02:59'),
(24, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-11 22:04:28'),
(26, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-04-14 21:27:22'),
(27, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-28 18:13:03'),
(28, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-04-28 18:13:26'),
(29, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-04-28 18:14:08'),
(30, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-04-28 18:14:17'),
(31, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-04-28 19:14:29'),
(32, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-01 14:45:41'),
(33, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-01 14:50:03'),
(34, 26, 30, 'Your mini cex form has been sent to you by rimastest for review.', 0, '2025-05-01 18:58:36'),
(35, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 11:57:46'),
(36, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 12:49:43'),
(37, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 12:51:54'),
(38, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:04:00'),
(39, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:04:47'),
(40, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:07:10'),
(41, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:07:17'),
(42, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:09:00'),
(43, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:09:07'),
(44, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:12:31'),
(45, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:12:37'),
(46, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:17:07'),
(47, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:17:13'),
(48, 26, 30, 'Your dops form has been sent to you by rimastest for review.', 0, '2025-05-02 13:19:23'),
(49, 30, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-02 13:19:27'),
(50, 22, 28, 'Your journal club assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:15:08'),
(51, 28, 22, 'Your trainee test has signed the  journal club assessment form .', 0, '2025-05-05 14:15:17'),
(52, 22, 28, 'Your mortality morbidity review assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:17:08'),
(53, 28, 22, 'Your trainee test has signed the  mortality morbidity review assessment form .', 0, '2025-05-05 14:17:11'),
(54, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:17:48'),
(55, 28, 22, 'Your trainee test has signed the  seminar assessment form .', 0, '2025-05-05 14:18:12'),
(56, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:36:07'),
(57, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:36:35'),
(58, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:41:31'),
(59, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:41:40'),
(60, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:42:03'),
(61, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:42:10'),
(62, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:42:56'),
(63, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:43:02'),
(64, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:47:41'),
(65, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:47:46'),
(66, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:49:42'),
(67, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:55:32'),
(68, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 14:56:38'),
(69, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 14:58:59'),
(70, 28, 22, 'Your trainee test has signed the  grand round presentation assessment form .', 0, '2025-05-05 15:04:17'),
(71, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:07:43'),
(72, 28, 22, 'Your trainee test has signed the  case based discussion assessment form .', 0, '2025-05-05 15:09:04'),
(73, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:09:29'),
(74, 28, 22, 'Your trainee test has signed the  case based discussion assessment form .', 0, '2025-05-05 15:09:42'),
(75, 22, 28, 'Your case based discussion assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:11:00'),
(76, 28, 22, 'Your trainee test has signed the  case based discussion assessment form .', 0, '2025-05-05 15:11:04'),
(77, 22, 28, 'Your journal club assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:17:18'),
(78, 28, 22, 'Your trainee test has signed the  journal club assessment form .', 0, '2025-05-05 15:17:26'),
(79, 22, 28, 'Your mortality morbidity review assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:25:34'),
(80, 28, 22, 'Your trainee test has signed the  mortality morbidity review assessment form .', 0, '2025-05-05 15:25:40'),
(81, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:37:43'),
(82, 22, 28, 'Your seminar assessment form has been sent to you by supervisor for review.', 0, '2025-05-05 15:37:49'),
(83, 28, 22, 'Your trainee test has signed the  seminar assessment form .', 0, '2025-05-05 15:38:36'),
(84, 22, 28, 'Your grand round presentation assessment form has been sent to you by supervisor for review.', 0, '2025-05-06 18:44:19'),
(85, 22, 28, 'Your fellow resident evaluation form has been sent to you by supervisor for review.', 0, '2025-05-08 21:53:47'),
(86, 28, 26, 'Your trainee rima test has signed the  dops form .', 0, '2025-05-12 14:38:00'),
(87, 22, 28, 'Your mini cex form has been sent to you by supervisor for review.', 0, '2025-05-12 14:56:40'),
(88, 22, 28, 'Your mini cex form has been sent to you by supervisor for review.', 0, '2025-05-12 14:57:39'),
(89, 22, 28, 'Your mini cex form has been sent to you by supervisor for review.', 0, '2025-05-12 14:59:59');

-- --------------------------------------------------------

--
-- Table structure for table `prelogin_contact_messages`
--

CREATE TABLE `prelogin_contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `prelogin_contact_messages`
--

INSERT INTO `prelogin_contact_messages` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'Lorence', 'lorence@example.com', 'I can\'t log in to my account.', '2025-04-06 09:47:13');

-- --------------------------------------------------------

--
-- Table structure for table `procedures`
--

CREATE TABLE `procedures` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `minimum_required` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedures`
--

INSERT INTO `procedures` (`id`, `name`, `minimum_required`) VALUES
(1, 'Central Venous Insertion', 2),
(2, 'Resuscitation Skills', 2),
(3, 'Endotracheal Intubations', 10),
(4, 'Defibrillation', 2),
(5, 'Lumbar puncture', 15),
(6, 'Bone Marrow aspiration', 5),
(7, 'Bone Marrow biopsy', 2),
(8, 'Skin biopsy', 1),
(9, 'Insertion of chest drain', 3),
(10, 'Pleural aspiration', 3),
(11, 'Pericardial aspiration', 1),
(12, 'Peritoneal aspiration', 1),
(13, 'Gastric Lavage', 5),
(14, 'Urethral', 5),
(15, 'Suprapubic', 5),
(16, 'Exchange Transfusion', 2),
(17, 'Injections (Intradermal)', 10),
(18, 'Throat swab for Culture', 5),
(19, 'Obtaining vesicular and pustular fluid', 3),
(20, 'Using Growth Charts', 50),
(21, 'Performing an ECG', 5),
(22, 'Intraosseus', 0),
(23, 'Others', 0);

-- --------------------------------------------------------

--
-- Table structure for table `procedure_evaluation`
--

CREATE TABLE `procedure_evaluation` (
  `id` int(11) NOT NULL,
  `resident_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `procedure_name` varchar(255) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `setting` enum('Emergency','Elective','Simulation') DEFAULT NULL,
  `difficulty` enum('Easy','Average','Difficult') DEFAULT NULL,
  `preparation_and_set_up` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `consent_and_communication` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `technical_skills` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `asepsis_and_safety` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `problem_management` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `documentation` enum('Not Observed','Development Needed','Satisfactory','Outstanding') DEFAULT NULL,
  `strengths` text DEFAULT NULL,
  `areas_for_improvement` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `trainee_name` varchar(255) DEFAULT NULL,
  `evaluator_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedure_evaluation`
--

INSERT INTO `procedure_evaluation` (`id`, `resident_id`, `supervisor_id`, `procedure_name`, `date`, `setting`, `difficulty`, `preparation_and_set_up`, `consent_and_communication`, `technical_skills`, `asepsis_and_safety`, `problem_management`, `documentation`, `strengths`, `areas_for_improvement`, `created_at`, `updated_at`, `trainee_name`, `evaluator_name`) VALUES
(13, 22, 28, 'asdasdasd', '2025-05-14', 'Elective', 'Average', 'Development Needed', 'Development Needed', 'Satisfactory', 'Development Needed', 'Not Observed', 'Satisfactory', 'asadasdasd', 'asdadsasd', '2025-05-10 19:02:40', '2025-05-10 19:04:10', 'test', 'supervisor');

-- --------------------------------------------------------

--
-- Table structure for table `procedure_summary_logs`
--

CREATE TABLE `procedure_summary_logs` (
  `id` int(11) NOT NULL,
  `serial_no` varchar(255) DEFAULT NULL,
  `trainee_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `procedure_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `trainer_signature` varchar(255) DEFAULT NULL,
  `is_signed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `procedure_summary_logs`
--

INSERT INTO `procedure_summary_logs` (`id`, `serial_no`, `trainee_id`, `date`, `procedure_name`, `status`, `trainer_signature`, `is_signed`) VALUES
(2, '2', 26, '2025-04-11', 'Surgical Procedures', 'Completed', 'rima', 1);

-- --------------------------------------------------------

--
-- Table structure for table `research`
--

CREATE TABLE `research` (
  `id` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Date` date NOT NULL,
  `Description` text NOT NULL,
  `File_Path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `research`
--

INSERT INTO `research` (`id`, `User_ID`, `Title`, `Date`, `Description`, `File_Path`, `created_at`, `updated_at`) VALUES
(2, 22, 'sdasda', '2025-05-14', 'asdasd', 'uploads/fc7c6854f1f4e5c54e7a4ac42ba69142.png', '2025-05-07 16:28:51', '2025-05-07 16:28:51');

-- --------------------------------------------------------

--
-- Table structure for table `research_publications`
--

CREATE TABLE `research_publications` (
  `id` int(11) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `details` text NOT NULL,
  `date` date NOT NULL,
  `faculty_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rotation_1st_year_config`
--

CREATE TABLE `rotation_1st_year_config` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rotation_2nd_year_config`
--

CREATE TABLE `rotation_2nd_year_config` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rotation_3rd_year_config`
--

CREATE TABLE `rotation_3rd_year_config` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `second_year_rotations`
--

CREATE TABLE `second_year_rotations` (
  `rotation_id` int(11) NOT NULL,
  `trainee_id` int(11) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `total_duration` varchar(50) DEFAULT NULL,
  `area_of_rotation` text DEFAULT NULL,
  `overall_performance` text DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_signature` varchar(255) DEFAULT NULL,
  `is_signed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seminars`
--

CREATE TABLE `seminars` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `topic` varchar(255) NOT NULL,
  `presented_attended` enum('P','A') NOT NULL,
  `moderator_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seminar_assessment`
--

CREATE TABLE `seminar_assessment` (
  `id` int(9) NOT NULL,
  `resident_id` int(9) NOT NULL,
  `supervisor_id` int(9) NOT NULL,
  `resident_fellow_name` varchar(255) NOT NULL,
  `date_of_presentation` date NOT NULL DEFAULT current_timestamp(),
  `topic` varchar(255) DEFAULT NULL,
  `content` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `presentation_skills` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `audio_visual_aids` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `communication` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `handling_questions` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `audience_management` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `references` enum('Below Expectations','Meets Expectations','Exceeds Expectations','U/C') DEFAULT NULL,
  `major_positive_feature` text DEFAULT NULL,
  `suggested_areas_for_improvement` text DEFAULT NULL,
  `resident_signature_path` varchar(255) DEFAULT NULL,
  `assessor_signature_path` varchar(255) DEFAULT NULL,
  `sent` tinyint(1) NOT NULL DEFAULT 0,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `agreed_action_plan` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seminar_assessment`
--

INSERT INTO `seminar_assessment` (`id`, `resident_id`, `supervisor_id`, `resident_fellow_name`, `date_of_presentation`, `topic`, `content`, `presentation_skills`, `audio_visual_aids`, `communication`, `handling_questions`, `audience_management`, `references`, `major_positive_feature`, `suggested_areas_for_improvement`, `resident_signature_path`, `assessor_signature_path`, `sent`, `completed`, `updated_at`, `agreed_action_plan`) VALUES
(1, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, 'uploads\\1743550730360.png', 0, 0, '2025-04-16 18:24:27', NULL),
(3, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, 'uploads\\1743550772289.png', 1, 0, '2025-04-16 18:24:27', NULL),
(4, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, 'uploads\\1744666042025.jpg', 1, 0, '2025-04-16 18:24:27', NULL),
(5, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', 'http://localhost:3000/uploads/1746454692823.png', 'http://localhost:3000/uploads/1746454705257.png', 1, 1, '2025-05-05 14:18:25', NULL),
(6, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, NULL, 1, 0, '2025-05-05 15:37:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supervisor_supervisee`
--

CREATE TABLE `supervisor_supervisee` (
  `SupervisorID` int(10) NOT NULL,
  `SuperviseeID` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `supervisor_supervisee`
--

INSERT INTO `supervisor_supervisee` (`SupervisorID`, `SuperviseeID`) VALUES
(28, 22),
(28, 26);

-- --------------------------------------------------------

--
-- Table structure for table `surgical_experiences`
--

CREATE TABLE `surgical_experiences` (
  `Experience_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `Procedure_Name` varchar(255) NOT NULL,
  `Date` date NOT NULL,
  `Role` varchar(100) DEFAULT NULL,
  `Clinic` varchar(255) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `deadline` date NOT NULL,
  `description` text DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `trainee_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `deadline`, `description`, `is_completed`, `trainee_id`, `supervisor_id`) VALUES
(1, 'Task 1', '2025-04-01', 'Complete module 1', 0, 23, 28),
(2, 'Task 1', '2025-04-01', 'Complete module 1', 0, 22, 28);

-- --------------------------------------------------------

--
-- Table structure for table `teaching`
--

CREATE TABLE `teaching` (
  `id` int(11) NOT NULL,
  `activity` enum('Undergraduates','Paramedical Staff','Parents/Patients'' Attendants') NOT NULL,
  `date` date NOT NULL,
  `topic` varchar(255) NOT NULL,
  `rating` enum('B','M','E') NOT NULL,
  `faculty_signature` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `third_year_rotations`
--

CREATE TABLE `third_year_rotations` (
  `rotation_id` int(11) NOT NULL,
  `trainee_id` int(11) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `total_duration` varchar(50) DEFAULT NULL,
  `area_of_rotation` text DEFAULT NULL,
  `overall_performance` text DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_signature` varchar(255) DEFAULT NULL,
  `is_signed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `third_year_rotations`
--

INSERT INTO `third_year_rotations` (`rotation_id`, `trainee_id`, `from_date`, `to_date`, `total_duration`, `area_of_rotation`, `overall_performance`, `supervisor_id`, `supervisor_signature`, `is_signed`, `created_at`, `updated_at`) VALUES
(1, 26, '2025-04-01', '2025-04-15', '14.0', 'Cardiology', 'B', 30, 'uploads\\1744248881116.PNG', 1, '2025-04-10 00:39:13', '2025-04-10 01:34:41'),
(2, 26, '2025-04-01', '2025-04-15', '14', 'Cardiology', 'B', NULL, NULL, 0, '2025-04-10 01:40:56', '2025-04-10 01:40:56'),
(3, 26, '2025-04-01', '2025-04-05', '5 days', 'Surgery', 'M', 30, 'rima', 1, '2025-04-10 13:01:51', '2025-04-10 13:03:28');

-- --------------------------------------------------------

--
-- Table structure for table `trainee_elearning_material_progress`
--

CREATE TABLE `trainee_elearning_material_progress` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `material_id` int(11) NOT NULL,
  `status` enum('in_progress','completed') DEFAULT 'in_progress',
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainee_elearning_material_progress`
--

INSERT INTO `trainee_elearning_material_progress` (`id`, `trainee_id`, `material_id`, `status`, `completed_at`) VALUES
(2, 26, 11, 'completed', '2025-04-21 13:43:03');

-- --------------------------------------------------------

--
-- Table structure for table `trainee_portfolio_images`
--

CREATE TABLE `trainee_portfolio_images` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trainee_portfolio_images`
--

INSERT INTO `trainee_portfolio_images` (`id`, `trainee_id`, `image_path`, `uploaded_at`) VALUES
(26, 22, 'uploads/1746636492645a3adf9a3b5fd4779d97a715fe8dd3e5f74a7.png', '2025-05-07 16:48:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `User_ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Role` int(9) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Bau_ID` int(11) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`User_ID`, `Name`, `Email`, `Role`, `Password`, `Bau_ID`, `reset_token`) VALUES
(1, 'admin', 'admin@example.com', 1, '$2b$10$DfWFKh2rvumR4bWkLuBvUuu0yTh1ConhRT6BRnFnQsbvhSMg8O7aC', 123, NULL),
(22, 'test', 'test@example.com', 2, '$2b$10$FvNsjO4K8iMXMRdmBiGiV.CRgKZ0xjfnmaaf4NjQJgX7UCJBaZlsW', NULL, NULL),
(23, 'trainee1', 'trainee@example.com', 2, '$2b$10$X8UNE6qMYCnOmLkNCgWXEO.799dmU4Z29AaZZhLdhdQO3UQtwx/6u', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRyYWluZWVAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDE0NDgyNjcsImV4cCI6MTc0MTQ1MTg2N30.VREFtakw77mANcTS5VkIck9xQqNBcwFHXZmhEWgepCI'),
(26, 'rima test', 'rimashbaro02@gmail.com', 2, '$2b$10$G7S8x0jKHZy67NtzXjVu/.nFcJ/oGXwLx1GmDQ1VMWhHXraDEWF7q', NULL, NULL),
(27, 'Lorence', 'lorence@example.com', 2, '$2b$10$aHvyVbXstnglnQQjAxPNY.6N/lqDNLDsANPh7SIarBZE2M3Ceh6u6', NULL, NULL),
(28, 'supervisor', 'suppp@example.com', 3, '$2b$10$onMwNaIHc9p/BQ/.7YBlReowAuWangTFAEhex/p2pjD8Kz9FuXTF6', NULL, NULL),
(29, 'test', 'supervisor@example.com', 3, '$2b$10$cIb1CqTCpU/MyEJSLa6HceXDB0uwDo2mpFJ.TjNNqyV97h3VOTgtO', NULL, NULL),
(30, 'rimastest', 'rimashbaro@gmail.com', 4, '$2b$10$kXeMv9qOcMTorCVpsq9EJO4wJ1r0SHQy7zEVqZoP6W.24WJ6Ksfaq', NULL, NULL),
(32, 'BAU clinic', 'clinic@bau.com', 5, '$2b$10$p/RrBTzWZhyAQjwqryE6veFLdftSBUmGBX1/wvrHBmrgDDD9VSL26', NULL, NULL),
(35, 'Rima', 'rimaissmart@gmail.com', 15, '$2b$10$6dj4mLWC15VI65Ja6/mzse2pHcQ3uwRNRFhQlLs4pUGFbNnimOW/O', 123456789, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usertypes`
--

CREATE TABLE `usertypes` (
  `Name` varchar(25) NOT NULL,
  `Id` int(9) NOT NULL,
  `Type` enum('Admin','Supervisor','Trainee') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usertypes`
--

INSERT INTO `usertypes` (`Name`, `Id`, `Type`) VALUES
('admin', 1, 'Admin'),
('trainee', 2, 'Trainee'),
('educational_supervisor', 3, 'Supervisor'),
('clinical_supervisor', 4, 'Supervisor'),
('clinic', 5, 'Supervisor'),
('update', 7, 'Admin'),
('delete', 8, 'Supervisor'),
('test', 10, 'Admin'),
('TestUserType', 11, 'Admin'),
('Admin13', 13, 'Admin'),
('asdfgthyjukl', 15, 'Admin'),
('testa', 16, 'Admin'),
('at', 17, 'Admin'),
('st', 18, 'Supervisor'),
('tt', 19, 'Trainee');

-- --------------------------------------------------------

--
-- Table structure for table `usertype_functions`
--

CREATE TABLE `usertype_functions` (
  `UsertypeId` int(11) NOT NULL,
  `FunctionsId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usertype_functions`
--

INSERT INTO `usertype_functions` (`UsertypeId`, `FunctionsId`) VALUES
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 11),
(2, 12),
(2, 14),
(2, 15),
(2, 16),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(2, 22),
(2, 23),
(2, 24),
(2, 26),
(2, 28),
(2, 30),
(2, 32),
(2, 38),
(2, 39),
(2, 41),
(2, 45),
(2, 46),
(2, 47),
(2, 48),
(2, 49),
(2, 50),
(2, 51),
(2, 53),
(2, 54),
(2, 57),
(2, 58),
(2, 60),
(2, 61),
(2, 63),
(2, 64),
(2, 66),
(2, 69),
(2, 70),
(2, 72),
(2, 74),
(2, 75),
(2, 76),
(2, 77),
(2, 78),
(2, 79),
(2, 80),
(2, 81),
(2, 82),
(2, 83),
(2, 84),
(2, 85),
(2, 86),
(2, 87),
(2, 88),
(2, 89),
(2, 90),
(2, 91),
(2, 92),
(2, 93),
(2, 94),
(2, 95),
(2, 96),
(2, 97),
(2, 98),
(2, 99),
(2, 100),
(2, 101),
(2, 102),
(2, 103),
(2, 104),
(2, 105),
(2, 106),
(2, 107),
(2, 108),
(2, 109),
(2, 110),
(2, 111),
(2, 112),
(2, 114),
(2, 115),
(2, 119),
(2, 121),
(2, 122),
(2, 123),
(2, 124),
(2, 125),
(2, 126),
(2, 127),
(2, 128),
(2, 129),
(2, 130),
(2, 131),
(2, 132),
(2, 143),
(2, 144),
(2, 145),
(2, 146),
(2, 147),
(2, 148),
(2, 149),
(2, 151),
(2, 152),
(2, 153),
(2, 155),
(2, 156),
(2, 157),
(2, 159),
(2, 160),
(2, 161),
(2, 163),
(2, 164),
(2, 165),
(2, 166),
(2, 168),
(2, 169),
(2, 170),
(2, 173),
(2, 174),
(2, 175),
(2, 176),
(2, 177),
(2, 178),
(2, 179),
(2, 184),
(2, 185),
(2, 186),
(2, 191),
(3, 9),
(3, 12),
(3, 24),
(3, 25),
(3, 26),
(3, 27),
(3, 28),
(3, 29),
(3, 30),
(3, 31),
(3, 32),
(3, 37),
(3, 39),
(3, 40),
(3, 42),
(3, 43),
(3, 44),
(3, 45),
(3, 46),
(3, 47),
(3, 51),
(3, 52),
(3, 53),
(3, 54),
(3, 55),
(3, 56),
(3, 57),
(3, 58),
(3, 59),
(3, 60),
(3, 61),
(3, 62),
(3, 63),
(3, 64),
(3, 65),
(3, 66),
(3, 67),
(3, 68),
(3, 69),
(3, 70),
(3, 71),
(3, 72),
(3, 73),
(3, 75),
(3, 77),
(3, 79),
(3, 80),
(3, 84),
(3, 87),
(3, 88),
(3, 92),
(3, 95),
(3, 96),
(3, 100),
(3, 103),
(3, 104),
(3, 107),
(3, 110),
(3, 111),
(3, 113),
(3, 114),
(3, 115),
(3, 116),
(3, 117),
(3, 118),
(3, 119),
(3, 120),
(3, 135),
(3, 136),
(3, 137),
(3, 138),
(3, 139),
(3, 142),
(3, 146),
(3, 147),
(3, 148),
(3, 149),
(3, 150),
(3, 151),
(3, 152),
(3, 153),
(3, 154),
(3, 155),
(3, 156),
(3, 157),
(3, 158),
(3, 159),
(3, 160),
(3, 161),
(3, 162),
(3, 163),
(3, 164),
(3, 165),
(3, 166),
(3, 167),
(3, 168),
(3, 169),
(3, 170),
(3, 171),
(3, 173),
(3, 174),
(3, 175),
(3, 176),
(3, 177),
(3, 178),
(3, 179),
(3, 184),
(3, 185),
(3, 186),
(3, 187),
(3, 192),
(4, 9),
(4, 12),
(4, 24),
(4, 25),
(4, 26),
(4, 27),
(4, 28),
(4, 29),
(4, 30),
(4, 31),
(4, 32),
(4, 37),
(4, 39),
(4, 40),
(4, 51),
(4, 52),
(4, 53),
(4, 54),
(4, 55),
(4, 56),
(4, 57),
(4, 58),
(4, 59),
(4, 60),
(4, 61),
(4, 62),
(4, 63),
(4, 64),
(4, 65),
(4, 66),
(4, 67),
(4, 68),
(4, 69),
(4, 70),
(4, 71),
(4, 72),
(4, 73),
(4, 75),
(4, 77),
(4, 79),
(4, 80),
(4, 84),
(4, 87),
(4, 88),
(4, 92),
(4, 95),
(4, 96),
(4, 100),
(4, 103),
(4, 104),
(4, 107),
(4, 110),
(4, 111),
(4, 113),
(4, 114),
(4, 115),
(4, 116),
(4, 117),
(4, 118),
(4, 119),
(4, 120),
(4, 135),
(4, 136),
(4, 137),
(4, 138),
(4, 139),
(4, 142),
(4, 146),
(4, 147),
(4, 148),
(4, 149),
(4, 150),
(4, 151),
(4, 152),
(4, 153),
(4, 154),
(4, 155),
(4, 156),
(4, 157),
(4, 158),
(4, 159),
(4, 160),
(4, 161),
(4, 162),
(4, 163),
(4, 164),
(4, 165),
(4, 166),
(4, 167),
(4, 168),
(4, 169),
(4, 170),
(4, 171),
(4, 173),
(4, 174),
(4, 175),
(4, 176),
(4, 177),
(4, 178),
(4, 179),
(4, 184),
(4, 185),
(4, 186),
(4, 187),
(4, 192),
(5, 9),
(5, 12),
(5, 24),
(5, 28),
(5, 32),
(5, 37),
(5, 40),
(5, 51),
(5, 52),
(5, 53),
(5, 54),
(5, 55),
(5, 56),
(5, 57),
(5, 58),
(5, 59),
(5, 60),
(5, 61),
(5, 62),
(5, 63),
(5, 64),
(5, 65),
(5, 66),
(5, 67),
(5, 68),
(5, 69),
(5, 70),
(5, 71),
(5, 72),
(5, 73),
(5, 75),
(5, 77),
(5, 79),
(5, 80),
(5, 84),
(5, 87),
(5, 88),
(5, 92),
(5, 95),
(5, 96),
(5, 100),
(5, 103),
(5, 104),
(5, 107),
(5, 110),
(5, 111),
(5, 113),
(5, 114),
(5, 115),
(5, 116),
(5, 117),
(5, 118),
(5, 119),
(5, 120),
(5, 135),
(5, 136),
(5, 137),
(5, 138),
(5, 139),
(5, 142),
(5, 146),
(5, 179),
(5, 184),
(5, 185),
(5, 186),
(5, 187),
(5, 192),
(8, 9),
(8, 12),
(8, 24),
(8, 25),
(8, 26),
(8, 27),
(8, 28),
(8, 29),
(8, 30),
(8, 31),
(8, 32),
(8, 37),
(8, 40),
(8, 42),
(8, 43),
(8, 44),
(8, 45),
(8, 46),
(8, 47),
(8, 51),
(8, 52),
(8, 53),
(8, 54),
(8, 55),
(8, 56),
(8, 57),
(8, 58),
(8, 59),
(8, 60),
(8, 61),
(8, 62),
(8, 63),
(8, 64),
(8, 65),
(8, 66),
(8, 67),
(8, 68),
(8, 69),
(8, 70),
(8, 71),
(8, 72),
(8, 73),
(8, 75),
(8, 77),
(8, 79),
(8, 80),
(8, 84),
(8, 87),
(8, 88),
(8, 92),
(8, 95),
(8, 96),
(8, 100),
(8, 103),
(8, 104),
(8, 107),
(8, 110),
(8, 111),
(8, 113),
(8, 114),
(8, 115),
(8, 116),
(8, 117),
(8, 118),
(8, 119),
(8, 120),
(8, 135),
(8, 136),
(8, 137),
(8, 138),
(8, 139),
(8, 142),
(8, 146),
(8, 147),
(8, 148),
(8, 149),
(8, 150),
(8, 151),
(8, 152),
(8, 153),
(8, 154),
(8, 155),
(8, 156),
(8, 157),
(8, 158),
(8, 159),
(8, 160),
(8, 161),
(8, 162),
(8, 163),
(8, 164),
(8, 165),
(8, 166),
(8, 167),
(8, 168),
(8, 169),
(8, 170),
(8, 171),
(8, 173),
(8, 174),
(8, 175),
(8, 176),
(8, 177),
(8, 178),
(8, 179),
(8, 184),
(8, 185),
(8, 186),
(8, 187),
(8, 192),
(10, 1),
(10, 2),
(10, 3),
(10, 14),
(10, 15),
(11, 10),
(11, 12),
(11, 14),
(11, 15),
(11, 16),
(11, 17),
(11, 18),
(11, 22),
(11, 23),
(11, 134),
(13, 12),
(16, 1),
(16, 2),
(16, 3),
(16, 10),
(16, 14),
(16, 15),
(16, 16),
(16, 17),
(16, 18),
(16, 22),
(16, 23),
(16, 33),
(16, 34),
(16, 35),
(16, 36),
(16, 133),
(16, 134),
(16, 140),
(16, 141),
(16, 144),
(16, 145),
(16, 147),
(16, 148),
(16, 149),
(16, 150),
(16, 151),
(16, 152),
(16, 153),
(16, 154),
(16, 155),
(16, 156),
(16, 157),
(16, 158),
(16, 159),
(16, 160),
(16, 161),
(16, 162),
(16, 163),
(16, 164),
(16, 165),
(16, 166),
(16, 167),
(16, 168),
(16, 169),
(16, 170),
(16, 171),
(16, 173),
(16, 174),
(16, 175),
(16, 176),
(16, 177),
(16, 178),
(16, 180),
(16, 181),
(16, 182),
(16, 183),
(17, 1),
(17, 2),
(17, 3),
(17, 10),
(17, 33),
(17, 34),
(17, 35),
(17, 36),
(17, 133),
(17, 134),
(17, 140),
(17, 141),
(17, 180),
(17, 181),
(17, 182),
(17, 183),
(17, 188),
(17, 189),
(17, 190),
(17, 193),
(17, 194),
(18, 9),
(18, 12),
(18, 24),
(18, 25),
(18, 26),
(18, 27),
(18, 28),
(18, 29),
(18, 30),
(18, 31),
(18, 32),
(18, 37),
(18, 40),
(18, 42),
(18, 43),
(18, 44),
(18, 45),
(18, 46),
(18, 47),
(18, 51),
(18, 52),
(18, 53),
(18, 54),
(18, 55),
(18, 56),
(18, 57),
(18, 58),
(18, 59),
(18, 60),
(18, 61),
(18, 62),
(18, 63),
(18, 64),
(18, 65),
(18, 66),
(18, 67),
(18, 68),
(18, 69),
(18, 70),
(18, 71),
(18, 72),
(18, 73),
(18, 75),
(18, 77),
(18, 79),
(18, 80),
(18, 84),
(18, 87),
(18, 88),
(18, 92),
(18, 95),
(18, 96),
(18, 100),
(18, 103),
(18, 104),
(18, 107),
(18, 110),
(18, 111),
(18, 113),
(18, 114),
(18, 115),
(18, 116),
(18, 117),
(18, 118),
(18, 119),
(18, 120),
(18, 135),
(18, 136),
(18, 137),
(18, 138),
(18, 139),
(18, 142),
(18, 146),
(18, 147),
(18, 148),
(18, 149),
(18, 150),
(18, 151),
(18, 152),
(18, 153),
(18, 154),
(18, 155),
(18, 156),
(18, 157),
(18, 158),
(18, 159),
(18, 160),
(18, 161),
(18, 162),
(18, 163),
(18, 164),
(18, 165),
(18, 166),
(18, 167),
(18, 168),
(18, 169),
(18, 170),
(18, 171),
(18, 173),
(18, 174),
(18, 175),
(18, 176),
(18, 177),
(18, 178),
(18, 179),
(18, 184),
(18, 185),
(18, 186),
(18, 187),
(18, 192),
(19, 4),
(19, 5),
(19, 6),
(19, 7),
(19, 8),
(19, 11),
(19, 12),
(19, 14),
(19, 15),
(19, 16),
(19, 17),
(19, 18),
(19, 19),
(19, 20),
(19, 21),
(19, 22),
(19, 23),
(19, 24),
(19, 26),
(19, 28),
(19, 30),
(19, 32),
(19, 38),
(19, 39),
(19, 41),
(19, 45),
(19, 46),
(19, 47),
(19, 48),
(19, 49),
(19, 50),
(19, 51),
(19, 53),
(19, 54),
(19, 57),
(19, 58),
(19, 60),
(19, 61),
(19, 63),
(19, 64),
(19, 66),
(19, 69),
(19, 70),
(19, 72),
(19, 74),
(19, 75),
(19, 76),
(19, 77),
(19, 78),
(19, 79),
(19, 80),
(19, 81),
(19, 82),
(19, 83),
(19, 84),
(19, 85),
(19, 86),
(19, 87),
(19, 88),
(19, 89),
(19, 90),
(19, 91),
(19, 92),
(19, 93),
(19, 94),
(19, 95),
(19, 96),
(19, 97),
(19, 98),
(19, 99),
(19, 100),
(19, 101),
(19, 102),
(19, 103),
(19, 104),
(19, 105),
(19, 106),
(19, 107),
(19, 108),
(19, 109),
(19, 110),
(19, 111),
(19, 112),
(19, 114),
(19, 115),
(19, 118),
(19, 119),
(19, 121),
(19, 122),
(19, 123),
(19, 124),
(19, 125),
(19, 126),
(19, 127),
(19, 128),
(19, 129),
(19, 130),
(19, 131),
(19, 132),
(19, 143),
(19, 144),
(19, 145),
(19, 146),
(19, 147),
(19, 148),
(19, 149),
(19, 151),
(19, 152),
(19, 153),
(19, 155),
(19, 156),
(19, 157),
(19, 159),
(19, 160),
(19, 161),
(19, 163),
(19, 164),
(19, 165),
(19, 166),
(19, 168),
(19, 169),
(19, 170),
(19, 173),
(19, 174),
(19, 175),
(19, 176),
(19, 177),
(19, 178),
(19, 179),
(19, 184),
(19, 185),
(19, 186),
(19, 191);

-- --------------------------------------------------------

--
-- Table structure for table `user_procedure_logs`
--

CREATE TABLE `user_procedure_logs` (
  `id` int(11) NOT NULL,
  `trainee_id` int(11) NOT NULL,
  `procedure_id` int(11) NOT NULL,
  `num_performed` int(11) DEFAULT 0,
  `num_observed` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_procedure_logs`
--

INSERT INTO `user_procedure_logs` (`id`, `trainee_id`, `procedure_id`, `num_performed`, `num_observed`) VALUES
(29, 22, 1, 6, 8),
(38, 22, 2, 6, 6),
(76, 22, 3, 6, 6),
(86, 22, 4, 7, 6),
(90, 22, 5, 6, 6);

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `User_ID` int(25) NOT NULL,
  `Skill_Name` varchar(255) NOT NULL,
  `Skill_ID` int(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_skills`
--

INSERT INTO `user_skills` (`User_ID`, `Skill_Name`, `Skill_ID`) VALUES
(22, 'Testsssssss', 6),
(22, 'Testsssssssss', 7);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accomplishments`
--
ALTER TABLE `accomplishments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user` (`User_ID`);

--
-- Indexes for table `bau`
--
ALTER TABLE `bau`
  ADD PRIMARY KEY (`Bau_ID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `case_based_discussion_assessment`
--
ALTER TABLE `case_based_discussion_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `case_presentations`
--
ALTER TABLE `case_presentations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_contact_user` (`user_id`);

--
-- Indexes for table `departmental_activities`
--
ALTER TABLE `departmental_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `dops`
--
ALTER TABLE `dops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resident_id` (`resident_id`),
  ADD KEY `fk_supervisor_id` (`supervisor_id`);

--
-- Indexes for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `elearning_materials`
--
ALTER TABLE `elearning_materials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fellow_resident_evaluation`
--
ALTER TABLE `fellow_resident_evaluation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fellow_idx` (`resident_id`),
  ADD KEY `supervisor_idx` (`supervisor_id`);

--
-- Indexes for table `first_year_rotations`
--
ALTER TABLE `first_year_rotations`
  ADD PRIMARY KEY (`rotation_id`),
  ADD KEY `f` (`trainee_id`),
  ADD KEY `fk` (`supervisor_id`);

--
-- Indexes for table `forbidden_logs`
--
ALTER TABLE `forbidden_logs`
  ADD KEY `Function_ID` (`Function_ID`),
  ADD KEY `User_ID` (`User_ID`);

--
-- Indexes for table `functions`
--
ALTER TABLE `functions`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `grand_round_presentation_assessment`
--
ALTER TABLE `grand_round_presentation_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `journal_club_assessment`
--
ALTER TABLE `journal_club_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `resident_id` (`resident_id`);

--
-- Indexes for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `certificate_id` (`certificate_id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `fk_hospital` (`hospital_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `mini_cex`
--
ALTER TABLE `mini_cex`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id_fk` (`resident_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `miscellaneous_activities`
--
ALTER TABLE `miscellaneous_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `mortality_morbidity_review_assessment`
--
ALTER TABLE `mortality_morbidity_review_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `resident_id` (`resident_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `prelogin_contact_messages`
--
ALTER TABLE `prelogin_contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `procedures`
--
ALTER TABLE `procedures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `procedure_evaluation`
--
ALTER TABLE `procedure_evaluation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `procedure_summary_logs`
--
ALTER TABLE `procedure_summary_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial_no` (`serial_no`),
  ADD UNIQUE KEY `serial_no_2` (`serial_no`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `research`
--
ALTER TABLE `research`
  ADD PRIMARY KEY (`id`),
  ADD KEY `User_ID` (`User_ID`);

--
-- Indexes for table `research_publications`
--
ALTER TABLE `research_publications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rotation_1st_year_config`
--
ALTER TABLE `rotation_1st_year_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `rotation_2nd_year_config`
--
ALTER TABLE `rotation_2nd_year_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `rotation_3rd_year_config`
--
ALTER TABLE `rotation_3rd_year_config`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `second_year_rotations`
--
ALTER TABLE `second_year_rotations`
  ADD PRIMARY KEY (`rotation_id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `seminars`
--
ALTER TABLE `seminars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `seminar_assessment`
--
ALTER TABLE `seminar_assessment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resident_id` (`resident_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `supervisor_supervisee`
--
ALTER TABLE `supervisor_supervisee`
  ADD PRIMARY KEY (`SupervisorID`,`SuperviseeID`),
  ADD KEY `supervisor_supervisee_ibfk_1` (`SuperviseeID`);

--
-- Indexes for table `surgical_experiences`
--
ALTER TABLE `surgical_experiences`
  ADD PRIMARY KEY (`Experience_ID`),
  ADD KEY `User_ID` (`User_ID`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `teaching`
--
ALTER TABLE `teaching`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `third_year_rotations`
--
ALTER TABLE `third_year_rotations`
  ADD PRIMARY KEY (`rotation_id`),
  ADD KEY `trainee_id` (`trainee_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trainee_id` (`trainee_id`,`material_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `trainee_portfolio_images`
--
ALTER TABLE `trainee_portfolio_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`User_ID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `Bau_ID` (`Bau_ID`),
  ADD KEY `Role` (`Role`);

--
-- Indexes for table `usertypes`
--
ALTER TABLE `usertypes`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Name` (`Name`);

--
-- Indexes for table `usertype_functions`
--
ALTER TABLE `usertype_functions`
  ADD PRIMARY KEY (`UsertypeId`,`FunctionsId`),
  ADD KEY `FunctionsId` (`FunctionsId`);

--
-- Indexes for table `user_procedure_logs`
--
ALTER TABLE `user_procedure_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trainee_id` (`trainee_id`,`procedure_id`),
  ADD UNIQUE KEY `trainee_id_2` (`trainee_id`,`procedure_id`),
  ADD KEY `procedure_id` (`procedure_id`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`Skill_ID`),
  ADD KEY `UserID` (`User_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accomplishments`
--
ALTER TABLE `accomplishments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `bau`
--
ALTER TABLE `bau`
  MODIFY `Bau_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_based_discussion_assessment`
--
ALTER TABLE `case_based_discussion_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `case_presentations`
--
ALTER TABLE `case_presentations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `departmental_activities`
--
ALTER TABLE `departmental_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dops`
--
ALTER TABLE `dops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `elearning_materials`
--
ALTER TABLE `elearning_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `fellow_resident_evaluation`
--
ALTER TABLE `fellow_resident_evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `first_year_rotations`
--
ALTER TABLE `first_year_rotations`
  MODIFY `rotation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `functions`
--
ALTER TABLE `functions`
  MODIFY `Id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT for table `grand_round_presentation_assessment`
--
ALTER TABLE `grand_round_presentation_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `journal_club_assessment`
--
ALTER TABLE `journal_club_assessment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `mini_cex`
--
ALTER TABLE `mini_cex`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `miscellaneous_activities`
--
ALTER TABLE `miscellaneous_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `mortality_morbidity_review_assessment`
--
ALTER TABLE `mortality_morbidity_review_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `prelogin_contact_messages`
--
ALTER TABLE `prelogin_contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `procedures`
--
ALTER TABLE `procedures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `procedure_evaluation`
--
ALTER TABLE `procedure_evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `procedure_summary_logs`
--
ALTER TABLE `procedure_summary_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `research`
--
ALTER TABLE `research`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `research_publications`
--
ALTER TABLE `research_publications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rotation_1st_year_config`
--
ALTER TABLE `rotation_1st_year_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rotation_2nd_year_config`
--
ALTER TABLE `rotation_2nd_year_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rotation_3rd_year_config`
--
ALTER TABLE `rotation_3rd_year_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seminars`
--
ALTER TABLE `seminars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `seminar_assessment`
--
ALTER TABLE `seminar_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `surgical_experiences`
--
ALTER TABLE `surgical_experiences`
  MODIFY `Experience_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `teaching`
--
ALTER TABLE `teaching`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `third_year_rotations`
--
ALTER TABLE `third_year_rotations`
  MODIFY `rotation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `trainee_portfolio_images`
--
ALTER TABLE `trainee_portfolio_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `usertypes`
--
ALTER TABLE `usertypes`
  MODIFY `Id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_procedure_logs`
--
ALTER TABLE `user_procedure_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `user_skills`
--
ALTER TABLE `user_skills`
  MODIFY `Skill_ID` int(25) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accomplishments`
--
ALTER TABLE `accomplishments`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `case_based_discussion_assessment`
--
ALTER TABLE `case_based_discussion_assessment`
  ADD CONSTRAINT `case_based_discussion_assessment_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `case_based_discussion_assessment_supervisor_fk` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `case_presentations`
--
ALTER TABLE `case_presentations`
  ADD CONSTRAINT `case_presentations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE SET NULL;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `departmental_activities`
--
ALTER TABLE `departmental_activities`
  ADD CONSTRAINT `departmental_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dops`
--
ALTER TABLE `dops`
  ADD CONSTRAINT `fk_resident_id` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_supervisor_id` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  ADD CONSTRAINT `eduactconferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  ADD CONSTRAINT `eduactcourses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  ADD CONSTRAINT `eduactworkshops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `fellow_resident_evaluation`
--
ALTER TABLE `fellow_resident_evaluation`
  ADD CONSTRAINT `fk_fellow` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `first_year_rotations`
--
ALTER TABLE `first_year_rotations`
  ADD CONSTRAINT `f` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forbidden_logs`
--
ALTER TABLE `forbidden_logs`
  ADD CONSTRAINT `forbidden_logs_ibfk_1` FOREIGN KEY (`Function_ID`) REFERENCES `functions` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `forbidden_logs_ibfk_2` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `grand_round_presentation_assessment`
--
ALTER TABLE `grand_round_presentation_assessment`
  ADD CONSTRAINT `grand_round_presentation_assessment_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grand_round_presentation_assessment_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `journal_club_assessment`
--
ALTER TABLE `journal_club_assessment`
  ADD CONSTRAINT `journal_club_assessment_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `journal_club_assessment_ibfk_2` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  ADD CONSTRAINT `fk_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `logbook_profile_info_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mini_cex`
--
ALTER TABLE `mini_cex`
  ADD CONSTRAINT `mini_cex_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resident_id_fk` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `miscellaneous_activities`
--
ALTER TABLE `miscellaneous_activities`
  ADD CONSTRAINT `miscellaneous_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mortality_morbidity_review_assessment`
--
ALTER TABLE `mortality_morbidity_review_assessment`
  ADD CONSTRAINT `mortality_morbidity_review_assessment_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mortality_morbidity_review_assessment_ibfk_2` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procedure_evaluation`
--
ALTER TABLE `procedure_evaluation`
  ADD CONSTRAINT `procedure_evaluation_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `procedure_evaluation_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `procedure_summary_logs`
--
ALTER TABLE `procedure_summary_logs`
  ADD CONSTRAINT `procedure_summary_logs_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `research`
--
ALTER TABLE `research`
  ADD CONSTRAINT `research_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `research_publications`
--
ALTER TABLE `research_publications`
  ADD CONSTRAINT `research_publications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotation_1st_year_config`
--
ALTER TABLE `rotation_1st_year_config`
  ADD CONSTRAINT `rotation_1st_year_config_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotation_2nd_year_config`
--
ALTER TABLE `rotation_2nd_year_config`
  ADD CONSTRAINT `rotation_2nd_year_config_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotation_3rd_year_config`
--
ALTER TABLE `rotation_3rd_year_config`
  ADD CONSTRAINT `rotation_3rd_year_config_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `second_year_rotations`
--
ALTER TABLE `second_year_rotations`
  ADD CONSTRAINT `second_year_rotations_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `seminars`
--
ALTER TABLE `seminars`
  ADD CONSTRAINT `seminars_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `seminar_assessment`
--
ALTER TABLE `seminar_assessment`
  ADD CONSTRAINT `seminar_assessment_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `seminar_assessment_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supervisor_supervisee`
--
ALTER TABLE `supervisor_supervisee`
  ADD CONSTRAINT `supervisor_supervisee_ibfk_1` FOREIGN KEY (`SuperviseeID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `supervisor_supervisee_ibfk_2` FOREIGN KEY (`SupervisorID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `surgical_experiences`
--
ALTER TABLE `surgical_experiences`
  ADD CONSTRAINT `surgical_experiences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teaching`
--
ALTER TABLE `teaching`
  ADD CONSTRAINT `teaching_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `third_year_rotations`
--
ALTER TABLE `third_year_rotations`
  ADD CONSTRAINT `third_year_rotations_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `third_year_rotations_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `elearning_materials` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trainee_portfolio_images`
--
ALTER TABLE `trainee_portfolio_images`
  ADD CONSTRAINT `trainee_portfolio_images_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`Role`) REFERENCES `usertypes` (`Id`);

--
-- Constraints for table `usertype_functions`
--
ALTER TABLE `usertype_functions`
  ADD CONSTRAINT `usertype_functions_ibfk_1` FOREIGN KEY (`UsertypeId`) REFERENCES `usertypes` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usertype_functions_ibfk_2` FOREIGN KEY (`FunctionsId`) REFERENCES `functions` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_procedure_logs`
--
ALTER TABLE `user_procedure_logs`
  ADD CONSTRAINT `user_procedure_logs_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_procedure_logs_ibfk_2` FOREIGN KEY (`procedure_id`) REFERENCES `procedures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
