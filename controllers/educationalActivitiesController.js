const db = require("../config/db");

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

module.exports = { addConference };
