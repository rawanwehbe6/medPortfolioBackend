const mysql = require('mysql2');
require('dotenv').config({ path: './Database.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,       // localhost
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASSWORD, // root
  database: process.env.DB_NAME,   // medportfolio
  port: process.env.DB_PORT,       // 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createTables() {
  try {
    const connection = await pool.promise().getConnection();
    console.log('Connected to MySQL database');

    const createBAUTableQuery = `
      CREATE TABLE IF NOT EXISTS BAU (
        Bau_ID INT NOT NULL AUTO_INCREMENT,
        FullName VARCHAR(255) NOT NULL,
        Email VARCHAR(100) UNIQUE NOT NULL,
        Location VARCHAR(255) NOT NULL,
        ContactNumber VARCHAR(50) NOT NULL,
        Campus VARCHAR(255) NOT NULL,
        NbOfTrainees INT NOT NULL,
        Logo VARCHAR(255) NOT NULL,
        AffiliatedInstitutions JSON,
        AdministrationContact VARCHAR(255) NOT NULL,
        PRIMARY KEY (Bau_ID)
      );
    `;
    await connection.query(createBAUTableQuery);

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS USERS (
        User_ID INT NOT NULL AUTO_INCREMENT,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(100) UNIQUE NOT NULL,
        Role ENUM('admin', 'trainee', 'supervisor') NOT NULL,
        Password VARCHAR(15) NOT NULL,
        Bau_ID INT,
        PRIMARY KEY (User_ID),
        FOREIGN KEY (Bau_ID) REFERENCES BAU(Bau_ID)
      );
    `;
    await connection.query(createUsersTableQuery);

    const createSupervisorsTableQuery = `
      CREATE TABLE IF NOT EXISTS SUPERVISORS (
        Supervisor_ID INT NOT NULL AUTO_INCREMENT,
        User_ID INT UNIQUE NOT NULL,
        AssignedTrainees JSON,
        ProfilePicture VARCHAR(255),
        FOREIGN KEY (User_ID) REFERENCES USERS (User_ID) ON DELETE CASCADE,
        PRIMARY KEY(Supervisor_ID)
      ) AUTO_INCREMENT = 2026001;
    `;
    await connection.query(createSupervisorsTableQuery);

    const createEducationalSupervisorTableQuery = `
      CREATE TABLE IF NOT EXISTS EDUCATIONAL_SUPERVISOR (
        Supervisor_ID INT NOT NULL AUTO_INCREMENT,
        User_ID INT NOT NULL,  
        AcademicTitle VARCHAR(100),
        FieldOfExpertise VARCHAR(100),
        TeachingExperience INT,
        PRIMARY KEY (Supervisor_ID),
        FOREIGN KEY (User_ID) REFERENCES USERS(User_ID)
      );
    `;
    await connection.query(createEducationalSupervisorTableQuery);

    const createClinicalSupervisorTableQuery = `
      CREATE TABLE IF NOT EXISTS CLINICALSUPERVISOR (
        Supervisor_ID INT NOT NULL AUTO_INCREMENT,
        User_ID INT NOT NULL,  
        Specialty VARCHAR(100),
        ClinicalExperience INT,
        Department VARCHAR(100),
        PRIMARY KEY (Supervisor_ID),
        FOREIGN KEY (User_ID) REFERENCES USERS (User_ID)
      );
    `;
    await connection.query(createClinicalSupervisorTableQuery);

    const createTraineeTableQuery = `
      CREATE TABLE IF NOT EXISTS TRAINEE (
        Trainee_ID INT NOT NULL AUTO_INCREMENT,
        User_ID INT UNIQUE NOT NULL,
        Skills TEXT,
        Projects TEXT,
        Certificates TEXT,
        DateOfBirth DATE,
        Researcher BOOLEAN DEFAULT FALSE,
        RegistrationDate DATE,
        PhoneNumber VARCHAR(15),
        Specialty VARCHAR(100),
        ProfilePicture VARCHAR(255),
        Supervisor_ID INT,
        FoundationYear INT,
        Department VARCHAR(100),
        PRIMARY KEY (Trainee_ID),
        FOREIGN KEY (User_ID) REFERENCES USERS (User_ID) ON DELETE CASCADE,
        FOREIGN KEY (Supervisor_ID) REFERENCES SUPERVISORS(Supervisor_ID) ON DELETE SET NULL
      ) AUTO_INCREMENT = 202600001;
    `;
    await connection.query(createTraineeTableQuery);

    const createClinicalInstitutionsTableQuery = `
      CREATE TABLE IF NOT EXISTS CLINICAL_INSTITUTIONS (
        Institution_ID INT NOT NULL AUTO_INCREMENT,
        LicenseNumber VARCHAR(100) NOT NULL,
        InstitutionName VARCHAR(255) NOT NULL,
        InstitutionType VARCHAR(255) NOT NULL,
        Location VARCHAR(255) NOT NULL,        
        ContactNumber VARCHAR(50),
        Website VARCHAR(255),
        AffiliatedTrainees JSON,
        PRIMARY KEY (Institution_ID)
      );
    `;
    await connection.query(createClinicalInstitutionsTableQuery);

    console.log("All tables are ready!");

    connection.release(); // Release the connection after query execution
  } catch (err) {
    console.error("Error creating tables:", err);
  }
}

createTables();
module.exports = pool.promise();
