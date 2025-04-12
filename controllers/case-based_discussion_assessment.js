const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');
const createForm = async (req, res) => {
    try {
        const { role } = req.user;
        supervisor_id=req.user.userId;
        const {
            resident_id, diagnosis, case_complexity, investigation_referral,
            treatment, future_planning, history_taking, overall_clinical_care, assessor_comment,draft_send
        } = req.body;

        const assessor_signature = req.files?.signature ? req.files.signature[0].path : null;

        const [insertResult] = await pool.execute(
            `INSERT INTO case_based_discussion_assessment 
            (resident_id, supervisor_id, diagnosis, case_complexity, investigation_referral, 
            treatment, future_planning, history_taking, overall_clinical_care, assessor_comment, assessor_signature,sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_id, supervisor_id, diagnosis, case_complexity, investigation_referral,
                treatment, future_planning, history_taking, overall_clinical_care, assessor_comment, assessor_signature,draft_send
            ]
        );
         const formId = insertResult.insertId; // Get the newly inserted form ID
        if (Number(draft_send) === 1) {
            await form_helper.sendFormToTrainee(supervisor_id, "case_based_discussion_assessment",formId);
        }

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
        ,draft_send} = req.body;

        const [existingRecord] = await pool.execute(
            `SELECT * FROM case_based_discussion_assessment WHERE id = ?`,
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        let updateQuery = "";
        let updateValues = [];

        const hasAccess = await form_helper.auth('Trainee', 'update_cbda_form')(req, res);
        const hasAccessS = await form_helper.auth('Supervisor', 'update_cbda_form')(req, res);
        console.log(hasAccess,hasAccessS,userId);
        if (hasAccess) {
            if (existingRecord[0].resident_id !== userId) {
                return res.status(403).json({ message: "Unauthorized access" });
            }
            let residentSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].resident_signature;
            
            const [old_send] =await pool.execute(
            `SELECT resident_signature FROM case_based_discussion_assessment WHERE id = ?`,
            [id]
            ); 

            updateQuery = `UPDATE case_based_discussion_assessment 
                           SET resident_comment = ?, resident_signature = ?,completed = ? 
                           WHERE id = ?`;
            updateValues = [resident_comment, residentSignature, 1, id];

             if(old_send[0].resident_signature===null)
            await form_helper.sendSignatureToSupervisor(userId, "case_based_discussion_assessment",id);

        } else if (hasAccessS) {
            let assessorSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].assessor_signature;
            
            const [old_send] =await pool.execute(
            `SELECT sent FROM case_based_discussion_assessment WHERE id = ?`,
            [id]
        ); 
            
            updateQuery = `UPDATE case_based_discussion_assessment 
                           SET diagnosis = ?, case_complexity = ?, investigation_referral = ?, 
                               treatment = ?, future_planning = ?, history_taking = ?, 
                               overall_clinical_care = ?, assessor_comment = ?, assessor_signature = ?, sent = ?
                           WHERE id = ?`;
            updateValues = [
                diagnosis, case_complexity, investigation_referral, treatment, future_planning,
                history_taking, overall_clinical_care, assessor_comment, assessorSignature,draft_send, id
            ];

            if (Number(draft_send) === 1&& Number(old_send[0].sent)=== 0) {

              await form_helper.sendFormToTrainee(userId, "case_based_discussion_assessment",id);
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

const getTupleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            `SELECT 
                u.Name AS resident_name,u_a.Name AS supervisor_name,
                cbd.date, cbd.diagnosis, cbd.case_complexity, cbd.investigation_referral, 
                cbd.treatment, cbd.future_planning, cbd.history_taking, cbd.overall_clinical_care, 
                cbd.assessor_comment AS supervisor_comment, cbd.resident_comment, cbd.resident_signature, cbd.assessor_signature AS supervisor_signature
             FROM case_based_discussion_assessment cbd
             JOIN users u ON cbd.resident_id = u.User_ID
             JOIN users u_a ON cbd.supervisor_id = u_a.User_ID
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