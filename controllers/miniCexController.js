const pool = require("../config/db");
//const moment = require("moment");
const form_helper = require('../middleware/form_helper');
//const path = require('path');
//const fs = require('fs');

const createMiniCEX = async (req, res) => {
  try {
    const { userId } = req.user;
    let {
      medical_interviewing,
      physical_exam,
      professionalism,
      clinical_judgment,
      counseling_skills,
      efficiency,
      overall_competence,
      observer_time,
      feedback_time,
      evaluator_satisfaction,
      resident_id,
      draft_send,
    } = req.body;

    let nullableFields = [
      "medical_interviewing",
      "physical_exam",
      "professionalism",
      "clinical_judgment",
      "counseling_skills",
      "efficiency",
      "overall_competence",
      "observer_time",
      "feedback_time",
      "evaluator_satisfaction",
    ];

    // Apply transformation
    nullableFields.forEach((field) => {
      if (req.body[field] === "") {
        eval(`${field} = null`);
      }
    });
    console.log("Uploaded files:", req.files);

    console.log(
      medical_interviewing,
      physical_exam,
      professionalism,
      clinical_judgment,
      counseling_skills,
      efficiency,
      overall_competence,
      observer_time,
      feedback_time,
      evaluator_satisfaction,
      resident_id,
      draft_send
    );
    
    // If the form is being sent (not a draft), check form limits
    if (Number(draft_send) === 1) {
      const limitCheck = await form_helper.checkFormLimitAndCleanDrafts(
        resident_id,
        "mini_cex"
      );
      
      if (!limitCheck.success) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(500).json({ error: limitCheck.message });
      }
      
      if (!limitCheck.canSubmit) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(400).json({ 
          error: limitCheck.message,
          deletedDrafts: limitCheck.deletedDrafts 
        });
      }
    }
    
    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const evaluator_signature_path = form_helper.getPublicUrl(a_signature);

    // Set is_signed_by_supervisor flag if signature is uploaded
    const is_signed_by_supervisor = evaluator_signature_path ? 1 : 0;

    // Fetch supervisor name
    const [[supervisor]] = await pool.execute(
      "SELECT Name FROM users WHERE User_ID = ?",
      [userId]
    );
    const [[trainee]] = await pool.execute(
      "SELECT Name FROM users WHERE User_ID = ?",
      [resident_id]
    );

    if (!supervisor) {
      return res.status(400).json({ message: "Invalid supervisor ID" });
    }
    if (!trainee) {
      return res.status(400).json({ message: "Invalid trainee ID" });
    }

    // Insert the new Mini-CEX form into the database
    const [result] = await pool.execute(
      `INSERT INTO mini_cex 
            (supervisor_id, supervisor_name, resident_id, trainee_name, medical_interviewing, physical_exam, 
            professionalism, clinical_judgment, counseling_skills, efficiency, overall_competence, 
            observer_time, feedback_time, evaluator_satisfaction, evaluator_signature_path, sent_to_trainee,
            is_signed_by_supervisor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        supervisor.Name,
        resident_id,
        trainee.Name,
        medical_interviewing ?? null,
        physical_exam ?? null,
        professionalism ?? null,
        clinical_judgment ?? null,
        counseling_skills ?? null,
        efficiency ?? null,
        overall_competence ?? null,
        observer_time ?? null,
        feedback_time ?? null,
        evaluator_satisfaction ?? null,
        evaluator_signature_path ?? null,
        draft_send,
        is_signed_by_supervisor,
      ]
    );

    const formId = result.insertId;

    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(userId, "mini_cex", formId);
    }
    res.status(201).json({
      message: "Mini-CEX form created successfully",
      formId: result.insertId,
    });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res
      .status(500)
      .json({ error: "Server error while creating Mini-CEX form" });
  }
};

const updateMiniCEX = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    let {
      residentFellow,
      resident_level,
      evaluation_date,
      setting,
      patient_problem,
      patient_age,
      patient_sex,
      patient_type,
      complexity,
      medical_interviewing,
      physical_exam,
      professionalism,
      clinical_judgment,
      counseling_skills,
      efficiency,
      overall_competence,
      observer_time,
      feedback_time,
      evaluator_satisfaction,
      resident_satisfaction,
      comments,
      focus,
      draft_send,
    } = req.body;
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
    let nullableFields = [
      "residentFellow",
      "resident_level",
      "evaluation_date",
      "setting",
      "patient_problem",
      "patient_age",
      "patient_sex",
      "patient_type",
      "complexity",
      "medical_interviewing",
      "physical_exam",
      "professionalism",
      "clinical_judgment",
      "counseling_skills",
      "efficiency",
      "overall_competence",
      "observer_time",
      "feedback_time",
      "evaluator_satisfaction",
      "resident_satisfaction",
      "comments",
      "focus",
    ];

    // Apply transformation
    nullableFields.forEach((field) => {
      if (req.body[field] === "") {
        eval(`${field} = null`);
      }
    });
    // Fetch form data to check the current signature status
    const [form] = await pool.execute("SELECT * FROM mini_cex WHERE id = ?", [
      id,
    ]);

    if (form.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(404).json({ message: "Mini-CEX form not found" });
    }
    
    const currentForm = form[0];

    // If changing from draft to sent, check form limits
    if (draft_send && Number(draft_send) === 1 && Number(currentForm.sent_to_trainee) === 0) {
      const limitCheck = await form_helper.checkFormLimitAndCleanDrafts(
        currentForm.resident_id,
        "mini_cex",
        id
      );
      
      if (!limitCheck.success) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(500).json({ error: limitCheck.message });
      }
      
      if (!limitCheck.canSubmit) {
        form_helper.cleanupUploadedFiles(req.files);
        return res.status(400).json({ 
          error: limitCheck.message,
          deletedDrafts: limitCheck.deletedDrafts 
        });
      }
    }

    // Fetch user names for notifications
    const [[supervisor]] = await pool.execute(
      "SELECT Name, email FROM users WHERE User_ID = ?",
      [form[0].supervisor_id]
    );
    const [[trainee]] = await pool.execute(
      "SELECT Name, email FROM users WHERE User_ID = ?",
      [form[0].resident_id]
    );

    if (!supervisor || !trainee) {
      return res
        .status(404)
        .json({ message: "Trainee or Supervisor not found" });
    }

    const hasAccess = await form_helper.auth("Trainee", "update_mini_cex")(
      req,
      res
    );
    const hasAccessS = await form_helper.auth("Supervisor", "update_mini_cex")(
      req,
      res
    );
    console.log(hasAccess, hasAccessS, userId);

    // Supervisor Updates (Roles 3, 4, 5)
    if (hasAccessS) {
      let a_signature = form[0].evaluator_signature_path;

      if (req.files?.signature) {
        const newSignaturePath = req.files.signature[0].path;
        const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

        await form_helper.deleteOldSignatureIfUpdated(
          "mini_cex",
          id,
          "evaluator_signature_path",
          newSignatureUrl
        );

        a_signature = newSignatureUrl;
      }

      evaluator_signature_path = a_signature;

      // Set is_signed_by_supervisor flag if new signature is uploaded
      const is_signed_by_supervisor = req.files?.signature
        ? 1
        : form.is_signed_by_supervisor || 0;

      const [old_send] = await pool.execute(
        `SELECT sent_to_trainee AS sent FROM mini_cex WHERE id = ?`,
        [id]
      );

      const updateQuery = `
                UPDATE mini_cex 
                SET 
                    medical_interviewing = ?, physical_exam = ?, professionalism = ?, clinical_judgment = ?, 
                    counseling_skills = ?, efficiency = ?, overall_competence = ?, observer_time = ?, 
                    feedback_time = ?, evaluator_satisfaction = ?, evaluator_signature_path = ?, sent_to_trainee = ?,
                    is_signed_by_supervisor = ?
                WHERE id = ?`;

      const updateValues = [
        medical_interviewing ?? form[0].medical_interviewing ?? null,
        physical_exam ?? form[0].physical_exam ?? null,
        professionalism ?? form[0].professionalism ?? null,
        clinical_judgment ?? form[0].clinical_judgment ?? null,
        counseling_skills ?? form[0].counseling_skills ?? null,
        efficiency ?? form[0].efficiency ?? null,
        overall_competence ?? form[0].overall_competence ?? null,
        observer_time ?? form[0].observer_time ?? null,
        feedback_time ?? form[0].feedback_time ?? null,
        evaluator_satisfaction ?? form[0].evaluator_satisfaction ?? null,
        evaluator_signature_path,
        draft_send, // Use the safely handled value here
        is_signed_by_supervisor,
        id,
      ];

      // Debug log
      updateValues.forEach((val, i) => {
        if (val === undefined)
          console.log(`Supervisor Update - updateValues[${i}] is undefined`);
      });

      await pool.execute(updateQuery, updateValues);

      // If form is being sent to trainee for the first time
      if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
        await form_helper.sendFormToTrainee(userId, "mini_cex", id);
      }

      return res
        .status(200)
        .json({ message: "Mini-CEX form updated successfully" });
    }

    // Trainee Updates (Role 2)
    else if (hasAccess) {
      // Ensure the current logged-in trainee is the one assigned to the form
      if (form[0].resident_id !== userId || form[0].sent_to_trainee === 0) {
        return res.status(403).json({ message: "Unauthorized access to form" });
      }

      if (form[0].is_signed_by_trainee) {
        return res.status(400).json({
          message: "You have already signed this form and cannot edit.",
        });
      }

      let r_Signature = req.files?.signature
        ? req.files.signature[0].path
        : existingRecord[0].resident_signature;
      const trainee_signature_path = form_helper.getPublicUrl(r_Signature);

      // Set is_signed_by_trainee flag if new signature is uploaded
      const is_signed_by_trainee = req.files?.signature
        ? 1
        : form.is_signed_by_trainee || 0;

      const updateQuery = `
                UPDATE mini_cex 
                SET 
                    residentFellow = ?, resident_level = ?, evaluation_date = ?, setting = ?, patient_problem = ?, 
                    patient_age = ?, patient_sex = ?, patient_type = ?, complexity = ?,
                    resident_satisfaction = ?, comments = ?, focus = ?, trainee_signature_path = ?,
                    is_signed_by_trainee = ?
                WHERE id = ?`;

      const updateValues = [
        residentFellow ?? form[0].residentFellow ?? null,
        resident_level ?? form[0].resident_level ?? null,
        evaluation_date ?? form[0].evaluation_date ?? null,
        setting ?? form[0].setting ?? null,
        patient_problem ?? form[0].patient_problem ?? null,
        patient_age ?? form[0].patient_age ?? null,
        patient_sex ?? form[0].patient_sex ?? null,
        patient_type ?? form[0].patient_type ?? null,
        complexity ?? form[0].complexity ?? null,
        resident_satisfaction ?? form[0].resident_satisfaction ?? null,
        comments ?? form[0].comments ?? null,
        focus ?? form[0].focus ?? null,
        trainee_signature_path,
        is_signed_by_trainee,
        id,
      ];

      // Debug log
      updateValues.forEach((val, i) => {
        if (val === undefined)
          console.log(`Trainee Update - updateValues[${i}] is undefined`);
      });

      await pool.execute(updateQuery, updateValues);

      const hasNewSignature =
        req.files?.signature && !form.is_signed_by_trainee;

      // Notify supervisor if trainee just signed the form
      if (hasNewSignature) {
        await form_helper.sendSignatureToSupervisor(userId, "mini_cex", id);
      }

      // Check if both parties have signed and update is_draft if needed
      await checkAndUpdateCompletionStatus(id);

      return res
        .status(200)
        .json({ message: "Mini-CEX form updated successfully" });
    } else {
      return res.status(403).json({
        message:
          "Permission denied: Only supervisor or trainee can update this form.",
      });
    }
  } catch (err) {
    console.error("Database Error:", err);
    res
      .status(500)
      .json({ error: "Server error while updating Mini-CEX form." });
  }
};

// Helper function to check and update completion status
const checkAndUpdateCompletionStatus = async (formId) => {
    try {
        const [[form]] = await pool.execute(
            "SELECT trainee_signature_path, evaluator_signature_path, is_signed_by_trainee, is_signed_by_supervisor FROM mini_cex WHERE id = ?", 
            [formId]
        );
        
        // If both parties have signed, mark the form as completed (is_draft = 0)
        if (form.is_signed_by_trainee && form.is_signed_by_supervisor) {
            await pool.execute(
                "UPDATE mini_cex SET is_draft = 0 WHERE id = ?", 
                [formId]
            );
        }
    } catch (error) {
        console.error("Error checking completion status:", error);
    }
}; 
const getMiniCEXById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const [result] = await pool.execute(
            `SELECT mc.*, 
                    u1.Name AS trainee_name, 
                    u2.Name AS supervisor_name
             FROM mini_cex mc
             JOIN users u1 ON mc.resident_id = u1.User_ID
             JOIN users u2 ON mc.supervisor_id = u2.User_ID
             WHERE mc.id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "Mini-CEX form not found" });
        }

        const form = result[0];

        res.status(200).json(form);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Error fetching Mini-CEX form" });
    }
};

