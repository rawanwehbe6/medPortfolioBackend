const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');

const createDOPS = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Missing user ID" });
          }
          
        const {
            resident_id, indications, indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, feedback, strengths, developmental_needs, recommended_actions,
            draft_send
        } = req.body;
        console.log('resident_id:', resident_id); // check its value
        console.log("body", req.body);
    
        const a_signature = req.files?.signature
        ? req.files.signature[0].path
        : null;
      const supervisor_signature = form_helper.getPublicUrl(a_signature);
  

        // Set is_signed_by_supervisor flag if signature is uploaded
        const is_signed_by_supervisor = supervisor_signature ? 1 : 0;

        // Fetch supervisor and trainee names
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [userId]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [resident_id]);

        if (!supervisor || !trainee) {
            return res.status(400).json({ message: "Invalid assessor or trainee ID" });
        }
          
        // insert new dops form into database
        const [result] = await pool.execute(
            `INSERT INTO dops 
            (supervisor_id, supervisor_name, resident_id, trainee_name, indications,
            indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, feedback, strengths, developmental_needs, recommended_actions, is_sent_to_trainee, is_signed_by_supervisor,
            supervisor_signature
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, supervisor.Name, 
                resident_id, trainee.Name, 
                indications ?? null, 
                indications_comment ?? null, 
                consent ?? null, 
                consent_comment ?? null, 
                preparation ?? null, 
                preparation_comment ?? null, 
                analgesia ?? null, 
                analgesia_comment ?? null, 
                asepsis ?? null,
                asepsis_comment ?? null, 
                technical_aspects ?? null, 
                technical_aspects_comment ?? null, 
                unexpected_events ?? null, 
                unexpected_events_comment ?? null, 
                documentation ?? null, 
                documentation_comment ?? null,
                communication ?? null, 
                communication_comment ?? null, 
                professionalism ?? null, 
                professionalism_comment ?? null,
                global_summary ?? null, 
                feedback ?? null, 
                strengths ?? null, 
                developmental_needs ?? null, 
                recommended_actions ?? null, 
                draft_send, 
                is_signed_by_supervisor,
                supervisor_signature ?? null
            ]
        );
        
        const formId = result.insertId;

        if (Number(draft_send) === 1) {
          await form_helper.sendFormToTrainee(
            userId,
            "mini_cex",
            formId
          );
        }
        res.status(201).json({ message: "DOPS form created successfully", formId: result.insertId});
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating DOPS form"});
    }
};


const updateDOPS = async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const {
            assessment_date, hospital, indications, indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, procedure_name, previous_attempts, procedure_type, simulated,
            simulation_details, difficulty, feedback, strengths, developmental_needs, 
            recommended_actions, trainee_reflection, draft_send
        } = req.body;

       

        // Fetch form data to check the current signature status
        const [form] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);

        if (form.length === 0) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Fetch user names for notifications
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form[0].supervisor_id]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form[0].resident_id]);

        if (!supervisor || !trainee) {
            return res.status(404).json({ message: "Trainee or Supervisor not found" });
        }

        const hasAccess = await form_helper.auth('Trainee', 'update_dops')(req, res);
        const hasAccessS = await form_helper.auth('Supervisor', 'update_dops')(req, res);
        console.log(hasAccess,hasAccessS,userId);

      // Supervisor Updates (Roles 3, 4, 5)
      if (hasAccessS) {
        if (form[0].is_signed_by_supervisor) {
            return res.status(400).json({ message: "You have already signed this form and cannot edit." });
        }

        let a_signature = form[0].supervisor_signature;

      if (req.files?.signature) {
          const newSignaturePath = req.files.signature[0].path;
          const newSignatureUrl = form_helper.getPublicUrl(newSignaturePath);
  
          await form_helper.deleteOldSignatureIfUpdated(
            "dops",
            id,
            "supervisor_signature",
            newSignatureUrl
          );
  
          a_signature = newSignatureUrl;
        }
        
      supervisor_signature = a_signature;

      const is_signed_by_supervisor = req.files?.signature 
        ? 1 
        : form[0].is_signed_by_supervisor;
            
        const [old_send] = await pool.execute(
            `SELECT is_sent_to_trainee AS sent FROM dops WHERE id = ?`,
            [id]
        );

        const updateQuery = `
            UPDATE dops 
            SET 
                indications = ?, indications_comment = ?, consent = ?, consent_comment = ?, 
                preparation = ?, preparation_comment = ?, analgesia = ?, analgesia_comment = ?, asepsis = ?,
                asepsis_comment = ?, technical_aspects = ?, technical_aspects_comment = ?, 
                unexpected_events = ?, unexpected_events_comment = ?, documentation = ?, documentation_comment = ?,
                communication = ?, communication_comment = ?, professionalism =? , professionalism_comment = ?,
                global_summary = ?, feedback = ?, strengths = ?, developmental_needs = ?, recommended_actions = ?,
                is_sent_to_trainee = ?, is_signed_by_supervisor = ?, supervisor_signature = ?
            WHERE id = ?`;

        const updateValues = [
            indications ?? form[0].indications ?? null, 
            indications_comment ?? form[0].indications_comment ?? null, 
            consent ?? form[0].consent ?? null, 
            consent_comment ?? form[0].consent_comment ?? null,
            preparation ?? form[0].preparation ?? null, 
            preparation_comment ?? form[0].preparation_comment ?? null, 
            analgesia ?? form[0].analgesia ?? null, 
            analgesia_comment ?? form[0].analgesia_comment ?? null,
            asepsis ?? form[0].asepsis ?? null, 
            asepsis_comment ?? form[0].asepsis_comment ?? null, 
            technical_aspects ?? form[0].technical_aspects ?? null, 
            technical_aspects_comment ?? form[0].technical_aspects_comment ?? null,
            unexpected_events ?? form[0].unexpected_events ?? null, 
            unexpected_events_comment ?? form[0].unexpected_events_comment ?? null, 
            documentation ?? form[0].documentation ?? null,
            documentation_comment ?? form[0].documentation_comment ?? null, 
            communication ?? form[0].communication ?? null, 
            communication_comment ?? form[0].communication_comment ?? null, 
            professionalism ?? form[0].professionalism ?? null,
            professionalism_comment ?? form[0].professionalism_comment ?? null, 
            global_summary ?? form[0].global_summary ?? null, 
            feedback ?? form[0].feedback ?? null, 
            strengths ?? form[0].strengths ?? null, 
            developmental_needs ?? form[0].developmental_needs ?? null, 
            recommended_actions ?? form[0].recommended_actions ?? null, 
            draft_send,
            is_signed_by_supervisor,
            supervisor_signature,
            id
        ];


        await pool.execute(updateQuery, updateValues);

        // If form is being sent to trainee for the first time
        if (Number(draft_send) === 1 && Number(old_send[0].sent) === 0) {
            await form_helper.sendFormToTrainee(
                userId,
                "dops",
                id
            );
        }

        return res.status(200).json({ message: "DOPS form updated successfully" });
    }
    
    
        // Trainee Updates (Role 2)
        else if (hasAccess) {
            
            // Ensure the current logged-in trainee is the one assigned to the form
            if (form[0].resident_id !== userId) {
                return res.status(403).json({ message: "You are not the assigned trainee for this form." });
            }

            if (form[0].is_sent_to_trainee !== 1) {
                return res.status(403).json({ error: "Form has not been sent to the trainee yet." });
            }

            if (form[0].is_signed_by_trainee) {
                return res.status(400).json({ message: "You have already signed this form and cannot edit." });
            }
        
            let r_Signature = req.files?.signature
                ? req.files.signature[0].path
                : existingRecord[0].resident_signature;
            const trainee_signature = form_helper.getPublicUrl(r_Signature);


            // Set is_signed_by_trainee flag if new signature is uploaded
            const is_signed_by_trainee = req.files?.signature ? 1 : form.is_signed_by_trainee || 0;

            const updateQuery = `
                UPDATE dops 
                SET 
                    assessment_date = ?, hospital = ?, procedure_name = ?, previous_attempts = ?, procedure_type = ?, simulated = ?,
                    simulation_details = ?, difficulty = ?, trainee_reflection = ?, trainee_signature = ?,
                    is_signed_by_trainee = ?
                WHERE id = ?`;

            const updateValues = [
                assessment_date ?? form[0].evaluation_date ?? null, 
                hospital ?? form[0].hospital ?? null,
                procedure_name ?? form[0].procedure_name ?? null, 
                previous_attempts ?? form[0].previous_attempts ?? null, 
                procedure_type ?? form[0].procedure_type ?? null, 
                simulated ?? form[0].simulated ?? null, 
                simulation_details ?? form[0].simulation_details ?? null, 
                difficulty ?? form[0].difficulty ?? null, 
                trainee_reflection ?? form[0].trainee_reflection ?? null,
                trainee_signature,
                is_signed_by_trainee,
                id
            ];
        
            await pool.execute(updateQuery, updateValues);

            const hasNewSignature = req.files?.signature && !form.is_signed_by_trainee;

            // Notify supervisor if trainee just signed the form
            if (hasNewSignature) {
                await form_helper.sendSignatureToSupervisor(
                    userId,
                    "dops",
                    id
                );
            }

            // Check if both parties have signed and update is_draft if needed
            await checkAndUpdateCompletionStatus(id);

            return res.status(200).json({ message: "DOPS form updated successfully" });
        }else{
            return res.status(403).json({ message: "Permission denied: Only supervisor or trainee can update this form." });
        }

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating DOPS form" });
    }
};

// Helper function to check and update completion status
const checkAndUpdateCompletionStatus = async (formId) => {
    try {
        const [[form]] = await pool.execute(
            "SELECT trainee_signature, supervisor_signature, is_signed_by_trainee, is_signed_by_supervisor FROM dops WHERE id = ?", 
            [formId]
        );
        
        // If both parties have signed, mark the form as completed (is_draft = 0)
        if (form.is_signed_by_trainee && form.is_signed_by_supervisor) {
            await pool.execute(
                "UPDATE dops SET is_draft = 0 WHERE id = ?", 
                [formId]
            );
        }
    } catch (error) {
        console.error("Error checking completion status:", error);
    }
}; 

const getDOPSById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const [result] = await pool.execute(
            `SELECT d.*, u1.Name AS trainee_name, u2.Name AS supervisor_name
             FROM dops d
             JOIN users u1 ON d.resident_id = u1.User_ID
             JOIN users u2 ON d.supervisor_id = u2.User_ID
             WHERE d.id = ?`, 
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "DOPS record not found" });
        }

        const form = result[0];

        res.status(200).json(form);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching DOPS record" });
    }
};

const deleteDOPSById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId} = req.user;

        const [rows] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "DOPS record not found" });
        }

        const record = rows[0]; 

        if (record.supervisor_id !== userId && userId !== 1) {
            return res.status(403).json({
              message:
                "Permission denied: Only the assigned supervisor can delete this record",
            });
          }
          await form_helper.deleteSignatureFilesFromDB(
            "dops",
            id,
            ["trainee_signature", "supervisor_signature"]
          );

        await pool.execute("DELETE FROM dops WHERE id = ?", [id]);
        res.status(200).json({ message: "DOPS record deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting DOPS record" });
    }
};

module.exports = { createDOPS, updateDOPS,  getDOPSById, deleteDOPSById };
