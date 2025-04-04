-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 04, 2025 at 11:50 PM
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
(3, 'test2', 'test', '/uploads/1741390401930.jpg', 22);

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
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_based_discussion_assessment`
--

INSERT INTO `case_based_discussion_assessment` (`id`, `resident_id`, `supervisor_id`, `date`, `diagnosis`, `case_complexity`, `Investigation_Referral`, `treatment`, `future_planning`, `history_taking`, `overall_clinical_care`, `assessor_comment`, `resident_comment`, `resident_signature`, `assessor_signature`, `sent`, `completed`) VALUES
(2, 22, 28, '2025-03-30', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'uploads\\1743289787224.png', 0, 0),
(3, 22, 28, '2025-03-30', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'uploads\\1743289824406.png', 0, 0),
(4, 22, 1, '2025-03-30', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, 'uploads\\1743292148327.png', 0, 0),
(5, 22, 28, '2025-04-02', 'Flu23', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment22', 'Updated Comment', 'uploads\\1743549430849.png', 'uploads\\1743549471199.jpg', 1, 1),
(6, 22, 28, '2025-04-02', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', NULL, NULL, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `message`, `created_at`) VALUES
(1, 'Lorence', 'This is a test message.', '2025-03-11 15:18:45');

-- --------------------------------------------------------

--
-- Table structure for table `dops`
--

CREATE TABLE `dops` (
  `id` int(11) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `trainee_id` int(11) DEFAULT NULL,
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
  `is_sent_to_trainee` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(6, 26, 'new', '2025-03-08', 'update', 'new', '1741862709259.PNG'),
(7, 1, 'test', '2025-02-04', 'testhost', 'testdescription', NULL);

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
(5, 27, 'Advanced Medicine Updated', '2024-12-07', 'BAU', 'Advanced Medical Pratices', '1741643821554.jpg');

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
(1, 27, 'Pediatric Advanced Life Support Updated.', '2024-06-12', 'BAU', 'An updated workshop on pediatric life support techniques.', '1741689975178.jpg'),
(3, 1, 'test', '2025-02-04', 'test', 'testdescription', NULL);

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
(1, 'Example Material', 'books_articles', 'any description of example material', 'www.example.com', '2025-02-27 19:55:08', NULL),
(2, 'example material 2', 'workshops_activities', 'descriptionnnn 2', 'www.example.com', '2025-02-27 20:15:58', NULL),
(3, 'Introduction to Cardiology', 'medical_course', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:01:45', NULL),
(4, 'Introduction to Cardiology', 'medical_course', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:02:22', NULL),
(7, 'Introduction to Cardiology', 'workshops_activities', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:03:24', 'jad'),
(8, 'Introduction to Cardiology', 'books_articles', 'A comprehensive guide to cardiology basics.', 'https://example.com/cardiology-course', '2025-03-30 00:03:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fellow_resident_evaluation`
--

