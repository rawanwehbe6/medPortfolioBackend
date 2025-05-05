const pool = require("../config/db");
const form_helper = require("../middleware/form_helper");

const createForm = async (req, res) => {
  try {
    const { userId: supervisor_id } = req.user;

    const {
      fellow_id,
      hospital,
      date_of_rotation,
      punctuality,
      dependable,
      respectful,
      positive_interaction,
      self_learning,
      communication,
      history_taking,
      physical_examination,
      clinical_reasoning,
      application_knowledge,
      strengths,
      suggestions,
      draft_send,
    } = req.body;

    const [fellowRows] = await pool.execute(
      `SELECT Name FROM users WHERE User_ID = ?`,
      [fellow_id]
    );

    const [supervisorRows] = await pool.execute(
      `SELECT Name FROM users WHERE User_ID = ?`,
      [supervisor_id]
    );

    const fellow_name = fellowRows[0].Name;
    const supervisor_name = supervisorRows[0].Name;

    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const supervisor_signature = form_helper.getPublicUrl(a_signature);

    const scores = [
      punctuality,
      dependable,
      respectful,
      positive_interaction,
      self_learning,
      communication,
      history_taking,
      physical_examination,
      clinical_reasoning,
      application_knowledge,
    ];
    const totalScore = scores.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const overall_marks = totalScore * 2;

    const [insertResult] = await pool.execute(
      `INSERT INTO fellow_resident_evaluation 
        (fellow_id, fellow_name, hospital, date_of_rotation, supervisor_id, supervisor_name,
         punctuality, dependable, respectful, positive_interaction, self_learning,
         communication, history_taking, physical_examination, clinical_reasoning, 
         application_knowledge, overall_marks, strengths, suggestions, 
         supervisor_signature, sent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fellow_id,
        fellow_name,
        hospital ?? null,
        date_of_rotation ?? null,
        supervisor_id,
        supervisor_name,
        punctuality ?? null,
        dependable ?? null,
        respectful ?? null,
        positive_interaction ?? null,
        self_learning ?? null,
        communication ?? null,
        history_taking ?? null,
        physical_examination ?? null,
        clinical_reasoning ?? null,
        application_knowledge ?? null,
        overall_marks ?? null,
        strengths ?? null,
        suggestions ?? null,
        supervisor_signature ?? null,
        draft_send,
      ]
    );

    const formId = insertResult.insertId;

    if (Number(draft_send) === 1) {
      await form_helper.sendFormToTrainee(
        supervisor_id,
        "fellow_resident_evaluation",
        formId
      );
    }

    res
      .status(201)
      .json({ message: "Fellow resident evaluation created successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({ error: "Server error while creating evaluation" });
  }
};

const updateForm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const {
      hospital,
      date_of_rotation,
      punctuality,
      dependable,
      respectful,
      positive_interaction,
      self_learning,
      communication,
      history_taking,
      physical_examination,
      clinical_reasoning,
      application_knowledge,
      strengths,
      suggestions,
      draft_send,
    } = req.body;

    const [existingRecord] = await pool.execute(
      `SELECT * FROM fellow_resident_evaluation WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(404).json({ error: "Evaluation not found" });
    }

    if (Number(existingRecord[0].completed) === 1) {
      form_helper.cleanupUploadedFiles(req.files);
      return res
        .status(403)
        .json({ error: "You cannot edit a completed evaluation" });
    }

    if (existingRecord[0].supervisor_id !== userId) {
      form_helper.cleanupUploadedFiles(req.files);
      return res.status(403).json({
        message:
          "Permission denied: Only the assigned supervisor can update this evaluation",
      });
    }

    let supervisorSignature = existingRecord[0].supervisor_signature;

    if (req.files?.signature) {
      const newSignaturePath = req.files.signature[0].path;
      const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);

      await form_helper.deleteOldSignatureIfUpdated(
        "fellow_resident_evaluation",
        id,
        "supervisor_signature",
        newSignatureUrl
      );

      supervisorSignature = newSignatureUrl;
    }

    const [old_send] = await pool.execute(
      `SELECT sent FROM fellow_resident_evaluation WHERE id = ?`,
      [id]
    );

    const scores = [
      punctuality,
      dependable,
      respectful,
      positive_interaction,
      self_learning,
      communication,
      history_taking,
      physical_examination,
      clinical_reasoning,
      application_knowledge,
    ];
    const totalScore = scores.reduce((sum, val) => sum + (Number(val) || 0), 0);
    const overall_marks = totalScore * 2;

    const updateQuery = `UPDATE fellow_resident_evaluation 
                         SET hospital = ?, date_of_rotation = ?, 
                             punctuality = ?, dependable = ?, respectful = ?,
                             positive_interaction = ?, self_learning = ?,
                             communication = ?, history_taking = ?, physical_examination = ?,
                             clinical_reasoning = ?, application_knowledge = ?,
                             overall_marks = ?, strengths = ?, suggestions = ?,
                             supervisor_signature = ?, sent = ?
                         WHERE id = ?`;

    const updateValues = [
      hospital ?? existingRecord[0].hospital ?? null,
      date_of_rotation ?? existingRecord[0].date_of_rotation ?? null,
      punctuality ?? existingRecord[0].punctuality ?? null,
      dependable ?? existingRecord[0].dependable ?? null,
      respectful ?? existingRecord[0].respectful ?? null,
      positive_interaction ?? existingRecord[0].positive_interaction ?? null,
      self_learning ?? existingRecord[0].self_learning ?? null,
      communication ?? existingRecord[0].communication ?? null,
      history_taking ?? existingRecord[0].history_taking ?? null,
      physical_examination ?? existingRecord[0].physical_examination ?? null,
      clinical_reasoning ?? existingRecord[0].clinical_reasoning ?? null,
      application_knowledge ?? existingRecord[0].application_knowledge ?? null,
      overall_marks ?? 0,
      strengths ?? existingRecord[0].strengths ?? null,
      suggestions ?? existingRecord[0].suggestions ?? null,
      supervisorSignature ?? null,
      draft_send,
      id,
    ];

    await pool.execute(updateQuery, updateValues);

    if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
      await form_helper.sendFormToTrainee(
        userId,
        "fellow_resident_evaluation",
        id
      );
    }

    if (supervisorSignature && Number(draft_send) === 1) {
      await pool.execute(
        `UPDATE fellow_resident_evaluation SET completed = 1 WHERE id = ?`,
        [id]
      );
    }

    res.status(200).json({ message: "Evaluation updated successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    form_helper.cleanupUploadedFiles(req.files);
    res.status(500).json({ error: "Server error while updating evaluation" });
  }
};

const getTupleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      `SELECT 
         fre.*,
         u_f.Name AS fellow_name,
         u_s.Name AS supervisor_name
       FROM fellow_resident_evaluation fre
       JOIN users u_f ON fre.fellow_id = u_f.User_ID
       JOIN users u_s ON fre.supervisor_id = u_s.User_ID
       WHERE fre.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching evaluation" });
  }
};

const deleteTupleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const [result] = await pool.execute(
      "SELECT * FROM fellow_resident_evaluation WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    if (result[0].supervisor_id !== userId && userId !== 1) {
      return res.status(403).json({
        message:
          "Permission denied: Only the assigned supervisor can delete this evaluation",
      });
    }

    await form_helper.deleteSignatureFilesFromDB(
      "fellow_resident_evaluation",
      id,
      ["supervisor_signature"]
    );

    await pool.execute("DELETE FROM fellow_resident_evaluation WHERE id = ?", [
      id,
    ]);

    res.status(200).json({ message: "Evaluation deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting evaluation" });
  }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };
