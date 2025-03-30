const pool = require("../config/db");

const createForm = async (req, res) => {
    try {
        const { role } = req.user;
        supervisor_id=req.user.userId;
        const {
            resident_id, diagnosis, case_complexity, investigation_referral,
            treatment, future_planning, history_taking, overall_clinical_care, assessor_comment
        } = req.body;
        
        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const assessor_signature = req.files?.signature ? req.files.signature[0].path : null;

        await pool.execute(
            `INSERT INTO case_based_discussion_assessment 
            (resident_id, supervisor_id, diagnosis, case_complexity, investigation_referral, 
            treatment, future_planning, history_taking, overall_clinical_care, assessor_comment, assessor_signature) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_id, supervisor_id, diagnosis, case_complexity, investigation_referral,
                treatment, future_planning, history_taking, overall_clinical_care, assessor_comment, assessor_signature
            ]
        );

        res.status(201).json({ message: "Form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating form" });
    }
};

const updateForm = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        const {
            diagnosis, case_complexity, investigation_referral, treatment, future_planning, 
            history_taking, overall_clinical_care, assessor_comment, resident_comment
        } = req.body;

        const [existingRecord] = await pool.execute(
            `SELECT * FROM case_based_discussion_assessment WHERE id = ?`,
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        let updateQuery = "";
        let updateValues = [];

        if (role === 2) {
            if (existingRecord[0].resident_id !== userId) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
            let residentSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].resident_signature;
            updateQuery = `UPDATE case_based_discussion_assessment 
                           SET resident_comment = ?, resident_signature = ? 
                           WHERE id = ?`;
            updateValues = [resident_comment, residentSignature, id];
        } else if ([1, 3, 4, 5].includes(role)) {
            let assessorSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].assessor_signature;
            updateQuery = `UPDATE case_based_discussion_assessment 
                           SET diagnosis = ?, case_complexity = ?, investigation_referral = ?, 
                               treatment = ?, future_planning = ?, history_taking = ?, 
                               overall_clinical_care = ?, assessor_comment = ?, assessor_signature = ?
                           WHERE id = ?`;
            updateValues = [
                diagnosis, case_complexity, investigation_referral, treatment, future_planning,
                history_taking, overall_clinical_care, assessor_comment, assessorSignature, id
            ];
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

const getTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            `SELECT 
                u.Name AS resident_name,
                cbd.date, cbd.diagnosis, cbd.case_complexity, cbd.investigation_referral, 
                cbd.treatment, cbd.future_planning, cbd.history_taking, cbd.overall_clinical_care, 
                cbd.assessor_comment, cbd.resident_comment, cbd.resident_signature, cbd.assessor_signature
             FROM case_based_discussion_assessment cbd
             JOIN users u ON cbd.resident_id = u.User_ID
             WHERE cbd.id = ?`,
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

const deleteTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        
        const [result] = await pool.execute(
            "SELECT * FROM case_based_discussion_assessment WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Tuple not found" });
        }

        if (result[0].supervisor_id !== userId && userId !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the assigned supervisor can delete this record" });
        }

        await pool.execute("DELETE FROM case_based_discussion_assessment WHERE id = ?", [id]);
        res.status(200).json({ message: "Tuple deleted successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting tuple" });
    }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };