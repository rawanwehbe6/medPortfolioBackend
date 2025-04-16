const pool = require("../config/db");
const upload = require("../middleware/multerConfig");

const createAssessment = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const {
            resident_name, date, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan,
            draft_send // 👈 Boolean: 1 if supervisor is sending
        } = req.body;

        const resident_signature = req.files?.resident_signature?.[0]?.path || null;
        const assessor_signature = req.files?.assessor_signature?.[0]?.path || null;

        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        const [result] = await pool.execute(
            `INSERT INTO journal_club_assessment 
            (resident_name, date, article_reference, paper_selection, background_knowledge, 
             critical_analysis_methodology, critical_analysis_results, conclusions_drawn, 
             audio_visual_aids, handling_questions, overall_performance, major_positive_feature, 
             suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
             suggested_presentation, suggested_answering_questions, agreed_action_plan,
             resident_signature, assessor_signature, sent, completed)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_name, date, article_reference || null, paper_selection || null, background_knowledge || null,
                critical_analysis_methodology || null, critical_analysis_results || null, conclusions_drawn || null,
                audio_visual_aids || null, handling_questions || null, overall_performance || null, major_positive_feature || null,
                suggested_article_selection || null, suggested_critical_analysis || null, suggested_slide_design || null,
                suggested_presentation || null, suggested_answering_questions || null, agreed_action_plan || null,
                resident_signature, assessor_signature, draft_send, 0
            ]
        );

        const formId = result.insertId;
        if (Number(draft_send) === 1) {
            await form_helper.sendFormToTrainee(userId, "journal_club_assessment", formId);
        }

        res.status(201).json({ message: "Journal club assessment created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating assessment" });
    }
};

const updateAssessment = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        const {
            resident_name, article_reference, paper_selection, background_knowledge,
            critical_analysis_methodology, critical_analysis_results, conclusions_drawn,
            audio_visual_aids, handling_questions, overall_performance, major_positive_feature,
            suggested_article_selection, suggested_critical_analysis, suggested_slide_design,
            suggested_presentation, suggested_answering_questions, agreed_action_plan,
            draft_send // 👈 Supervisor's intent to send the form
        } = req.body;

        const [existing] = await pool.execute(
            "SELECT * FROM journal_club_assessment WHERE id = ?",
            [id]
        );
        if (existing.length === 0) return res.status(404).json({ error: "Record not found" });
        const record = existing[0];

        const checkAccess = role => form_helper.auth(role, 'update_cbda_form')(req, res);
        const hasAccess = await checkAccess('Trainee');
        const hasAccessS = await checkAccess('Supervisor');

        let updateQuery = '';
        let updateValues = [];

        if (hasAccess) {
            // Trainee (resident)
            if (record.resident_name !== resident_name) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            const residentSignature = req.files?.resident_signature?.[0]?.path || record.resident_signature;

            updateQuery = `UPDATE journal_club_assessment SET 
                resident_signature = ?, suggested_article_selection = ?, suggested_critical_analysis = ?, 
                suggested_slide_design = ?, suggested_presentation = ?, suggested_answering_questions = ?, 
                agreed_action_plan = ?, completed = ?
                WHERE id = ?`;

            updateValues = [
                residentSignature,
                suggested_article_selection ?? record.suggested_article_selection,
                suggested_critical_analysis ?? record.suggested_critical_analysis,
                suggested_slide_design ?? record.suggested_slide_design,
                suggested_presentation ?? record.suggested_presentation,
                suggested_answering_questions ?? record.suggested_answering_questions,
                agreed_action_plan ?? record.agreed_action_plan,
                1, // ✅ Mark completed
                id
            ];

            if (!record.resident_signature) {
                await form_helper.sendSignatureToSupervisor(userId, "journal_club_assessment", id);
            }

        } else if (hasAccessS) {
            // Supervisor
            const assessorSignature = req.files?.assessor_signature?.[0]?.path || record.assessor_signature;

            updateQuery = `UPDATE journal_club_assessment SET 
                resident_name = ?, article_reference = ?, paper_selection = ?, background_knowledge = ?, 
                critical_analysis_methodology = ?, critical_analysis_results = ?, conclusions_drawn = ?, 
                audio_visual_aids = ?, handling_questions = ?, overall_performance = ?, major_positive_feature = ?, 
                suggested_article_selection = ?, suggested_critical_analysis = ?, suggested_slide_design = ?, 
                suggested_presentation = ?, suggested_answering_questions = ?, agreed_action_plan = ?, 
                assessor_signature = ?, sent = ?
                WHERE id = ?`;

            updateValues = [
                resident_name ?? record.resident_name,
                article_reference ?? record.article_reference,
                paper_selection ?? record.paper_selection,
                background_knowledge ?? record.background_knowledge,
                critical_analysis_methodology ?? record.critical_analysis_methodology,
                critical_analysis_results ?? record.critical_analysis_results,
                conclusions_drawn ?? record.conclusions_drawn,
                audio_visual_aids ?? record.audio_visual_aids,
                handling_questions ?? record.handling_questions,
                overall_performance ?? record.overall_performance,
                major_positive_feature ?? record.major_positive_feature,
                suggested_article_selection ?? record.suggested_article_selection,
                suggested_critical_analysis ?? record.suggested_critical_analysis,
                suggested_slide_design ?? record.suggested_slide_design,
                suggested_presentation ?? record.suggested_presentation,
                suggested_answering_questions ?? record.suggested_answering_questions,
                agreed_action_plan ?? record.agreed_action_plan,
                assessorSignature,
                draft_send,
                id
            ];

            if (Number(draft_send) === 1 && Number(record.sent) === 0) {
                await form_helper.sendFormToTrainee(userId, "journal_club_assessment", id);
            }

        } else {
            return res.status(403).json({ message: "Permission denied" });
        }

        await pool.execute(updateQuery, updateValues);
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
