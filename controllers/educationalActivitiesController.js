const db = require("../config/db");
//Ensure date is in the format mm/dd/yyyy
const isValidDate = (date) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/; // Matches mm/dd/yyyy
    return regex.test(date);
  };
  const formatDateToDatabaseFormat = (date) => {
    if (!isValidDate(date)) {
      throw new Error("Invalid date format. Expected mm/dd/yyyy.");
    }
    const [month, day, year] = date.split('/');
    return `${year}-${month}-${day}`;
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
      const user_id = req.userId; // Assuming user is authenticated
  
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
      const user_id = req.userId; // Assuming user is authenticated
  
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
//Add Conference
const addConference = async (req, res) => {
    try {
        const { title, date, host, description } = req.body;
        const certificate = req.file ? req.file.filename : null;
        const user_id = req.userId; // Assuming user is authenticated

        if (!req.body.title || !req.body.date || !req.body.host || !req.body.description) {
            return res.status(400).json({ message: "All fields are required." });
        }
        
        await db.query(
            "INSERT INTO eduactconferences (User_ID, title, date, host, description, certificate) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, title, date, host, description, certificate]
        );
        
        res.status(201).json({ message: "Conference added successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    addCourse,
    updateCourse,
    deleteCourse,
    addConference
  };
