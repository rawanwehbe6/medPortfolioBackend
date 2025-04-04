const db = require("../config/db");

//Ensure date is in the format mm/dd/yyyy
const isValidDate = (date) => {
    const regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // MM/DD/YYYY format
    if (!regex.test(date)) return "Invalid date format. Expected MM/DD/YYYY.";

    const [month, day, year] = date.split('/').map(Number); // Convert to numbers

    if (month < 1 || month > 12) return "Invalid month. Must be between 01 and 12.";
    if (day < 1 || day > 31) return "Invalid day. Must be between 01 and 31.";

    // Check valid days in months
    const daysInMonth = {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    };

    // Leap year check for February
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        daysInMonth[2] = 29; // Leap year February has 29 days
    }

    if (day > daysInMonth[month]) return `Invalid day for the given month. ${month} has a maximum of ${daysInMonth[month]} days.`;

    return null; // Date is valid
};

const formatDateToDatabaseFormat = (date) => {
    const [month, day, year] = date.split('/').map(Number); // Split and convert to numbers
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`; // Format as YYYY-MM-DD
};

//Add Course
const addCourse = async (req, res) => {
  try {
    const { title, date, institution, description } = req.body;
    const certificate = req.file ? req.file.filename : null;
    const user_id = req.userId; // Assuming user is authenticated

    if (!title || !date || !institution || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Convert date from mm/dd/yyyy to yyyy-mm-dd
    let formattedDate;
    try {
      formattedDate = formatDateToDatabaseFormat(date);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    await db.query(
      "INSERT INTO eduactcourses (user_id, title, date, institution, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, title, formattedDate, institution, description, certificate]
    );

    res.status(201).json({ message: "Course added successfully." });
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
      const certificate = req.file ? req.file.filename : null;
      const user_id = req.userId; 
  
      if (!title || !date || !institution || !description) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Convert date from mm/dd/yyyy to yyyy-mm-dd
      const formattedDate = formatDateToDatabaseFormat(date);
  
      await db.query(
        "UPDATE eduactcourses SET title = ?, date = ?, institution = ?, description = ?, certificate = ? WHERE id = ? AND user_id = ?",
        [title, formattedDate, institution, description, certificate, id, user_id]
      );
  
      res.status(200).json({ message: "Course updated successfully." });
    } catch (error) {
      console.error("Error in updateCourse:", error);
      res.status(500).json({ message: "Server error." });
    }
  };

//Delete Course
const deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.userId; 
  
      await db.query(
        "DELETE FROM eduactcourses WHERE id = ? AND user_id = ?",
        [id, user_id]
      );
  
      res.status(200).json({ message: "Course deleted successfully." });
    } catch (error) {
      console.error("Error in deleteCourse:", error);
      res.status(500).json({ message: "Server error." });
    }
  };

  //Add Workshop
const addWorkshop = async (req, res) => {
  try {
    const { title, date, organizer, description } = req.body;
    const certificate = req.file ? req.file.filename : null;
    const user_id = req.userId; 

    if (!title || !date || !organizer || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Convert date from mm/dd/yyyy to yyyy-mm-dd
    let formattedDate;
    try {
      formattedDate = formatDateToDatabaseFormat(date);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    await db.query(
      "INSERT INTO eduactworkshops (user_id, title, date, organizer, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
      [user_id, title, formattedDate, organizer, description, certificate]
    );

    res.status(201).json({ message: "Workshop added successfully." });
  } catch (error) {
    console.error("Error in addWorkshop:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update Workshop
const updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, organizer, description } = req.body;
    const certificate = req.file ? req.file.filename : null;
    const user_id = req.userId; 

    if (!title || !date || !organizer || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Convert date from mm/dd/yyyy to yyyy-mm-dd
    const formattedDate = formatDateToDatabaseFormat(date);

    await db.query(
      "UPDATE eduactworkshops SET title = ?, date = ?, organizer = ?, description = ?, certificate = ? WHERE id = ? AND user_id = ?",
      [title, formattedDate, organizer, description, certificate, id, user_id]
    );

    res.status(200).json({ message: "Workshop updated successfully." });
  } catch (error) {
    console.error("Error in updateWorkshop:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete Workshop
const deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId; 

    await db.query(
      "DELETE FROM eduactworkshops WHERE id = ? AND user_id = ?",
      [id, user_id]
    );

    res.status(200).json({ message: "Workshop deleted successfully." });
  } catch (error) {
    console.error("Error in deleteWorkshop:", error);
    res.status(500).json({ message: "Server error." });
  }
};

//Add Conference
const addConference = async (req, res) => {
    try {
        const { title, date, host, description } = req.body;
        const certificate = req.file ? req.file.filename : null;
        const user_id = req.userId; // Assuming user is authenticated

        if (!req.body.title || !req.body.date || !req.body.host || !req.body.description) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const dateError = isValidDate(date);
        if (dateError) {
            return res.status(400).json({ message: dateError });
        }

         // Validate and format the date
         let formattedDate;
         try {
             formattedDate = formatDateToDatabaseFormat(date);
         } catch (error) {
             return res.status(400).json({ message: error.message });
         }
        
        await db.query(
            "INSERT INTO eduactconferences (User_ID, title, date, host, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, title, formattedDate, host, description, certificate]
        );
        
        res.status(201).json({ message: "Conference added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

const updateConference = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, host, description } = req.body;
        const certificate = req.file ? req.file.filename : null;
        const user_id = req.userId; // Assuming user is authenticated

        if (!title || !date || !host || !description) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        const dateError = isValidDate(date);
        if (dateError) {
            return res.status(400).json({ message: dateError });
        }

        // Validate and format the date
        let formattedDate;
        try {
            formattedDate = formatDateToDatabaseFormat(date);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        await db.query(
            "UPDATE eduactconferences SET title = ?, date = ?, host = ?, description = ?, certificate = ? WHERE id = ? AND User_ID = ?",
            [title, formattedDate, host, description, certificate, id, user_id]
        );

        res.status(200).json({ message: "Conference updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

const deleteConference = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId; // Assuming user is authenticated

        const result = await db.query(
            "DELETE FROM eduactconferences WHERE id = ? AND User_ID = ?",
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Conference not found or unauthorized." });
        }

        res.status(200).json({ message: "Conference deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

// Get All Courses for Logged-in Trainee
const getCourses = async (req, res) => {
  try {
    const user_id = req.userId;
    const [rows] = await db.query("SELECT * FROM eduactcourses WHERE user_id = ?", [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in getCourses:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get All Workshops for Logged-in Trainee
const getWorkshops = async (req, res) => {
  try {
    const user_id = req.userId;
    const [rows] = await db.query("SELECT * FROM eduactworkshops WHERE user_id = ?", [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in getWorkshops:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get All Conferences for Logged-in Trainee
const getConferences = async (req, res) => {
  try {
    const user_id = req.userId;
    const [rows] = await db.query("SELECT * FROM eduactconferences WHERE User_ID = ?", [user_id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error in getConferences:", error);
    res.status(500).json({ message: "Server error." });
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
