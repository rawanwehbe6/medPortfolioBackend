const pool = require("../config/db");
const form_helper = require('../middleware/form_helper');
const createForm = async (req, res) => {
    try {
        const { role } = req.user;
        supervisor_id=req.user.userId;
        const {
            resident_id,  diagnosis, case_complexity, history_taking,
            physical_examination, provisional_diagnosis, treatment, future_planning, assessor_comment,draft_send
        } = req.body;

        const assessor_signature = req.files?.signature ? req.files.signature[0].path : null;
        console.log(assessor_signature);

        const [insertResult] = await pool.execute(
        `INSERT INTO grand_round_presentation_assessment 
        (resident_id, supervisor_id, diagnosis, case_complexity, history_taking, 
        physical_examination, provisional_diagnosis, treatment, future_planning, 
        assessor_comment, assessor_signature, sent) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            resident_id, supervisor_id, diagnosis, case_complexity, history_taking,
            physical_examination, provisional_diagnosis, treatment, future_planning,
            assessor_comment, assessor_signature, draft_send
        ]);

        const formId = insertResult.insertId; // Get the newly inserted form ID
        console.log(draft_send);
        if (Number(draft_send) === 1) {
          console.log("sending");
            await form_helper.sendFormToTrainee(supervisor_id, "grand_round_presentation_assessment",formId);
        }
        
        res.status(201).json({ message: "Form created successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating form" });
    }
};


const updateForm = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        // Extract form fields from request body
        const {
            diagnosis, case_complexity, history_taking, physical_examination,
            provisional_diagnosis, treatment, future_planning, assessor_comment, resident_comment ,draft_send
        } = req.body;

        const [existingRecord] = await pool.execute(
            `SELECT * FROM grand_round_presentation_assessment WHERE id = ?`,
            [id]
        );

        if (existingRecord.length === 0) {
            return res.status(404).json({ error: "Record not found" });
        }

        let updateQuery = "";
        let updateValues = [];
        console.log(req.user);
        const hasAccess = await form_helper.auth('Trainee', 'update_grpa_form')(req, res);
        const hasAccessS = await form_helper.auth('Supervisor', 'update_grpa_form')(req, res);
        if (hasAccess) {  
            // 🟢 Resident can ONLY update their comment and signature
            if (existingRecord[0].resident_id !== userId) {
                return res.status(403).json({ message: "Unauthorized access" });
            }

            let residentSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].resident_signature;


            const [old_send] =await pool.execute(
            `SELECT resident_signature FROM grand_round_presentation_assessment WHERE id = ?`,
            [id]
            ); 
            

            updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET resident_comment = ?, resident_signature = ? ,completed = ?
                           WHERE id = ?`;
            updateValues = [resident_comment, residentSignature, 1 , id];


            if(old_send[0].resident_signature===null)
            await form_helper.sendSignatureToSupervisor(userId, "grand_round_presentation_assessment",id);
            


        } else if (hasAccessS) {  
            // 🟢 Supervisor can update all fields EXCEPT resident_comment and resident_signature
            let assessorSignature = req.files?.signature ? req.files.signature[0].path : existingRecord[0].assessor_signature;


            const [old_send] =await pool.execute(
            `SELECT sent FROM grand_round_presentation_assessment WHERE id = ?`,
            [id]
        ); 


            updateQuery = `UPDATE grand_round_presentation_assessment 
                           SET diagnosis = ?, case_complexity = ?, history_taking = ?, 
                               physical_examination = ?, provisional_diagnosis = ?, 
                               treatment = ?, future_planning = ?, assessor_comment = ?, 
                               assessor_signature = ?, sent = ?
                           WHERE id = ?`;
            updateValues = [
                diagnosis, case_complexity, history_taking, physical_examination,
                provisional_diagnosis, treatment, future_planning, assessor_comment,
                assessorSignature, draft_send, id 
            ];


            if (Number(draft_send) === 1&& Number(old_send[0].sent)=== 0) {

              await form_helper.sendFormToTrainee(userId, "grand_round_presentation_assessment",id);
            }


            } else {
            return res.status(403).json({ message: "Permission denied" });
            }

        await pool.execute(updateQuery, updateValues);

        res.status(200).json({ message: "Form updated successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating form" });
    }
};


const getTupleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch tuple by ID with resident name
    const [result] = await pool.execute(
      `SELECT 
         u.Name AS resident_name,
         u_a.Name AS supervisor_name,
         gra.date,
         gra.diagnosis,
         gra.case_complexity,
         gra.history_taking,
         gra.physical_examination,
         gra.provisional_diagnosis,
         gra.treatment,
         gra.future_planning,
         gra.assessor_comment AS supervisor_comment,
         gra.resident_comment,
         gra.resident_signature,
         gra.assessor_signature AS supervisor_signature
       FROM grand_round_presentation_assessment gra
       JOIN users u ON gra.resident_id = u.User_ID
       JOIN users u_a ON gra.supervisor_id = u_a.User_ID
       WHERE gra.id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Tuple not found" });
    }

    res.status(200).json(result[0]); // Return as JSON object
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while fetching tuple" });
  }
};

const deleteTupleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Fetch tuple to check supervisor_id
    const [result] = await pool.execute(
      "SELECT * FROM grand_round_presentation_assessment WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "Tuple not found" });
    }

    // Check if the logged-in user is the supervisor
    if (result[0].supervisor_id !== userId && userId!== 1) {
      return res.status(403).json({ message: "Permission denied: Only the assigned supervisor can delete this record" });
    }

    // Delete the tuple
    await pool.execute("DELETE FROM grand_round_presentation_assessment WHERE id = ?", [id]);

    res.status(200).json({ message: "Tuple deleted successfully" });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error while deleting tuple" });
  }
};

module.exports = { createForm, updateForm, getTupleById, deleteTupleById };
