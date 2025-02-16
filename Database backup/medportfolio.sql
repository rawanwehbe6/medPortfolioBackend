-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 16, 2025 at 09:17 PM
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
-- Table structure for table `clinicalsupervisor`
--

CREATE TABLE `clinicalsupervisor` (
  `Supervisor_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `Specialty` varchar(100) DEFAULT NULL,
  `ClinicalExperience` int(11) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clinical_institutions`
--

CREATE TABLE `clinical_institutions` (
  `Institution_ID` int(11) NOT NULL,
  `LicenseNumber` varchar(100) NOT NULL,
  `InstitutionName` varchar(255) NOT NULL,
  `InstitutionType` varchar(255) NOT NULL,
  `Location` varchar(255) NOT NULL,
  `ContactNumber` varchar(50) DEFAULT NULL,
  `Website` varchar(255) DEFAULT NULL,
  `AffiliatedTrainees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`AffiliatedTrainees`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `educational_supervisor`
--

CREATE TABLE `educational_supervisor` (
  `Supervisor_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `AcademicTitle` varchar(100) DEFAULT NULL,
  `FieldOfExpertise` varchar(100) DEFAULT NULL,
  `TeachingExperience` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `Supervisor_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `AssignedTrainees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`AssignedTrainees`)),
  `ProfilePicture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trainee`
--

CREATE TABLE `trainee` (
  `Trainee_ID` int(11) NOT NULL,
  `User_ID` int(11) NOT NULL,
  `Skills` text DEFAULT NULL,
  `Projects` text DEFAULT NULL,
  `Certificates` text DEFAULT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Researcher` tinyint(1) DEFAULT 0,
  `RegistrationDate` date DEFAULT NULL,
  `PhoneNumber` varchar(15) DEFAULT NULL,
  `Specialty` varchar(100) DEFAULT NULL,
  `ProfilePicture` varchar(255) DEFAULT NULL,
  `Supervisor_ID` int(11) DEFAULT NULL,
  `FoundationYear` int(11) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `User_ID` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Role` enum('admin','trainee','supervisor') NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Bau_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`User_ID`, `Name`, `Email`, `Role`, `Password`, `Bau_ID`) VALUES
(1, 'Admin User', 'admin', 'admin', '$2b$10$DfWFKh2rvumR4bWkLuBvUuu0yTh1ConhRT6BRnFnQsbvhSMg8O7aC', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bau`
--
ALTER TABLE `bau`
  ADD PRIMARY KEY (`Bau_ID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `clinicalsupervisor`
--
ALTER TABLE `clinicalsupervisor`
  ADD PRIMARY KEY (`Supervisor_ID`),
  ADD KEY `User_ID` (`User_ID`);

--
-- Indexes for table `clinical_institutions`
--
ALTER TABLE `clinical_institutions`
  ADD PRIMARY KEY (`Institution_ID`);

--
-- Indexes for table `educational_supervisor`
--
ALTER TABLE `educational_supervisor`
  ADD PRIMARY KEY (`Supervisor_ID`),
  ADD KEY `User_ID` (`User_ID`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`Supervisor_ID`),
  ADD UNIQUE KEY `User_ID` (`User_ID`);

--
-- Indexes for table `trainee`
--
ALTER TABLE `trainee`
  ADD PRIMARY KEY (`Trainee_ID`),
  ADD UNIQUE KEY `User_ID` (`User_ID`),
  ADD KEY `Supervisor_ID` (`Supervisor_ID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`User_ID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `Bau_ID` (`Bau_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bau`
--
ALTER TABLE `bau`
  MODIFY `Bau_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clinicalsupervisor`
--
ALTER TABLE `clinicalsupervisor`
  MODIFY `Supervisor_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clinical_institutions`
--
ALTER TABLE `clinical_institutions`
  MODIFY `Institution_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `educational_supervisor`
--
ALTER TABLE `educational_supervisor`
  MODIFY `Supervisor_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `Supervisor_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainee`
--
ALTER TABLE `trainee`
  MODIFY `Trainee_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `User_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clinicalsupervisor`
--
ALTER TABLE `clinicalsupervisor`
  ADD CONSTRAINT `clinicalsupervisor_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `educational_supervisor`
--
ALTER TABLE `educational_supervisor`
  ADD CONSTRAINT `educational_supervisor_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`);

--
-- Constraints for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD CONSTRAINT `supervisors_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE;

--
-- Constraints for table `trainee`
--
ALTER TABLE `trainee`
  ADD CONSTRAINT `trainee_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `trainee_ibfk_2` FOREIGN KEY (`Supervisor_ID`) REFERENCES `supervisors` (`Supervisor_ID`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`Bau_ID`) REFERENCES `bau` (`Bau_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
