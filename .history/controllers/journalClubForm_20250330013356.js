const pool = require("../config/db");
const upload = require("../middleware/multerConfig"); // Import multer config

// Utility function to convert empty strings to NULL
const toNull = (value) => (value === "" ? null : value);

const createAssessment = async (req, res) => {
    try {
        const { role } = req.user;
        const {
            resident_name, date, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan
        } = req.body;

        const resident_signature = req.files?.["resident_signature"]?.[0]?.path || null;
        const assessor_signature = req.files?.["assessor_signature"]?.[0]?.path || null;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

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
                toNull(resident_name), toNull(date), toNull(article_reference), toNull(paper_selection), toNull(background_knowledge),
                toNull(critical_analysis_methodology), toNull(critical_analysis_results), toNull(conclusions_drawn),
                toNull(audio_visual_aids), toNull(handling_questions), toNull(overall_performance), toNull(major_positive_feature),
                toNull(suggested_article_selection), toNull(suggested_critical_analysis), toNull(suggested_slide_design),
                toNull(suggested_presentation), toNull(suggested_answering_questions), toNull(agreed_action_plan),
                resident_signature, assessor_signature
            ]
        );

        res.status(201).json({ message: "Journal club assessment created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating assessment" });
    }
};

// Update Assessment (Form Data)
const updateAssessment = async (req, res) => {
    try {
        const { role } = req.user;
        const { id } = req.params;
        const {
            resident_name, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan
        } = req.body;

        let resident_signature = null;
        const assessor_signature = req.files?.["assessor_signature"]?.[0]?.path || null;

        // Only role 2 can upload Resident’s/Fellow’s Signature
        if (role === 2) {
            resident_signature = req.files?.["resident_signature"]?.[0]?.path || null;
        }

        // Ensure only allowed roles can update fields
        if (![1, 2, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        await pool.execute(
            `UPDATE journal_club_assessment 
            SET resident_name = ?, article_reference = ?, paper_selection = ?, background_knowledge = ?, 
                critical_analysis_methodology = ?, critical_analysis_results = ?, conclusions_drawn = ?, 
                audio_visual_aids = ?, handling_questions = ?, overall_performance = ?, major_positive_feature = ?, 
                suggested_article_selection = ?, suggested_critical_analysis = ?, suggested_slide_design = ?,
                suggested_presentation = ?, suggested_answering_questions = ?, agreed_action_plan = ?,
                resident_signature = CASE WHEN ? IS NOT NULL AND ? = 2 THEN ? ELSE resident_signature END, 
                assessor_signature = COALESCE(?, assessor_signature)
            WHERE id = ?`,

            [
                toNull(resident_name), toNull(article_reference), toNull(paper_selection), toNull(background_knowledge),
                toNull(critical_analysis_methodology), toNull(critical_analysis_results), toNull(conclusions_drawn),
                toNull(audio_visual_aids), toNull(handling_questions), toNull(overall_performance), toNull(major_positive_feature),
                toNull(suggested_article_selection), toNull(suggested_critical_analysis), toNull(suggested_slide_design),
                toNull(suggested_presentation), toNull(suggested_answering_questions), toNull(agreed_action_plan),
                resident_signature, role, resident_signature, // Resident signature update logic
                assessor_signature, id
            ]
        );

        res.status(200).json({ message: "Journal club assessment updated successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating assessment" });
    }
};

// Middleware for handling form-data
const uploadFields = upload.fields([
    { name: "resident_signature", maxCount: 1 },
    { name: "assessor_signature", maxCount: 1 }
]);

module.exports = {
    createAssessment: [uploadFields, createAssessment],
    updateAssessment: [uploadFields, updateAssessment],
    getAssessmentById,
    deleteAssessmentById
};
