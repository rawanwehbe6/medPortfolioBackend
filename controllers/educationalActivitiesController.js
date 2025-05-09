const db = require("../config/db");
const fs = require('fs');
const path = require('path');
const moment = require("moment");

//Add Course
const addCourse = async (req, res) => {
  try {
    const { title, date, institution, description } = req.body;
    const user_id = req.user.userId; 

    if (!title || !date || !institution || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    let certificate = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
          let filename = req.file.filename;

          if (!filename.endsWith(ext)) {
            filename = `${filename}${ext}`;
          }

          certificate = `uploads/${filename}`;

          fs.renameSync(
            path.join(__dirname, '..', 'uploads', req.file.filename),
            path.join(__dirname, '..', certificate)
          );
    }

    await db.query(
      "INSERT INTO eduactcourses (user_id, title, date, institution, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, title, date, institution, description, certificate]
    );

    const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

    res.status(201).json({ message: "Course added successfully." , certificate_url: fullUrl});
  } catch (error) {
    console.error("Error in addCourse:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//Update Course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, institution, description } = req.body;
    const user_id = req.user.userId; 

    if (!title || !date || !institution || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if course exists and belongs to user
    const [course] = await db.query(
      "SELECT * FROM eduactcourses WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    if (course.length === 0) {
      return res.status(404).json({ message: "Course not found or unauthorized." });
    }

    let certificate = course[0].certificate; // Use existing file by default
    if (req.file) {
      // Delete the old file if a new one is uploaded
      const oldFilePath = path.join(__dirname, '..', 'uploads', course[0].certificate);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const ext = path.extname(req.file.originalname);
      let filename = req.file.filename;

      if (!filename.endsWith(ext)) {
        filename = `${filename}${ext}`;
      }

      certificate = `uploads/${filename}`;

      fs.renameSync(
        path.join(__dirname, '..', 'uploads', req.file.filename),
        path.join(__dirname, '..', certificate)
      );
      
    }
    

    await db.query(
      "UPDATE eduactcourses SET title = ?, date = ?, institution = ?, description = ?, certificate = ? WHERE id = ? AND user_id = ?",
      [title, date, institution, description, certificate, id, user_id]
    );
    const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

    res.status(200).json({ message: "Course updated successfully." });
  } catch (error) {
    console.error("Error in updateCourse:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id) {
      return res.status(400).json({ message: "Missing required fields: userId or id" });
    }

    // Check if the course exists
    const [existingCourses] = await db.query(
      "SELECT * FROM eduactcourses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingCourses.length === 0) {
      return res.status(404).json({ message: "Course not found or unauthorized." });
    }

    // Delete the certificate file if it exists
    const certificatePath = existingCourses[0].certificate;
    const fileToDelete = path.join(__dirname, '..', certificatePath);

    if (certificatePath && fs.existsSync(fileToDelete)) {
      fs.unlinkSync(fileToDelete);
    }

    // Delete the course record from DB
    await db.query("DELETE FROM eduactcourses WHERE id = ? AND user_id = ?", [id, userId]);

    res.status(200).json({ message: "Course deleted successfully." });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Server error while deleting course." });
  }
};

// Add Workshop
const addWorkshop = async (req, res) => {
  try {
    const { title, date, organizer, description } = req.body;
    //const certificate = req.file ? req.file.filename : null;
    const user_id = req.user.userId;

    // Validate required fields
    if (!title || !date || !organizer || !description) {
      return res.status(400).json({ 
        message: "All fields (title, date, organizer, description) are required." 
      });
    }

    let certificate = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname);
          let filename = req.file.filename;

          if (!filename.endsWith(ext)) {
            filename = `${filename}${ext}`;
          }

          certificate = `uploads/${filename}`;

          fs.renameSync(
            path.join(__dirname, '..', 'uploads', req.file.filename),
            path.join(__dirname, '..', certificate)
          );
    }

    // Insert workshop into database
    await db.query(
      `INSERT INTO eduactworkshops 
       (user_id, title, date, organizer, description, certificate) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, title, date, organizer, description, certificate]
    );
   
    const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

    res.status(201).json({ 
      message: "Workshop added successfully."
    });
  } catch (error) {
    console.error("Error in addWorkshop:", error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: "A workshop with similar details already exists." 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to add workshop. Please try again later." 
    });
  }
};

// Update Workshop
const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, organizer, description } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id || !title || !date || !organizer || !description) {
      return res.status(400).json({ message: "Missing required fields: userId, id, title, date, organizer, or description." });
    }

    // Check if the workshop exists
    const [existing] = await db.query(
      "SELECT certificate FROM eduactworkshops WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Workshop not found or unauthorized." });
    }

    let certificate = existing[0].certificate;

    // Handle new certificate upload
    if (req.file) {
      // Delete old file if exists
      const oldFilePath = path.join(__dirname, '..', certificate);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Rename new file with extension
      const ext = path.extname(req.file.originalname);
      let filename = req.file.filename;
      if (!filename.endsWith(ext)) {
        filename += ext;
      }

      certificate = `uploads/${filename}`;

      fs.renameSync(
        path.join(__dirname, '..', 'uploads', req.file.filename),
        path.join(__dirname, '..', certificate)
      );
    }

    await db.query(
      "UPDATE eduactworkshops SET title = ?, date = ?, organizer = ?, description = ?, certificate = ? WHERE id = ? AND user_id = ?",
      [title, date, organizer, description, certificate, id, userId]
    );

    const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

    res.status(200).json({ message: "Workshop updated successfully.", certificate_url: fullUrl });

  } catch (error) {
    console.error("Update Workshop Error:", error);
    res.status(500).json({ message: "Server error during workshop update." });
  }
};

// Delete Workshop
const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id) {
      return res.status(400).json({ message: "Missing required fields: userId or id" });
    }

    // Check if the workshop exists
    const [existingWorkshops] = await db.query(
      "SELECT * FROM eduactworkshops WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existingWorkshops.length === 0) {
      return res.status(404).json({ message: "Workshop not found or unauthorized." });
    }

    // Delete the certificate file if it exists
    const certificatePath = existingWorkshops[0].certificate;
    const fileToDelete = path.join(__dirname, '..', certificatePath);

    if (certificatePath && fs.existsSync(fileToDelete)) {
      fs.unlinkSync(fileToDelete);
    }

    // Delete the workshop record from DB
    await db.query("DELETE FROM eduactworkshops WHERE id = ? AND user_id = ?", [id, userId]);

    res.status(200).json({ message: "Workshop deleted successfully." });
  } catch (error) {
    console.error("Delete Workshop Error:", error);
    res.status(500).json({ message: "Server error during workshop deletion." });
  }
};


//Add Conference
const addConference = async (req, res) => {
    try {
        const { title, date, host, description } = req.body;
       // const certificate = req.file ? req.file.filename : null;
        const user_id = req.user.userId; // Assuming user is authenticated

        if (!req.body.title || !req.body.date || !req.body.host || !req.body.description) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        let certificate = null;

        if (req.file) {
          const ext = path.extname(req.file.originalname);
          let filename = req.file.filename;

          if (!filename.endsWith(ext)) {
            filename = `${filename}${ext}`;
          }

          certificate = `uploads/${filename}`;

          fs.renameSync(
            path.join(__dirname, '..', 'uploads', req.file.filename),
            path.join(__dirname, '..', certificate)
          );
        }

            await db.query(
            "INSERT INTO eduactconferences (User_ID, title, date, host, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, title, date, host, description, certificate]
        );
        
        const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

        res.status(201).json({ message: "Conference added successfully.", certificate_url: fullUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

const updateConference = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, host, description } = req.body;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id || !title || !date || !host || !description) {
      return res.status(400).json({ message: "Missing required fields: userId, id, title, date, host, or description." });
    }

    // Check if the conference exists
    const [existing] = await db.query(
      "SELECT certificate FROM eduactconferences WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Conference not found or unauthorized." });
    }

    let certificate = existing[0].certificate;

    if (req.file) {
      // Delete old certificate file
      const oldFilePath = path.join(__dirname, '..', certificate);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Rename and assign new certificate
      const ext = path.extname(req.file.originalname);
      let filename = req.file.filename;
      if (!filename.endsWith(ext)) {
        filename += ext;
      }

      certificate = `uploads/${filename}`;

      fs.renameSync(
        path.join(__dirname, '..', 'uploads', req.file.filename),
        path.join(__dirname, '..', certificate)
      );
    }

    await db.query(
      "UPDATE eduactconferences SET title = ?, date = ?, host = ?, description = ?, certificate = ? WHERE id = ? AND User_ID = ?",
      [title, date, host, description, certificate, id, userId]
    );

    const fullUrl = certificate ? `${req.protocol}://${req.get('host')}/${certificate}` : null;

    res.status(200).json({ message: "Conference updated successfully.", certificate_url: fullUrl });
  } catch (error) {
    console.error("Update Conference Error:", error);
    res.status(500).json({ message: "Server error during conference update." });
  }
};

const deleteConference = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : null;

    if (!userId || !id) {
      return res.status(400).json({ message: "Missing required fields: userId or id" });
    }

    // Get the conference
    const [existingConferences] = await db.query(
      "SELECT * FROM eduactconferences WHERE id = ? AND User_ID = ?",
      [id, userId]
    );

    if (existingConferences.length === 0) {
      return res.status(404).json({ message: "Conference not found or unauthorized." });
    }

    // Delete certificate file if exists
    const certificatePath = existingConferences[0].certificate;
    if (certificatePath) {
      const fileToDelete = path.join(__dirname, '..', certificatePath);
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
      }
    }

    // Delete the DB row
    await db.query("DELETE FROM eduactconferences WHERE id = ? AND User_ID = ?", [id, userId]);

    res.status(200).json({ message: "Conference deleted successfully." });

  } catch (error) {
    console.error("Delete Conference Error:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// Get All Courses for Logged-in User
const getCourses = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const [courses] = await db.query(`
      SELECT 
        id, title, 
        DATE_FORMAT(date, '%m/%d/%Y') AS date, 
        institution, description, certificate
      FROM eduactcourses
      WHERE user_id = ?
      ORDER BY date DESC
    `, [userId]);

    const coursesWithUrl = courses.map(course => ({
      ...course,
      certificate_url: course.certificate 
        ? `${req.protocol}://${req.get('host')}/${course.certificate}` 
        : null
    }));

    res.status(200).json({ courses: coursesWithUrl });
  } catch (error) {
    console.error("Error in getCourses:", error);
    res.status(500).json({ message: "Error fetching courses." });
  }
};


