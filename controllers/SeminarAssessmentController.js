const db = require('../config/db');
const upload = require('../middleware/multerConfig');

// Create new Seminar Assessment form (only for supervisors/admins)
const createSeminarAssessment = async (req, res) => {
    try {
        const { role } = req;
        const {
            resident_id, 
            supervisor_id, 
            resident_fellow_name, 
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
            suggested_areas_for_improvement
        } = req.body;

        // Only admin/supervisors can create forms
        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Only assessor signature allowed on creation
        const assessor_signature_path = req.files?.assessor_signature ? req.files.assessor_signature[0].path : null;

        await db.execute(
            `INSERT INTO seminar_assessment 
            (resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            topic, content, presentation_skills, audio_visual_aids,
            communication, handling_questions, audience_management,
            \`references\`, major_positive_feature, suggested_areas_for_improvement,
            assessor_signature_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
                topic, content, presentation_skills, audio_visual_aids,
                communication, handling_questions, audience_management,
                references, major_positive_feature, suggested_areas_for_improvement,
                assessor_signature_path
            ]
        );

        res.status(201).json({ message: "Seminar Assessment form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating Seminar Assessment form" });
    }
};

// Update Seminar Assessment form
const updateSeminarAssessment = async (req, res) => {
    try {
        const { role, userId } = req;
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
            const resident_signature_path = req.files?.resident_signature 
                ? req.files.resident_signature[0].path 
                : currentRecord.resident_signature_path;

            updateQuery = `UPDATE seminar_assessment 
                           SET resident_fellow_name = ?, resident_signature_path = ? 
                           WHERE id = ?`;
            updateValues = [
                req.body.resident_fellow_name || currentRecord.resident_fellow_name,
                resident_signature_path,
                id
            ];

        } else if ([1, 3, 4, 5].includes(role)) {  // Admin or supervisor roles
            // Supervisors can update all fields except resident signature and name
            const assessor_signature_path = req.files?.assessor_signature 
                ? req.files.assessor_signature[0].path 
                : currentRecord.assessor_signature_path;

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
                               assessor_signature_path = ?
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
                id
            ];
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
                sa.*,
                u.Name AS resident_name
             FROM seminar_assessment sa
             JOIN users u ON sa.resident_id = u.User_ID
             WHERE sa.id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Seminar Assessment form not found" });
        }

        const form = result[0];

        // Check permissions
        if (role === 1 || // Admin can access any
            (role === 2 && form.resident_id === userId) || // Resident can access their own
            ([3,4,5].includes(role) && form.supervisor_id === userId)) { // Supervisor can access assigned
            res.status(200).json(form);
        } else {
            res.status(403).json({ message: "Permission denied" });
        }
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