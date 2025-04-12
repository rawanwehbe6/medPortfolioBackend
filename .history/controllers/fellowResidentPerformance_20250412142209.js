const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');

// CREATE
const createForm = async (req, res) => {
    try {
        const { role } = req.user;
        const instructor_id = req.user.userId;

        const {
            fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions,
            draft_send
        } = req.body;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const instructor_signature = req.files?.signature ? req.files.signature[0].path : null;

        const [insertResult] = await pool.execute(
            `INSERT INTO fellow_resident_evaluation (
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructor_signature, sent, instructor_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructor_signature, draft_send, instructor_id
            ]
        );

        const formId = insertResult.insertId;

        if (Number(draft_send) === 1) {
            await form_helper.sendFormToTrainee(instructor_id, "fellow_resident_evaluation", formId);
        }

        res.status(201).json({ message: "Form created successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating form" });
    }
};

// UPDATE
const updateForm = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        const {
            fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
            punctuality, dependable, respectful, positive_interaction, self_learning,
            communication, history_taking, physical_examination, clinical_reasoning,
            application_knowledge, overall_marks, strengths, suggestions,
            resident_comment, draft_send
        } = req.body;

        const [existingRows] = await pool.execute(
            "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
            [id]
        );

        if (existingRows.length === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        const existingRecord = existingRows[0];
        let updateQuery = "";
        let updateValues = [];

        if (role === 2) { // Resident
            const residentSignature = req.files?.signature ? req.files.signature[0].path : existingRecord.resident_signature;

            updateQuery = `UPDATE fellow_resident_evaluation 
                           SET resident_comment = ?, resident_signature = ?, completed = ?
                           WHERE id = ?`;
            updateValues = [resident_comment, residentSignature, 1, id];

            if (!existingRecord.resident_signature) {
                await form_helper.sendSignatureToSupervisor(userId, "fellow_resident_evaluation", id);
            }

        } else if ([1, 3, 4, 5].includes(role)) { // Instructor
            const instructorSignature = req.files?.signature ? req.files.signature[0].path : existingRecord.instructor_signature;

            updateQuery = `UPDATE fellow_resident_evaluation 
                           SET fellow_name = ?, fellow_id = ?, hospital = ?, date_of_rotation = ?, instructor_name = ?,
                               punctuality = ?, dependable = ?, respectful = ?, positive_interaction = ?, self_learning = ?,
                               communication = ?, history_taking = ?, physical_examination = ?, clinical_reasoning = ?,
                               application_knowledge = ?, overall_marks = ?, strengths = ?, suggestions = ?,
                               instructor_signature = ?, sent = ?
                           WHERE id = ?`;
            updateValues = [
                fellow_name, fellow_id, hospital, date_of_rotation, instructor_name,
                punctuality, dependable, respectful, positive_interaction, self_learning,
                communication, history_taking, physical_examination, clinical_reasoning,
                application_knowledge, overall_marks, strengths, suggestions,
                instructorSignature, draft_send, id
            ];

            if (Number(draft_send) === 1 && Number(existingRecord.sent) === 0) {
                await form_helper.sendFormToTrainee(userId, "fellow_resident_evaluation", id);
            }

        } else {
            return res.status(403).json({ message: "Permission denied" });
        }

        await pool.execute(updateQuery, updateValues);
        res.status(200).json({ message: "Form updated successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating form" });
    }
};

// GET BY ID
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

// DELETE
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

        if (result[0].instructor_id !== userId && userId !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the assigned instructor can delete this record" });
        }

        await pool.execute("DELETE FROM fellow_resident_evaluation WHERE id = ?", [id]);
        res.status(200).json({ message: "Tuple deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting tuple" });
    }
};

module.exports = {
    createForm,
    updateForm,
    getTupleById,
    deleteTupleById
};
