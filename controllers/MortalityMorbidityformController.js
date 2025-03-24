const db = require('../config/db');
const upload = require('../middleware/multerConfig');

// Create new Mortality & Morbidity form (only for supervisors/admins)
const createMortalityMorbidityForm = async (req, res) => {
    try {
        const { role } = req;
        const {
            resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            diagnosis, cause_of_death_morbidity, brief_introduction, patient_details,
            assessment_analysis, review_of_literature, recommendations,
            handling_questions, overall_performance, major_positive_feature,
            suggested_areas_for_improvement
        } = req.body;

        // Only admin/supervisors can create forms
        if (![1, 3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied" });
        }

        // Only assessor signature allowed on creation
        const assessor_signature_path = req.files?.assessor_signature ? req.files.assessor_signature[0].path : null;

        await db.execute(
            `INSERT INTO mortality_morbidity_review_assessment 
            (resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
            diagnosis, cause_of_death_morbidity, brief_introduction, patient_details,
            assessment_analysis, review_of_literature, recommendations,
            handling_questions, overall_performance, major_positive_feature,
            suggested_areas_for_improvement, assessor_signature_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                resident_id, supervisor_id, resident_fellow_name, date_of_presentation,
                diagnosis, cause_of_death_morbidity, brief_introduction, patient_details,
                assessment_analysis, review_of_literature, recommendations,
                handling_questions, overall_performance, major_positive_feature,
                suggested_areas_for_improvement, assessor_signature_path
            ]
        );

        res.status(201).json({ message: "Mortality & Morbidity form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating Mortality & Morbidity form" });
    }
};

// Update Mortality & Morbidity form
const updateMortalityMorbidityForm = async (req, res) => {
  try {
      const { role, userId } = req;
      const { id } = req.params;

      // Get existing record first
      const [existingRecord] = await db.execute(
          `SELECT * FROM mortality_morbidity_review_assessment WHERE id = ?`,
          [id]
      );

      if (existingRecord.length === 0) {
          return res.status(404).json({ error: "Mortality & Morbidity form not found" });
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

          updateQuery = `UPDATE mortality_morbidity_review_assessment 
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

          updateQuery = `UPDATE mortality_morbidity_review_assessment 
                         SET diagnosis = ?, 
                             cause_of_death_morbidity = ?,
                             brief_introduction = ?,
                             patient_details = ?,
                             assessment_analysis = ?,
                             review_of_literature = ?,
                             recommendations = ?,
                             handling_questions = ?,
                             overall_performance = ?,
                             major_positive_feature = ?,
                             suggested_areas_for_improvement = ?,
                             assessor_signature_path = ?
                         WHERE id = ?`;
          updateValues = [
              req.body.diagnosis || currentRecord.diagnosis,
              req.body.cause_of_death_morbidity || currentRecord.cause_of_death_morbidity,
              req.body.brief_introduction || currentRecord.brief_introduction,
              req.body.patient_details || currentRecord.patient_details,
              req.body.assessment_analysis || currentRecord.assessment_analysis,
              req.body.review_of_literature || currentRecord.review_of_literature,
              req.body.recommendations || currentRecord.recommendations,
              req.body.handling_questions || currentRecord.handling_questions,
              req.body.overall_performance || currentRecord.overall_performance,
              req.body.major_positive_feature || currentRecord.major_positive_feature,
              req.body.suggested_areas_for_improvement || currentRecord.suggested_areas_for_improvement,
              assessor_signature_path,
              id
          ];
      } else {
          return res.status(403).json({ message: "Permission denied" });
      }

      await db.execute(updateQuery, updateValues);
      res.status(200).json({ message: "Mortality & Morbidity form updated successfully" });

  } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error while updating Mortality & Morbidity form" });
  }
};

// Get Mortality & Morbidity form by ID
const getMortalityMorbidityFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req;

        // Fetch form with resident name
        const [result] = await db.execute(
            `SELECT 
                mm.*,
                u.Name AS resident_name
             FROM mortality_morbidity_review_assessment mm
             JOIN users u ON mm.resident_id = u.User_ID
             WHERE mm.id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Mortality & Morbidity form not found" });
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
        res.status(500).json({ error: "Server error while fetching Mortality & Morbidity form" });
    }
};

// Delete Mortality & Morbidity form
const deleteMortalityMorbidityForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req;

        // First check if form exists
        const [existingRecord] = await db.execute(
            "SELECT * FROM mortality_morbidity_review_assessment WHERE id = ?",
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Mortality & Morbidity form not found" });
        }

        const form = existingRecord[0];

        // Check permissions
        if (role === 1 || // Admin can delete any
            ([3,4,5].includes(role) && form.supervisor_id === userId)) { // Supervisor can delete assigned
            await db.execute(
                "DELETE FROM mortality_morbidity_review_assessment WHERE id = ?", 
                [id]
            );
            res.status(200).json({ message: "Mortality & Morbidity form deleted successfully" });
        } else {
            res.status(403).json({ message: "Permission denied" });
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting Mortality & Morbidity form" });
    }
};

module.exports = { 
    createMortalityMorbidityForm, 
    updateMortalityMorbidityForm, 
    getMortalityMorbidityFormById, 
    deleteMortalityMorbidityForm 
};