// Get All Workshops for Logged-in User
const getWorkshops = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const [workshops] = await db.query(
      `SELECT 
         id, title, 
         DATE_FORMAT(date, '%m/%d/%Y') AS date, 
         organizer, description, certificate 
       FROM eduactworkshops 
       WHERE user_id = ? 
       ORDER BY date DESC`,
      [userId]
    );

    if (workshops.length === 0) {
      return res.status(200).json({ workshops:[] });
    }

    const workshopsWithUrl = workshops.map(workshop => ({
      ...workshop,
      certificate_url: `${req.protocol}://${req.get('host')}/${workshop.certificate}`
    }));

    res.status(200).json({ workshops: workshopsWithUrl });
  } catch (error) {
    console.error("Get Workshops Error:", error);
    res.status(500).json({ message: "Error fetching workshops." });
  }
};


// Get All Conferences for Logged-in Trainee
const getConferences = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;

    if (!userId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    const [conferences] = await db.query(`
      SELECT 
        id, title, 
        DATE_FORMAT(date, '%m/%d/%Y') AS date, 
        host, description, certificate
      FROM eduactconferences
      WHERE User_ID = ?
    `, [userId]);

    const conferencesWithUrl = conferences.map(conference => ({
      ...conference,
      certificate_url: `${req.protocol}://${req.get('host')}/${conference.certificate}`
    }));

    res.status(200).json({ conferences: conferencesWithUrl });
  } catch (error) {
    console.error("Error in getConferences:", error);
    res.status(500).json({ message: "Error fetching conferences." });
  }
};


module.exports = {
    addCourse,
    updateCourse,
    deleteCourse,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
    addConference,
    updateConference,
    deleteConference,
    getCourses,
    getWorkshops,
    getConferences
  };
