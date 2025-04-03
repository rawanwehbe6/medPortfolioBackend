const pool = require('../config/db');

const getTraineePortfolio = async (req, res) => {
  try {
    const { traineeId } = req.params;

    // 1. Get basic trainee info
    const [traineeInfo] = await pool.execute(
      `SELECT User_ID as id, Name as name, Email as email 
       FROM users 
       WHERE User_ID = ? AND Role = 2`, // Role 2 = trainee
      [traineeId]
    );

    if (traineeInfo.length === 0) {
      return res.status(404).json({ message: "Trainee not found" });
    }

    // 2. Get all portfolio data in parallel
    const [
      skills,
      research,
      surgicalExperiences,
      accomplishments,
      courses,
      workshops,
      conferences,
      portfolioImages
    ] = await Promise.all([
      // Skills
      pool.execute(
        `SELECT Skill_ID as id, Skill_Name as name 
         FROM user_skills 
         WHERE User_ID = ?`,
        [traineeId]
      ),
      // Research
      pool.execute(
        `SELECT Research_ID as id, Title, Date, 
                Description, File_Path as filePath
         FROM research 
         WHERE User_ID = ?`,
        [traineeId]
      ),
      // Surgical Experiences
      pool.execute(
        `SELECT Experience_ID as id, Procedure_Name as procedureName, 
                Date, Role, Clinic, 
                Description
         FROM surgical_experiences 
         WHERE User_ID = ?`,
        [traineeId]
      ),
      // Accomplishments
      pool.execute(
        `SELECT id, title, description, 
                file_path as filePath
         FROM accomplishments 
         WHERE User_ID = ?`,
        [traineeId]
      ),
      // Courses
      pool.execute(
        `SELECT id, title, date, institution, description, certificate
         FROM eduactcourses 
         WHERE user_id = ?`,
        [traineeId]
      ),
      // Workshops
      pool.execute(
        `SELECT id, title, date, organizer, description, certificate
         FROM eduactworkshops 
         WHERE user_id = ?`,
        [traineeId]
      ),
      // Conferences
      pool.execute(
        `SELECT id, title, date, host, description, certificate
         FROM eduactconferences 
         WHERE User_ID = ?`,
        [traineeId]
      ),
      // Portfolio Images
      pool.execute(
        `SELECT id, image_path as imagePath
         FROM trainee_portfolio_images 
         WHERE trainee_id = ?`,
        [traineeId]
      )
    ]);

    // 3. Structure the response
    const portfolioData = {
      trainee: traineeInfo[0],
      keyCompetencies: {
        skills: skills[0],
        research: research[0],
        surgicalExperience: surgicalExperiences[0]
      },
      accomplishments: {
        achievements: accomplishments[0],
        portfolioImages: portfolioImages[0]
      },
      educationalActivities: {
        courses: courses[0],
        workshops: workshops[0],
        conferences: conferences[0]
      }
    };

    res.json(portfolioData);
  } catch (err) {
    console.error("Error fetching trainee portfolio:", err);
    res.status(500).json({ 
      message: "Server error while fetching portfolio",
      error: err.message 
    });
  }
};

module.exports = {
  getTraineePortfolio
};