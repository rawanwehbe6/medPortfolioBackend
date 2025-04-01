const db = require('../config/db');
const upload = require('../middleware/multerConfig');
const form_helper = require('../middleware/form_helper');
// Create new Seminar Assessment form (only for supervisors/admins)
const createSeminarAssessment = async (req, res) => {
    try {
        role  = req.user.role;
        supervisor_id=req.user.userId;
        const {
            resident_id, 
            date_of_presentation,
            topic,
            content,
            presentation_skills,
            audio_visual_aids,
            communication,
            handling_questions,
            audience_management,
            references,
            major_positive_feature,
            suggested_areas_for_improvement,
            draft_send
        } = req.body;
        const [rows] = await db.execute(`SELECT Name FROM users WHERE User_id = ?`, [resident_id]);
        const resident_fellow_name = rows.length > 0 ? rows[0].Name : null;
        // Only admin/supervisors can create forms
        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Only assessor signature allowed on creation
        const assessor_signature_path = req.files?.signature ? req.files.signature[0].path : null;

        const [insertResult] = await db.execute(
            `INSERT INTO seminar_assessment 
            (resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            topic, content, presentation_skills, audio_visual_aids,
            communication, handling_questions, audience_management,
            \`references\`, major_positive_feature, suggested_areas_for_improvement,
            assessor_signature_path,sent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
                topic, content, presentation_skills, audio_visual_aids,
                communication, handling_questions, audience_management,
                references, major_positive_feature, suggested_areas_for_improvement,
                assessor_signature_path, draft_send
            ]
        );
        const formId = insertResult.insertId; // Get the newly inserted form ID
        if (Number(draft_send) === 1) {
            await form_helper.sendFormToTrainee(supervisor_id, "seminar_assessment",formId);
        }

        res.status(201).json({ message: "Seminar Assessment form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating Seminar Assessment form" });
    }
};

// Update Seminar Assessment form
const updateSeminarAssessment = async (req, res) => {
    try {
        role=req.user.role;
    userId=req.user.userId; 
      const { id } = req.params;

        const [existingRecord] = await db.execute(
            `SELECT * FROM seminar_assessment WHERE id = ?`,
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Seminar Assessment form not found" });
        }

        const currentRecord = existingRecord[0];
        let updateQuery = "";
        let updateValues = [];

        if (role === 2) {  // Resident role
            // Residents can only update their own forms
            if (currentRecord.resident_id !== userId) {
                return res.status(403).json({ message: "Unauthorized access" });
            }

            // Residents can only update their name and signature
            const resident_signature_path = req.files?.signature ? req.files.signature[0].path : existingRecord[0].resident_signature;

           const [old_send] =await db.execute(
            `SELECT resident_signature_path FROM seminar_assessment WHERE id = ?`,
            [id]
            ); 

          updateQuery = `UPDATE seminar_assessment 
                         SET resident_signature_path = ? ,completed = ?
                         WHERE id = ?`;
          updateValues = [
              resident_signature_path,1,
              id
          ];
           if(old_send[0].resident_signature_path===null)
            await form_helper.sendSignatureToSupervisor(userId, "seminar_assessment",id);

        } else if ([1, 3, 4, 5].includes(role)) {  // Admin or supervisor roles
            // Supervisors can update all fields except resident signature and name
            const assessor_signature_path = req.files?.signature ? req.files.signature[0].path : existingRecord[0].assessor_signature;

            const [old_send] =await db.execute(
            `SELECT sent FROM seminar_assessment WHERE id = ?`,
            [id]
        ); 

            updateQuery = `UPDATE seminar_assessment 
                           SET topic = ?,
                               content = ?,
                               presentation_skills = ?,
                               audio_visual_aids = ?,
                               communication = ?,
                               handling_questions = ?,
                               audience_management = ?,
                               \`references\` = ?,
                               major_positive_feature = ?,
                               suggested_areas_for_improvement = ?,
                               assessor_signature_path = ?, sent = ?
                           WHERE id = ?`;
            updateValues = [
                req.body.topic || currentRecord.topic,
                req.body.content || currentRecord.content,
                req.body.presentation_skills || currentRecord.presentation_skills,
                req.body.audio_visual_aids || currentRecord.audio_visual_aids,
                req.body.communication || currentRecord.communication,
                req.body.handling_questions || currentRecord.handling_questions,
                req.body.audience_management || currentRecord.audience_management,
                req.body.references || currentRecord.references,
                req.body.major_positive_feature || currentRecord.major_positive_feature,
                req.body.suggested_areas_for_improvement || currentRecord.suggested_areas_for_improvement,
                assessor_signature_path,
                req.body.draft_send || currentRecord.sent,
                id
            ];

            if (Number(req.body.draft_send) === 1&& Number(old_send[0].sent)=== 0) {

              await form_helper.sendFormToTrainee(userId, "seminar_assessment",id);
            }


        } else {
            return res.status(403).json({ message: "Permission denied" });
        }

        await db.execute(updateQuery, updateValues);
        res.status(200).json({ message: "Seminar Assessment form updated successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating Seminar Assessment form" });
    }
};

// Get Seminar Assessment form by ID
const getSeminarAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req;

        // Fetch form with resident name
        const [result] = await db.execute(
    `SELECT 
        sa.resident_fellow_name AS resident_name,
        u_supervisor.Name AS supervisor_name,
        sa.date_of_presentation,
        sa.topic,
        sa.content,
        sa.presentation_skills,
        sa.audio_visual_aids,
        sa.communication,
        sa.handling_questions,
        sa.audience_management,
        sa.references,
        sa.major_positive_feature,
        sa.suggested_areas_for_improvement,
        sa.resident_signature_path AS resident_signature,
        sa.assessor_signature_path AS assessor_signature
     FROM seminar_assessment sa
     JOIN users u_resident ON sa.resident_id = u_resident.User_ID
     JOIN users u_supervisor ON sa.supervisor_id = u_supervisor.User_ID
     WHERE sa.id = ?`,
    [id]
);


        if (result.length === 0) {
            return res.status(404).json({ error: "Seminar Assessment form not found" });
        }
        res.status(200).json(result[0]);
        
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching Seminar Assessment form" });
    }
};

// Delete Seminar Assessment form
const deleteSeminarAssessment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req;

        // First check if form exists
        const [existingRecord] = await db.execute(
            "SELECT * FROM seminar_assessment WHERE id = ?",
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Seminar Assessment form not found" });
        }

        const form = existingRecord[0];

        // Check permissions
        if (role === 1 || // Admin can delete any
            ([3,4,5].includes(role) && form.supervisor_id === userId)) { // Supervisor can delete assigned
            await db.execute(
                "DELETE FROM seminar_assessment WHERE id = ?", 
                [id]
            );
            res.status(200).json({ message: "Seminar Assessment form deleted successfully" });
        } else {
            res.status(403).json({ message: "Permission denied" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting Seminar Assessment form" });
    }
};

module.exports = { 
    createSeminarAssessment, 
    updateSeminarAssessment, 
    getSeminarAssessmentById, 
    deleteSeminarAssessment 
};