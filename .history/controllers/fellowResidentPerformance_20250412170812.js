const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');

// 1️⃣ Save as Draft (create with sent=0 and completed=0)
const saveAsDraft = async (req, res) => {
    try {
        const { role, userId } = req.user;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const {
            fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions
        } = req.body;

        const instructor_signature = req.files?.signature ? req.files.signature[0].path : null;

        const [result] = await pool.execute(
            `INSERT INTO fellow_resident_evaluation (
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructor_signature, sent, completed
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
            [
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructor_signature, userId
            ]
        );

        res.status(201).json({ message: "Draft saved", id: result.insertId });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while saving draft" });
    }
};

// 2️⃣ Update Form (only instructors can update)
const updateForm = async (req, res) => {
    try {
        const { role } = req.user;
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

        const [existingRows] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        const existingRecord = existingRows[0];
        const instructorSignature = req.files?.signature ? req.files.signature[0].path : existingRecord.instructor_signature;

        await pool.execute(
            `UPDATE fellow_resident_evaluation 
             SET fellow_name = ?, fellow_id = ?, hospital = ?, date_of_rotation = ?, instructor_name = ?,
                 punctuality = ?, dependable = ?, respectful = ?, positive_interaction = ?, self_learning = ?,
                 communication = ?, history_taking = ?, physical_examination = ?, clinical_reasoning = ?,
                 application_knowledge = ?, overall_marks = ?, strengths = ?, suggestions = ?,
                 instructor_signature = ?
             WHERE id = ?`,
            [
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructorSignature, id
            ]
        );

        res.status(200).json({ message: "Form updated successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating form" });
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
        const instructor_signature = req.file ? req.file.path : null;

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
                    fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                    punctuality, dependable, respectful, positive_interaction, self_learning,
                    communication, history_taking, physical_examination, clinical_reasoning,
                    application_knowledge, overall_marks, strengths, suggestions,
                    instructor_signature, userId
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
                fre.*, u.Name AS resident_name, u_i.Name AS instructor_user_name
             FROM fellow_resident_evaluation fre
             JOIN users u ON fre.fellow_id = u.User_ID
             JOIN users u_i ON fre.instructor_id = u_i.User_ID
             WHERE fre.id = ?`,
            [id]
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

// 5️⃣ Delete Form by ID (only instructor who created it or admin)
const deleteTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const [result] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Tuple not found" });
        }

        const record = result[0];

        if (record.instructor_id !== userId && userId !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the assigned instructor or admin can delete this record" });
        }

        await pool.execute("DELETE FROM fellow_resident_evaluation WHERE id = ?", [id]);
        res.status(200).json({ message: "Form deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting tuple" });
    }
};

module.exports = {
    saveAsDraft,
    updateForm,
    submitForm,
    getTupleById,
    deleteTupleById
};
