const pool = require("../config/db");
const upload = require("../middlewares/multerConfig");
const fs = require("fs");

const createAssessment = async (req, res) => {
    try {
        upload.fields([
            { name: "resident_signature", maxCount: 1 },
            { name: "assessor_signature", maxCount: 1 },
        ])(req, res, async (err) => {
            if (err) return res.status(400).json({ error: err.message });

            const { role } = req.user;
            const {
                resident_name = null, date = null, article_reference = null, paper_selection = null,
                background_knowledge = null, critical_analysis_methodology = null, critical_analysis_results = null,
                conclusions_drawn = null, audio_visual_aids = null, handling_questions = null, overall_performance = null,
                major_positive_feature = null, suggested_article_selection = null, suggested_critical_analysis = null,
                suggested_slide_design = null, suggested_presentation = null, suggested_answering_questions = null,
                agreed_action_plan = null
            } = req.body;

            if (![1, 3, 4, 5].includes(role)) {
                return res.status(403).json({ message: "Permission denied" });
            }

            const residentSignaturePath = req.files["resident_signature"] ? req.files["resident_signature"][0].path : null;
            const assessorSignaturePath = req.files["assessor_signature"] ? req.files["assessor_signature"][0].path : null;

            await pool.execute(
                `INSERT INTO journal_club_assessment 
                (resident_name, date, article_reference, paper_selection, background_knowledge, 
                critical_analysis_methodology, critical_analysis_results, conclusions_drawn, 
                audio_visual_aids, handling_questions, overall_performance, major_positive_feature, 
                suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
                suggested_presentation, suggested_answering_questions, agreed_action_plan,
                resident_signature, assessor_signature) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                [resident_name, date, article_reference, paper_selection, background_knowledge,
                    critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
                    audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
                    suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
                    suggested_presentation, suggested_answering_questions, agreed_action_plan,
                    residentSignaturePath, assessorSignaturePath]
            );

            res.status(201).json({ message: "Journal club assessment created successfully" });
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating assessment" });
    }
};

const updateAssessment = async (req, res) => {
    try {
        upload.fields([{ name: "resident_signature", maxCount: 1 }])(req, res, async (err) => {
            if (err) return res.status(400).json({ error: err.message });

            const { role } = req.user;
            const { id } = req.params;
            let updateQuery = "";
            let updateValues = [];

            const [existingRecord] = await pool.execute(
                "SELECT resident_signature FROM journal_club_assessment WHERE id = ?",
                [id]
            );

            if (existingRecord.length === 0) {
                return res.status(404).json({ error: "Assessment record not found" });
            }

            if (role === 2) {
                // Role 2 can only update the resident's signature
                if (!req.files["resident_signature"]) {
                    return res.status(400).json({ error: "Resident signature is required for role 2" });
                }

                const residentSignaturePath = req.files["resident_signature"][0].path;

                // Delete old signature if it exists
                if (existingRecord[0].resident_signature) {
                    fs.unlinkSync(existingRecord[0].resident_signature);
                }

                updateQuery = "UPDATE journal_club_assessment SET resident_signature = ? WHERE id = ?";
                updateValues = [residentSignaturePath, id];

            } else if ([1, 3, 4, 5].includes(role)) {
                // Roles 1,3,4,5 can update everything except resident_signature
                const {
                    resident_name = null, article_reference = null, paper_selection = null, background_knowledge = null,
                    critical_analysis_methodology = null, critical_analysis_results = null, conclusions_drawn = null,
                    audio_visual_aids = null, handling_questions = null, overall_performance = null, major_positive_feature = null,
                    suggested_article_selection = null, suggested_critical_analysis = null, suggested_slide_design = null,
                    suggested_presentation = null, suggested_answering_questions = null, agreed_action_plan = null,
                    assessor_signature = null
                } = req.body;

                const assessorSignaturePath = req.files["assessor_signature"]
                    ? req.files["assessor_signature"][0].path
                    : existingRecord[0].assessor_signature;

                updateQuery = `
                    UPDATE journal_club_assessment 
                    SET resident_name = ?, article_reference = ?, paper_selection = ?, background_knowledge = ?, 
                        critical_analysis_methodology = ?, critical_analysis_results = ?, conclusions_drawn = ?, 
                        audio_visual_aids = ?, handling_questions = ?, overall_performance = ?, major_positive_feature = ?, 
                        suggested_article_selection = ?, suggested_critical_analysis = ?, suggested_slide_design = ?,
                        suggested_presentation = ?, suggested_answering_questions = ?, agreed_action_plan = ?, 
                        assessor_signature = ?
                    WHERE id = ?
                `;

                updateValues = [
                    resident_name, article_reference, paper_selection, background_knowledge,
                    critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
                    audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
                    suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
                    suggested_presentation, suggested_answering_questions, agreed_action_plan,
                    assessorSignaturePath, id
                ];
            } else {
                return res.status(403).json({ message: "Permission denied" });
            }

            await pool.execute(updateQuery, updateValues);
            res.status(200).json({ message: "Journal club assessment updated successfully" });
        });

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
        const { role } = req.user;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const [existingRecord] = await pool.execute(
            "SELECT resident_signature, assessor_signature FROM journal_club_assessment WHERE id = ?",
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Assessment record not found" });
        }

        if (existingRecord[0].resident_signature) fs.unlinkSync(existingRecord[0].resident_signature);
        if (existingRecord[0].assessor_signature) fs.unlinkSync(existingRecord[0].assessor_signature);

        await pool.execute("DELETE FROM journal_club_assessment WHERE id = ?", [id]);

        res.status(200).json({ message: "Assessment record deleted successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting assessment" });
    }
};

module.exports = { createAssessment, updateAssessment, getAssessmentById, deleteAssessmentById };