const deleteMiniCEXById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const [rows] = await pool.execute("SELECT * FROM mini_cex WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Mini-CEX record not found" });
        }

        const record = rows[0];

        if (record.supervisor_id !== userId && userId !== 1) {
          return res.status(403).json({
            message:
              "Permission denied: Only the assigned supervisor can delete this record",
          });
        }
        await form_helper.deleteSignatureFilesFromDB(
          "mini_cex",
          id,
          ["trainee_signature_path", "evaluator_signature_path"]
        );
        await pool.execute("DELETE FROM mini_cex WHERE id = ?", [id]);
        res.status(200).json({ message: "Mini-CEX record deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting Mini-CEX record" });
    }
};

const getClinical = async (req, res) => {
    try {
      const { id } = req.params;
  
      const [result] = await pool.execute(
        `SELECT 
            mc.supervisor_name,
            mc.trainee_name,
            mc.resident_level,
            mc.evaluation_date,
            mc.setting,
            mc.patient_problem,
            mc.patient_age,
            mc.patient_sex,
            mc.patient_type,
            mc.complexity,
            mc.focus,
            mc.medical_interviewing,
            mc.physical_exam,
            mc.professionalism,
            mc.clinical_judgment,
            mc.counseling_skills,
            mc.efficiency,
            mc.overall_competence,
            mc.evaluator_satisfaction,
            mc.resident_satisfaction,
            mc.comments,
            mc.residentFellow,
            mc.evaluator_signature_path,
            mc.trainee_signature_path
         FROM mini_cex mc
         WHERE mc.id = ?`,
        [id]
      );
  
      if (result.length === 0) {
        return res.status(404).json({ message: "Clinical (Mini-CEX) form not found" });
      }
  
      res.status(200).json(result[0]);
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Error fetching Clinical form" });
    }
  };
  
module.exports = { createMiniCEX, updateMiniCEX, getMiniCEXById, deleteMiniCEXById, getClinical};
