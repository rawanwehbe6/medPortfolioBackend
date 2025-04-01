const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createAssessment = async (req, res) => {
    try {
        const { role } = req.user;
        const { resident_name, date, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan } = req.body;

        // Ensure only primary fields are non-null, others can be null
        const resident_signature = req.files && req.files.resident_signature ? req.files.resident_signature[0].path : null;
        const assessor_signature = req.files && req.files.assessor_signature ? req.files.assessor_signature[0].path : null;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Insert into database, allowing null values for optional fields
        await pool.execute(
            `INSERT INTO journal_club_assessment 
            (resident_name, date, article_reference, paper_selection, background_knowledge, 
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn, 
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature, 
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan,
            resident_signature, assessor_signature) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_name, 
                date, 
                article_reference|| null, 
                paper_selection || null, 
                background_knowledge || null,
                critical_analysis_methodology || null,
                critical_analysis_results || null, 
                conclusions_drawn || null, 
                audio_visual_aids || null, 
                handling_questions || null, 
                overall_performance || null, 
                major_positive_feature || null, 
                suggested_article_selection || null, 
                suggested_critical_analysis || null, 
                suggested_slide_design || null, 
                suggested_presentation || null, 
                suggested_answering_questions || null, 
                agreed_action_plan || null, 
                resident_signature, 
                assessor_signature
            ]
        );

        res.status(201).json({ message: "Journal club assessment created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating assessment" });
    }
};

const updateAssessment = async (req, res) => {
    try {
        const { role, userId } = req.user; // User's role and userId from authenticated session
        const { id } = req.params; // Assessment ID from URL parameters

        // Extract form fields from the request body
        const {
            resident_name, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan
        } = req.body;

        // Fetch the existing assessment record from the database
        const [existingRecord] = await pool.execute(
            `SELECT * FROM journal_club_assessment WHERE id = ?`,
            [id]
        );

        // If the record doesn't exist, return 404
        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Assessment record not found" });
        }

        let updateQuery = "";
        let updateValues = [];

        // Logic for role 2 (Resident)
        if (role === 2) {
            // Resident can only update their signature and some of their comments (if needed)
            if (existingRecord[0].resident_name !== resident_name) {
                return res.status(403).json({ message: "Unauthorized access" });
            }

            // If a resident signature is uploaded, save the file, otherwise retain the existing signature
            let residentSignature = req.files?.resident_signature ? req.files.resident_signature[0].path : existingRecord[0].resident_signature;

            // Update query for resident (allowing only the signature and comments to be updated)
            updateQuery = `UPDATE journal_club_assessment 
                           SET resident_signature = ?, 
                               suggested_article_selection = ?, 
                               suggested_critical_analysis = ?, 
                               suggested_slide_design = ?,
                               suggested_presentation = ?, 
                               suggested_answering_questions = ?,
                               agreed_action_plan = ?
                           WHERE id = ?`;

            updateValues = [
                residentSignature, 
                suggested_article_selection ?? existingRecord[0].suggested_article_selection,
                suggested_critical_analysis ?? existingRecord[0].suggested_critical_analysis,
                suggested_slide_design ?? existingRecord[0].suggested_slide_design,
                suggested_presentation ?? existingRecord[0].suggested_presentation,
                suggested_answering_questions ?? existingRecord[0].suggested_answering_questions,
                agreed_action_plan ?? existingRecord[0].agreed_action_plan,
                id
            ];

        } else if ([1, 3, 4, 5].includes(role)) {
            // For Supervisor or Assessor roles, they can update all fields except `resident_signature`
            let assessorSignature = req.files?.assessor_signature ? req.files.assessor_signature[0].path : existingRecord[0].assessor_signature;

            // Supervisor can update all fields including the assessment but excluding resident signature
            updateQuery = `UPDATE journal_club_assessment 
                           SET resident_name = ?, article_reference = ?, paper_selection = ?, 
                               background_knowledge = ?, critical_analysis_methodology = ?, 
                               critical_analysis_results = ?, conclusions_drawn = ?, 
                               audio_visual_aids = ?, handling_questions = ?, overall_performance = ?, 
                               major_positive_feature = ?, suggested_article_selection = ?, 
                               suggested_critical_analysis = ?, suggested_slide_design = ?,
                               suggested_presentation = ?, suggested_answering_questions = ?, 
                               agreed_action_plan = ?, assessor_signature = ?
                           WHERE id = ?`;

            updateValues = [
                resident_name ?? existingRecord[0].resident_name, 
                article_reference ?? existingRecord[0].article_reference, 
                paper_selection ?? existingRecord[0].paper_selection,
                background_knowledge ?? existingRecord[0].background_knowledge,
                critical_analysis_methodology ?? existingRecord[0].critical_analysis_methodology,
                critical_analysis_results ?? existingRecord[0].critical_analysis_results,
                conclusions_drawn ?? existingRecord[0].conclusions_drawn,
                audio_visual_aids ?? existingRecord[0].audio_visual_aids,
                handling_questions ?? existingRecord[0].handling_questions,
                overall_performance ?? existingRecord[0].overall_performance,
                major_positive_feature ?? existingRecord[0].major_positive_feature,
                suggested_article_selection ?? existingRecord[0].suggested_article_selection,
                suggested_critical_analysis ?? existingRecord[0].suggested_critical_analysis,
                suggested_slide_design ?? existingRecord[0].suggested_slide_design,
                suggested_presentation ?? existingRecord[0].suggested_presentation,
                suggested_answering_questions ?? existingRecord[0].suggested_answering_questions,
                agreed_action_plan ?? existingRecord[0].agreed_action_plan,
                assessorSignature, 
                id
            ];
        } else {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Execute the update query with the prepared values
        await pool.execute(updateQuery, updateValues);

        // Send response indicating successful update
        res.status(200).json({ message: "Assessment updated successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating assessment" });
    }
};



const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            `SELECT * FROM journal_club_assessment WHERE id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Assessment record not found" });
        }

        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching assessment" });
    }
};

const deleteAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        
        const [result] = await pool.execute(
            "SELECT * FROM journal_club_assessment WHERE id = ?",
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Assessment record not found" });
        }

        await pool.execute("DELETE FROM journal_club_assessment WHERE id = ?", [id]);
        res.status(200).json({ message: "Assessment record deleted successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting assessment" });
    }
};

module.exports = { createAssessment, updateAssessment, getAssessmentById, deleteAssessmentById };
