const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');
const upload = require("../middleware/multerConfig"); // Reference multerConfig.js

const sanitize = (value) => value === undefined ? null : value;
// Save Draft as Submit (Update or Create, but set sent=0 and completed=0)
const saveDraftAsSubmit = async (req, res) => {
    try {
        const {
            fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions
        } = req.body;

        // Check if the form with the same fellow_id exists
        const [existingRows] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE fellow_id = ?",
            [fellow_id]
        );

        const instructor_signature = req.file ? req.file.path.replace(/\\/g, '/') : null;

        if (existingRows.length > 0) {
            // If form exists, update it with sent=0 and completed=0
            const existing = existingRows[0];

            const [result] = await pool.execute(
                `UPDATE fellow_resident_evaluation
                 SET
                    fellow_name = ?, fellow_id = ?, hospital = ?, date_of_rotation = ?, instructor_name = ?,
                    punctuality = ?, dependable = ?, respectful = ?, positive_interaction = ?, self_learning = ?,
                    communication = ?, history_taking = ?, physical_examination = ?, clinical_reasoning = ?,
                    application_knowledge = ?, overall_marks = ?, strengths = ?, suggestions = ?,
                    instructor_signature = ?, sent = 0, completed = 0
                 WHERE fellow_id = ?`,
                [
                    sanitize(fellow_name), sanitize(fellow_id), sanitize(hospital), sanitize(date_of_rotation), sanitize(instructor_name),
                    sanitize(punctuality), sanitize(dependable), sanitize(respectful), sanitize(positive_interaction), sanitize(self_learning),
                    sanitize(communication), sanitize(history_taking), sanitize(physical_examination), sanitize(clinical_reasoning),
                    sanitize(application_knowledge), sanitize(overall_marks), sanitize(strengths), sanitize(suggestions),
                    sanitize(instructor_signature), fellow_id
                ]
            );

            res.status(200).json({ message: "Draft updated successfully", result });
        } else {
            // If form doesn't exist, create a new one with sent=0 and completed=0
            const [insertResult] = await pool.execute(
                `INSERT INTO fellow_resident_evaluation (
                    fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                    punctuality, dependable, respectful, positive_interaction, self_learning,
                    communication, history_taking, physical_examination, clinical_reasoning,
                    application_knowledge, overall_marks, strengths, suggestions,
                    instructor_signature, sent, completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
                [
                    sanitize(fellow_name), sanitize(fellow_id), sanitize(hospital), sanitize(date_of_rotation), sanitize(instructor_name),
                    sanitize(punctuality), sanitize(dependable), sanitize(respectful), sanitize(positive_interaction), sanitize(self_learning),
                    sanitize(communication), sanitize(history_taking), sanitize(physical_examination), sanitize(clinical_reasoning),
                    sanitize(application_knowledge), sanitize(overall_marks), sanitize(strengths), sanitize(suggestions),
                    sanitize(instructor_signature)
                ]
            );

            const newId = insertResult.insertId;
            res.status(201).json({ message: "New draft created successfully", id: newId });
        }

    } catch (err) {
        console.error("Error in saving draft or submitting:", err);
        res.status(500).json({ error: "Error in saving draft or submitting form" });
    }
};

// 2️⃣ Update Form (only instructors can update)
const updateForm = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch existing record
        const [existingRows] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ message: "Form not found" });
        }

        const existing = existingRows[0];

        // Pull new values from req.body or use existing
        const {
            fellow_name = existing.fellow_name,
            fellow_id = existing.fellow_id,
            hospital = existing.hospital,
            date_of_rotation = existing.date_of_rotation,
            instructor_name = existing.instructor_name,
            punctuality = existing.punctuality,
            dependable = existing.dependable,
            respectful = existing.respectful,
            positive_interaction = existing.positive_interaction,
            self_learning = existing.self_learning,
            communication = existing.communication,
            history_taking = existing.history_taking,
            physical_examination = existing.physical_examination,
            clinical_reasoning = existing.clinical_reasoning,
            application_knowledge = existing.application_knowledge,
            overall_marks = existing.overall_marks,
            strengths = existing.strengths,
            suggestions = existing.suggestions,
            sent = existing.sent,
            completed = existing.completed
        } = req.body;

        const instructor_signature = req.file ? req.file.path : existing.instructor_signature;

        const [result] = await pool.execute(
            `UPDATE fellow_resident_evaluation
             SET
                fellow_name = ?, fellow_id = ?, hospital = ?, date_of_rotation = ?, instructor_name = ?,
                punctuality = ?, dependable = ?, respectful = ?, positive_interaction = ?, self_learning = ?,
                communication = ?, history_taking = ?, physical_examination = ?, clinical_reasoning = ?,
                application_knowledge = ?, overall_marks = ?, strengths = ?, suggestions = ?,
                instructor_signature = ?, sent = ?, completed = ?
             WHERE id = ?`,
            [
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructor_signature, sent, completed,
                id
            ]
        );

        res.status(200).json({ message: 'Form updated successfully', result });
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ message: 'Failed to update form', error });
    }
};

// 3️⃣ Submit Form (update or create and set sent & completed to 1)
const submitForm = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const {
            fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions
        } = req.body;
        const instructor_signature = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const [existingRows] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (existingRows.length > 0) {
            await pool.execute(
                `UPDATE fellow_resident_evaluation 
                 SET sent = 1, completed = 1 
                 WHERE id = ?`,
                [id]
            );

            await form_helper.sendFormToTrainee(userId, "fellow_resident_evaluation", id);
            return res.status(200).json({ message: "Form submitted successfully" });

        } else {
            const [insertResult] = await pool.execute(
                `INSERT INTO fellow_resident_evaluation (
                    fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                    punctuality, dependable, respectful, positive_interaction, self_learning,
                    communication, history_taking, physical_examination, clinical_reasoning,
                    application_knowledge, overall_marks, strengths, suggestions,
                    instructor_signature, sent, completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
                [
                    sanitize(fellow_name), sanitize(fellow_id), sanitize(hospital), sanitize(date_of_rotation), sanitize(instructor_name),
                    sanitize(punctuality), sanitize(dependable), sanitize(respectful), sanitize(positive_interaction), sanitize(self_learning),
                    sanitize(communication), sanitize(history_taking), sanitize(physical_examination), sanitize(clinical_reasoning),
                    sanitize(application_knowledge), sanitize(overall_marks), sanitize(strengths), sanitize(suggestions),
                    sanitize(instructor_signature)
                  ]                  
            );

            const newId = insertResult.insertId;
            await form_helper.sendFormToTrainee(userId, "fellow_resident_evaluation", newId);

            return res.status(201).json({ message: "Form created and submitted successfully", id: newId });
        }

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while submitting form" });
    }
};

// 4️⃣ Get Form by ID
const getTupleById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            `SELECT 
                fre.*, u.Name AS resident_name
            FROM fellow_resident_evaluation fre
            JOIN users u ON fre.fellow_id = u.User_ID
            WHERE fre.id = ?`,
            [id] // ← this was missing
        );
        

        if (result.length === 0) {
            return res.status(404).json({ error: "Tuple not found" });
        }

        res.status(200).json(result[0]);

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching tuple" });
    }
};

// 5️⃣ Delete Form by ID 
const deleteTupleById = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Tuple not found" });
        }

        await pool.execute("DELETE FROM fellow_resident_evaluation WHERE id = ?", [id]);
        res.status(200).json({ message: "Form deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting tuple" });
    }
};


module.exports = {
    saveDraftAsSubmit,
    updateForm,
    submitForm,
    getTupleById,
    deleteTupleById
};
