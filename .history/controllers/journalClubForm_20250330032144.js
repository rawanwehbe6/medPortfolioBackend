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
                article_reference, 
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
        const { role } = req.user;
        const { id } = req.params;
        const { resident_name, article_reference, paper_selection, background_knowledge,
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

        // Update the record, allowing null values for optional fields
        await pool.execute(
            `UPDATE journal_club_assessment 
            SET resident_name = ?, article_reference = ?, paper_selection = ?, background_knowledge = ?, 
                critical_analysis_methodology = ?, critical_analysis_results = ?, conclusions_drawn = ?, 
                audio_visual_aids = ?, handling_questions = ?, overall_performance = ?, major_positive_feature = ?, 
                suggested_article_selection = ?, suggested_critical_analysis = ?, suggested_slide_design = ?,
                suggested_presentation = ?, suggested_answering_questions = ?, agreed_action_plan = ?,
                resident_signature = ?, assessor_signature = ?
            WHERE id = ?`,
            [
                resident_name, 
                article_reference || null, 
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
                assessor_signature, 
                id
            ]
        );

        res.status(200).json({ message: "Journal club assessment updated successfully" });
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
