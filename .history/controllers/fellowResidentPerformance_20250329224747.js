const pool = require("../config/db");
const upload = require("../middleware/multerConfig"); // Updated to reference multerConfig.js

const createForm = async (req, res) => {
    try {
        const { role } = req.user;
        const { fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions } = req.body;

        const instructor_signature = req.file ? req.file.filename : null;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await pool.execute(
            `INSERT INTO fellow_resident_evaluation 
            (fellow_name, fellow_id, hospital, date_of_rotation, instructor_name, instructor_signature,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fellow_name, fellow_id, hospital, date_of_rotation, instructor_name, instructor_signature,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions]
        );

        res.status(201).json({ message: "Evaluation form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating form" });
    }
};

const updateForm = async (req, res) => {
    try {
        const { role } = req.user;
        const { id } = req.params;
        const { fellow_name, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning, 
            communication, history_taking, physical_examination, clinical_reasoning, 
            application_knowledge, overall_marks, strengths, suggestions } = req.body;

        const instructor_signature = req.file ? req.file.filename : null;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await pool.execute(
            `UPDATE fellow_resident_evaluation 
            SET fellow_name = ?, instructor_name = ?, instructor_signature = ?, 
                punctuality = ?, dependable = ?, respectful = ?, positive_interaction = ?, 
                self_learning = ?, communication = ?, history_taking = ?, 
                physical_examination = ?, clinical_reasoning = ?, application_knowledge = ?, 
                overall_marks = ?, strengths = ?, suggestions = ? 
            WHERE id = ?`,
            [fellow_name, instructor_name, instructor_signature,
            punctuality, dependable, respectful, positive_interaction, self_learning, 
            communication, history_taking, physical_examination, clinical_reasoning, 
            application_knowledge, overall_marks, strengths, suggestions, id]
        );

        res.status(200).json({ message: "Evaluation form updated successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating form" });
    }
};

const getTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            `SELECT * FROM fellow_resident_evaluation WHERE id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Evaluation record not found" });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching evaluation" });
    }
};

const deleteTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Evaluation record not found" });
        }

        await pool.execute("DELETE FROM fellow_resident_evaluation WHERE id = ?", [id]);
        res.status(200).json({ message: "Evaluation record deleted successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting evaluation" });
    }
};

