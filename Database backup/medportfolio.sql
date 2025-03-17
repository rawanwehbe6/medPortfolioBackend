-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 18, 2025 at 12:25 PM
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
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'Lorence', 'lorence@gmail.com', 'This is a test message.', '2025-03-11 15:18:45');

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
(4, 26, 'conference', '2024-05-09', 'host', 'description', '1741544068694.PNG');

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
(1, 27, 'Pediatric Advanced Life Support Updated.', '2024-06-12', 'BAU', 'An updated workshop on pediatric life support techniques.', '1741689975178.jpg');

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
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `elearning_materials`
--

INSERT INTO `elearning_materials` (`id`, `title`, `category`, `description`, `resource_url`, `uploaded_at`) VALUES
(1, 'Example Material', 'books_articles', 'any description of example material', 'www.example.com', '2025-02-27 19:55:08'),
(2, 'example material 2', 'workshops_activities', 'descriptionnnn 2', 'www.example.com', '2025-02-27 20:15:58');

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
('get_elearning_progress', 6);
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

INSERT INTO `users` (`User_ID`, `Name`, `Email`, `Role`, `Password`, `Bau_ID`) VALUES
(1, 'Admin User', 'admin', 1, '$2b$10$DfWFKh2rvumR4bWkLuBvUuu0yTh1ConhRT6BRnFnQsbvhSMg8O7aC', NULL),
(17, 'register', 'reg@example.com', 6, '$2b$10$pTvz5TVBaXaFjHRXT7NAhu2SL.98Owa9z3AL9dwVb8IfRJcoDj11W', NULL),
(18, 'update', 'update@example.com', 7, '$2b$10$ugAzdOcovNnkBH/.NwdSMeFhSHQGHIP9/seZZmAoMjiZueFtO57va', NULL),
(19, 'delete', 'del@example.com', 8, '$2b$10$kXR4C10cSLXQ3Kp8Nad5mOsvxRFXREjqxl7j.B9A2OB760OtPGthW', NULL),
(22, 'test', 'test@example.com', 2, '$2b$10$FvNsjO4K8iMXMRdmBiGiV.CRgKZ0xjfnmaaf4NjQJgX7UCJBaZlsW', NULL),
(23, 'tes2', 'test2@example.com', 2, '$2b$10$ypn2CNLRLCr00oi2iCJD6OWkxmynivThXE7K71S/2mya51uIeBHtK', NULL),
(28, 'supervisor', 'suppp@example.com', 3, '$2b$10$onMwNaIHc9p/BQ/.7YBlReowAuWangTFAEhex/p2pjD8Kz9FuXTF6', NULL),
(29, 'test', 'supervisor@example.com', 3, '$2b$10$cIb1CqTCpU/MyEJSLa6HceXDB0uwDo2mpFJ.TjNNqyV97h3VOTgtO', NULL);

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
(2, 6);
(8, 3);

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
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
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
-- Indexes for table `functions`
--
ALTER TABLE `functions`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `supervisor_supervisee`
--
ALTER TABLE `supervisor_supervisee`
  ADD PRIMARY KEY (`SupervisorID`,`SuperviseeID`),
  ADD KEY `SuperviseeID` (`SuperviseeID`);

--
-- Indexes for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `trainee_id` (`trainee_id`,`material_id`),
  ADD KEY `material_id` (`material_id`);

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
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `eduactconferences`
--
ALTER TABLE `eduactconferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `elearning_materials`
--
ALTER TABLE `elearning_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `functions`
--
ALTER TABLE `functions`
  MODIFY `Id` int(9) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

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
ALTER TABLE `eduactconferences`
  ADD CONSTRAINT `eduactconferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;
-- Constraints for table `eduactcourses`
--
ALTER TABLE `eduactcourses`
  ADD CONSTRAINT `eduactcourses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;
-- Constraints for table `accomplishments`

ALTER TABLE `accomplishments`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;
--
-- Constraints for table `eduactworkshops`
--
ALTER TABLE `eduactworkshops`
  ADD CONSTRAINT `eduactworkshops_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;
--
-- Constraints for table `supervisor_supervisee`
--

ALTER TABLE `supervisor_supervisee`
  ADD CONSTRAINT `supervisor_supervisee_ibfk_1` FOREIGN KEY (`SuperviseeID`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `supervisor_supervisee_ibfk_2` FOREIGN KEY (`SupervisorID`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `trainee_elearning_material_progress`
--
ALTER TABLE `trainee_elearning_material_progress`
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_1` FOREIGN KEY (`trainee_id`) REFERENCES `users` (`User_ID`),
  ADD CONSTRAINT `trainee_elearning_material_progress_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `elearning_materials` (`id`);

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
COMMIT;

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

ALTER TABLE `surgical_experiences`
  ADD PRIMARY KEY (`Experience_ID`),
  ADD KEY `User_ID` (`User_ID`);

ALTER TABLE `surgical_experiences`
  MODIFY `Experience_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `surgical_experiences`
  ADD CONSTRAINT `surgical_experiences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;
COMMIT;

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

--
-- Indexes for table `research`
--
ALTER TABLE `research`
  ADD PRIMARY KEY (`Research_ID`);

--
-- AUTO_INCREMENT for table `research`
--
ALTER TABLE `research`
  MODIFY `Research_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