CREATE TABLE `fellow_resident_evaluation` (
  `id` int(11) NOT NULL,
  `fellow_name` varchar(255) NOT NULL,
  `fellow_id` int(11) NOT NULL,
  `hospital` varchar(255) NOT NULL,
  `date_of_rotation` date NOT NULL,
  `instructor_name` varchar(255) NOT NULL,
  `instructor_signature` varchar(255) DEFAULT NULL,
  `punctuality` int(11) DEFAULT NULL CHECK (`punctuality` between 1 and 5),
  `dependable` int(11) DEFAULT NULL CHECK (`dependable` between 1 and 5),
  `respectful` int(11) DEFAULT NULL CHECK (`respectful` between 1 and 5),
  `positive_interaction` int(11) DEFAULT NULL CHECK (`positive_interaction` between 1 and 5),
  `self_learning` int(11) DEFAULT NULL CHECK (`self_learning` between 1 and 5),
  `communication` int(11) DEFAULT NULL CHECK (`communication` between 1 and 5),
  `history_taking` int(11) DEFAULT NULL CHECK (`history_taking` between 1 and 5),
  `physical_examination` int(11) DEFAULT NULL CHECK (`physical_examination` between 1 and 5),
  `clinical_reasoning` int(11) DEFAULT NULL CHECK (`clinical_reasoning` between 1 and 5),
  `application_knowledge` int(11) DEFAULT NULL CHECK (`application_knowledge` between 1 and 5),
  `overall_marks` int(11) DEFAULT NULL CHECK (`overall_marks` between 0 and 100),
  `strengths` text DEFAULT NULL,
  `suggestions` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `functions`
--

CREATE TABLE `functions` (
  `Name` varchar(25) NOT NULL,
  `Id` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `functions`
--

INSERT INTO `functions` (`Name`, `Id`) VALUES
('register_user', 1),
('update_user', 2),
('delete_user', 3),
('viewMaterial', 4),
('completeMaterial', 5),
('get_elearning_progress', 6),
('add_portfolio_image', 7),
('remove_portfolio_image', 8);

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
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grand_round_presentation_assessment`
--

INSERT INTO `grand_round_presentation_assessment` (`id`, `resident_id`, `supervisor_id`, `date`, `diagnosis`, `case_complexity`, `history_taking`, `physical_examination`, `provisional_diagnosis`, `treatment`, `future_planning`, `assessor_comment`, `resident_comment`, `resident_signature`, `assessor_signature`, `sent`, `completed`) VALUES
(1, 22, 28, '2025-04-02', 'Flu232', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment2', NULL, NULL, 'uploads\\1743542547183.png', 1, 0),
(2, 22, 28, '2025-04-02', 'Flu', 'Moderate', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'Good assessment', 'Updated Commentasasas', 'uploads\\1743542733333.jpg', 'uploads\\1743542642230.png', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `journal_club_assessment`
--

CREATE TABLE `journal_club_assessment` (
  `id` int(11) NOT NULL,
  `resident_name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `article_reference` varchar(255) NOT NULL,
  `paper_selection` varchar(255) DEFAULT NULL,
  `background_knowledge` varchar(255) DEFAULT NULL,
  `critical_analysis_methodology` text DEFAULT NULL,
  `critical_analysis_results` text DEFAULT NULL,
  `conclusions_drawn` text DEFAULT NULL,
  `audio_visual_aids` text DEFAULT NULL,
  `handling_questions` text DEFAULT NULL,
  `overall_performance` text DEFAULT NULL,
  `major_positive_feature` text DEFAULT NULL,
  `suggested_article_selection` text DEFAULT NULL,
  `suggested_critical_analysis` text DEFAULT NULL,
  `suggested_slide_design` text DEFAULT NULL,
  `suggested_presentation` text DEFAULT NULL,
  `suggested_answering_questions` text DEFAULT NULL,
  `agreed_action_plan` text DEFAULT NULL,
  `resident_signature` varchar(255) DEFAULT NULL,
  `assessor_signature` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logbook_profile_info`
--

INSERT INTO `logbook_profile_info` (`id`, `trainee_id`, `resident_name`, `academic_year`, `email`, `mobile_no`, `created_at`, `updated_at`) VALUES
(1, 26, 'Rima Doe', '2025', 'johndoe@example.com', '9876543210', '2025-04-04 21:30:06', '2025-04-04 21:34:03');

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
(3, 'Training Schedule', 'Your next training session is on Monday.', 22, 28, '2025-03-29 23:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `mini_cex`
--

CREATE TABLE `mini_cex` (
  `id` int(11) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `supervisor_name` varchar(255) DEFAULT NULL,
  `trainee_id` int(11) DEFAULT NULL,
  `trainee_name` varchar(255) DEFAULT NULL,
  `resident_level` enum('R-1/F-1','R-2/F-2','R-3/F-3') NOT NULL,
  `evaluation_date` date NOT NULL,
  `setting` enum('Ambulatory','In-patient','ED','Other') NOT NULL,
  `patient_problem` varchar(255) DEFAULT NULL,
  `patient_age` int(11) DEFAULT NULL,
  `patient_sex` enum('Male','Female') NOT NULL,
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
  `sent_to_trainee` tinyint(1) DEFAULT 0,
  `residentFellow` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mini_cex`
--

INSERT INTO `mini_cex` (`id`, `supervisor_id`, `supervisor_name`, `trainee_id`, `trainee_name`, `resident_level`, `evaluation_date`, `setting`, `patient_problem`, `patient_age`, `patient_sex`, `patient_type`, `complexity`, `focus`, `medical_interviewing`, `physical_exam`, `professionalism`, `clinical_judgment`, `counseling_skills`, `efficiency`, `overall_competence`, `observer_time`, `feedback_time`, `evaluator_satisfaction`, `resident_satisfaction`, `comments`, `evaluator_signature_path`, `trainee_signature_path`, `is_signed_by_trainee`, `is_signed_by_supervisor`, `is_draft`, `sent_to_trainee`, `residentFellow`) VALUES
(4, 30, 'rimastest', 26, 'rima test', 'R-2/F-2', '2025-01-04', 'In-patient', 'Chronic headache', 40, 'Female', 'Follow-up', 'Moderate', 'Diagnosis', 4, 5, 5, 4, 4, 4, 4, 2025, 2025, 5, 8, 'Patient responded well to treatment.', 'uploads\\1743467698943.PNG', NULL, 1, 1, 1, 1, NULL);

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
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mortality_morbidity_review_assessment`
--

INSERT INTO `mortality_morbidity_review_assessment` (`id`, `resident_id`, `supervisor_id`, `resident_fellow_name`, `date_of_presentation`, `diagnosis`, `cause_of_death_morbidity`, `brief_introduction`, `patient_details`, `assessment_analysis`, `review_of_literature`, `recommendations`, `handling_questions`, `overall_performance`, `major_positive_feature`, `suggested_areas_for_improvement`, `resident_signature_path`, `assessor_signature_path`, `sent`, `completed`) VALUES
(1, 22, 1, 'Aaa', '0000-00-00', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550361695.png', 0, 0),
(2, 22, 1, 'Aaa', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743423365481.jpg', 0, 0),
(3, 22, 1, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743426406850.jpg', 0, 0),
(4, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550239405.png', 1, 0),
(5, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', NULL, 'uploads\\1743550270964.png', 1, 0),
(6, 22, 28, 'test', '2024-10-10', 'Flu', 'aaa', 'Below Expectations', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'U/C', 'aaaaaaaas', 'asdfg', 'uploads\\1743550428883.jpg', 'uploads\\1743550382117.png', 1, 1);

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
(20, 28, 22, 'Your trainee test has signed the  seminar assessment form .', 0, '2025-04-01 23:41:19');

-- --------------------------------------------------------

--
-- Table structure for table `research`
--

CREATE TABLE `research` (
  `Research_ID` int(11) NOT NULL,
  `User_ID` int(11) DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Date` date NOT NULL,
  `Description` text NOT NULL,
  `File_Path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
  `completed` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seminar_assessment`
--

INSERT INTO `seminar_assessment` (`id`, `resident_id`, `supervisor_id`, `resident_fellow_name`, `date_of_presentation`, `topic`, `content`, `presentation_skills`, `audio_visual_aids`, `communication`, `handling_questions`, `audience_management`, `references`, `major_positive_feature`, `suggested_areas_for_improvement`, `resident_signature_path`, `assessor_signature_path`, `sent`, `completed`) VALUES
(1, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, 'uploads\\1743550730360.png', 0, 0),
(2, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Proceduressdfgh', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examplesasd', 'Could improve time management and slide transitionsasdfgfds', 'uploads\\1743550879174.png', 'uploads\\1743550857039.png', 1, 1),
(3, 22, 28, 'test', '2023-10-15', 'Advanced Cardiac Procedures', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Meets Expectations', 'Excellent clinical examples', 'Could improve time management and slide transitions', NULL, 'uploads\\1743550772289.png', 1, 0);

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
(28, 22);

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
  `trainee_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `name`, `deadline`, `description`, `trainee_id`, `supervisor_id`) VALUES
(1, 'Task 1', '2025-04-01', 'Complete module 1', 23, 28),
(2, 'Task 1', '2025-04-01', 'Complete module 1', 22, 28);

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
(1, 23, 1, 'completed', '2025-02-28 11:44:29');

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
(1, 'Admin User', 'admin', 1, '$2b$10$DfWFKh2rvumR4bWkLuBvUuu0yTh1ConhRT6BRnFnQsbvhSMg8O7aC', NULL, NULL),
(17, 'register', 'reg@example.com', 6, '$2b$10$pTvz5TVBaXaFjHRXT7NAhu2SL.98Owa9z3AL9dwVb8IfRJcoDj11W', NULL, NULL),
(18, 'update', 'update@example.com', 7, '$2b$10$ugAzdOcovNnkBH/.NwdSMeFhSHQGHIP9/seZZmAoMjiZueFtO57va', NULL, NULL),
(19, 'delete', 'del@example.com', 8, '$2b$10$kXR4C10cSLXQ3Kp8Nad5mOsvxRFXREjqxl7j.B9A2OB760OtPGthW', NULL, NULL),
(22, 'test', 'test@example.com', 2, '$2b$10$FvNsjO4K8iMXMRdmBiGiV.CRgKZ0xjfnmaaf4NjQJgX7UCJBaZlsW', NULL, NULL),
(23, 'trainee1', 'trainee@example.com', 2, '$2b$10$X8UNE6qMYCnOmLkNCgWXEO.799dmU4Z29AaZZhLdhdQO3UQtwx/6u', NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRyYWluZWVAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDE0NDgyNjcsImV4cCI6MTc0MTQ1MTg2N30.VREFtakw77mANcTS5VkIck9xQqNBcwFHXZmhEWgepCI'),
(26, 'rima test', 'rimashbaro02@gmail.com', 2, '$2b$10$G7S8x0jKHZy67NtzXjVu/.nFcJ/oGXwLx1GmDQ1VMWhHXraDEWF7q', NULL, NULL),
(27, 'Lorence', 'lorence@example.com', 2, '$2b$10$rfV993WXptxQMcmEJjyQk.fWjt09wGlr.AXBwu7W5S79asUGc1yOC', NULL, NULL),
(28, 'supervisor', 'suppp@example.com', 3, '$2b$10$onMwNaIHc9p/BQ/.7YBlReowAuWangTFAEhex/p2pjD8Kz9FuXTF6', NULL, NULL),
(29, 'test', 'supervisor@example.com', 3, '$2b$10$cIb1CqTCpU/MyEJSLa6HceXDB0uwDo2mpFJ.TjNNqyV97h3VOTgtO', NULL, NULL),
(30, 'rimastest', 'rimashbaro@gmail.com', 4, '$2b$10$kXeMv9qOcMTorCVpsq9EJO4wJ1r0SHQy7zEVqZoP6W.24WJ6Ksfaq', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usertypes`
--

CREATE TABLE `usertypes` (
  `Name` varchar(25) NOT NULL,
  `Id` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usertypes`
--

INSERT INTO `usertypes` (`Name`, `Id`) VALUES
('admin', 1),
('trainee', 2),
('educational_supervisor', 3),
('clinical_supervisor', 4),
('clinic', 5),
('register', 6),
('update', 7),
('delete', 8);

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
(6, 1),
(7, 2),
(8, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(1, 7),
(1, 8),
(6, 1),
(7, 2),
(8, 3),
(2, 4),
(2, 5),
(2, 6),
(6, 1),
(7, 2),
(8, 3),
(2, 4),
(2, 5),
(2, 6),
(6, 1),
(7, 2),
(8, 3),
(2, 4),
(2, 5),
(2, 6);

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
(22, 'Test', 1),
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
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dops`
--
ALTER TABLE `dops`
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `fellow_id` (`fellow_id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trainee_id` (`trainee_id`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mortality_morbidity_review_assessment`
--
ALTER TABLE `mortality_morbidity_review_assessment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `sender_id` (`sender_id`);

--
-- Indexes for table `research`
--
ALTER TABLE `research`
  ADD PRIMARY KEY (`Research_ID`);

--
-- Indexes for table `seminar_assessment`
--
ALTER TABLE `seminar_assessment`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `usertype_functions`
--
ALTER TABLE `usertype_functions`
  ADD KEY `usertype_functions_ibfk_1` (`FunctionsId`),
  ADD KEY `usertype_functions_ibfk_2` (`UsertypeId`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `bau`
--
ALTER TABLE `bau`
  MODIFY `Bau_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `case_based_discussion_assessment`
--
ALTER TABLE `case_based_discussion_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `dops`
--
ALTER TABLE `dops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `elearning_materials`
--
ALTER TABLE `elearning_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `fellow_resident_evaluation`
--
ALTER TABLE `fellow_resident_evaluation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `functions`
--
ALTER TABLE `functions`
  MODIFY `Id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `grand_round_presentation_assessment`
--
ALTER TABLE `grand_round_presentation_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `journal_club_assessment`
--
ALTER TABLE `journal_club_assessment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mini_cex`
--
ALTER TABLE `mini_cex`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `mortality_morbidity_review_assessment`
--
ALTER TABLE `mortality_morbidity_review_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `research`
--
ALTER TABLE `research`
  MODIFY `Research_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `seminar_assessment`
--
ALTER TABLE `seminar_assessment`
  MODIFY `id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `surgical_experiences`
--
ALTER TABLE `surgical_experiences`
  MODIFY `Experience_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `trainee_portfolio_images`
--
ALTER TABLE `trainee_portfolio_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `usertypes`
--
ALTER TABLE `usertypes`
  MODIFY `Id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  ADD CONSTRAINT `case_based_discussion_assessment_resident_fk` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `case_based_discussion_assessment_supervisor_fk` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  ADD CONSTRAINT `eduactconferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  ADD CONSTRAINT `eduactcourses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  ADD CONSTRAINT `eduactworkshops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `fellow_resident_evaluation`
--
ALTER TABLE `fellow_resident_evaluation`
  ADD CONSTRAINT `fellow_resident_evaluation_ibfk_1` FOREIGN KEY (`fellow_id`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `grand_round_presentation_assessment`
--
ALTER TABLE `grand_round_presentation_assessment`
  ADD CONSTRAINT `grand_round_presentation_assessment_ibfk_1` FOREIGN KEY (`resident_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `grand_round_presentation_assessment_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `logbook_profile_info`
--
ALTER TABLE `logbook_profile_info`
  ADD CONSTRAINT `logbook_profile_info_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `supervisor_supervisee`
--
ALTER TABLE `supervisor_supervisee`
  ADD CONSTRAINT `supervisor_supervisee_ibfk_1` FOREIGN KEY (`SuperviseeID`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `supervisor_supervisee_ibfk_2` FOREIGN KEY (`SupervisorID`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `surgical_experiences`
--
ALTER TABLE `surgical_experiences`
  ADD CONSTRAINT `surgical_experiences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `elearning_materials` (`id`);

--
-- Constraints for table `trainee_portfolio_images`
--
ALTER TABLE `trainee_portfolio_images`
  ADD CONSTRAINT `trainee_portfolio_images_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`Bau_ID`) REFERENCES `bau` (`Bau_ID`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`Role`) REFERENCES `usertypes` (`Id`);

--
-- Constraints for table `usertype_functions`
--
ALTER TABLE `usertype_functions`
  ADD CONSTRAINT `usertype_functions_ibfk_1` FOREIGN KEY (`FunctionsId`) REFERENCES `functions` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usertype_functions_ibfk_2` FOREIGN KEY (`UsertypeId`) REFERENCES `usertypes` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
