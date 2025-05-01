const pool = require("../config/db");
const moment = require("moment");
const form_helper = require('../middleware/form_helper');

const createDOPS = async (req, res) => {
    try {
        const { /*role,*/ userId } = req.user;
        const {
            trainee_id, indications, indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, feedback, strengths, developmental_needs, recommended_actions,
            
        } = req.body;

        /*if (![3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied: Only supervisors can create this form" });
        }*/

        // Fetch supervisor and trainee names
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [userId]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(400).json({ message: "Invalid assessor or trainee ID" });
        }
        
        // insert new dops form into database
        const [result] = await pool.execute(
            `INSERT INTO dops 
            (supervisor_id, supervisor_name, trainee_id, trainee_name, indications, 
            indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, feedback, strengths, developmental_needs, recommended_actions, is_draft, is_sent_to_trainee
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, supervisor.Name, trainee_id, trainee.Name, indications, indications_comment, consent, consent_comment, 
                preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
                asepsis_comment, technical_aspects, technical_aspects_comment, 
                unexpected_events, unexpected_events_comment, documentation, documentation_comment,
                communication, communication_comment, professionalism, professionalism_comment,
                global_summary, feedback, strengths, developmental_needs, recommended_actions, 1, 0
            ]
        );
        

        res.status(201).json({ message: "DOPS form created successfully", formId: result.insertId});
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating DOPS form"});
    }
};

const sendDOPSToTrainee = async (req, res) => {
    try{
        const { role, userId } = req.user;
        const { formId } = req.params;

        // Ensure both formId and userId are valid
        if (!formId || !userId) {
            return res.status(400).json({ message: "Missing required parameters: formId or userId." });
        }

        if (![3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied: Only supervisors can send forms to trainees" });
        }

        // Check if form exists and belongs to the supervisor
        const [[form]] = await pool.execute("SELECT trainee_id FROM dops WHERE id = ? AND supervisor_id = ?", [formId, userId]);

        if (!form) {
            return res.status(404).json({ message: "Form not found or permission denied" });
        }

        // Ensure form.trainee_id and userId are not undefined before proceeding
        if (form.trainee_id === undefined || userId === undefined) {
            return res.status(400).json({ message: "Missing required parameters: trainee_id or userId." });
        }

        // Update the form to mark it as sent
        await pool.execute("UPDATE dops SET is_sent_to_trainee = 1 WHERE id = ?", [formId]);

        // Send in-app notification to the trainee
        await pool.execute(
            "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
            [form.trainee_id, userId, "Your DOPS form has been sent to you for review."]
        );

        res.status(200).json({ message: "Form sent to trainee successfully" });

    }catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while sending Mini-CEX form to trainee" });
    }
};

const updateDOPS = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;
        const {
            assessment_date, hospital, indications, indications_comment, consent, consent_comment, 
            preparation, preparation_comment, analgesia, analgesia_comment, asepsis,
            asepsis_comment, technical_aspects, technical_aspects_comment, 
            unexpected_events, unexpected_events_comment, documentation, documentation_comment,
            communication, communication_comment, professionalism, professionalism_comment,
            global_summary, procedure_name, previous_attempts, procedure_type, simulated,
            simulation_details, difficulty, feedback, strengths, developmental_needs, 
            recommended_actions, trainee_reflection
        } = req.body;

        const safeValue = (value) => value === undefined ? null : value;

        // Fetch form data to check the current signature status
        const [[form]] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);

        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Fetch user names for notifications
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form.supervisor_id]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form.trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(404).json({ message: "Trainee or Supervisor not found" });
        }

        const hasAccess = await form_helper.auth('Trainee', 'update_dops')(req, res);
        const hasAccessS = await form_helper.auth('Supervisor', 'update_dops')(req, res);
        console.log(hasAccess,hasAccessS,userId);

      // Supervisor Updates (Roles 3, 4, 5)
      if (hasAccessS) {
        if (form.is_signed_by_supervisor) {
            return res.status(400).json({ message: "You have already signed this form and cannot edit." });
        }

        const updateQuery = `
            UPDATE dops 
            SET 
                indications = ?, indications_comment = ?, consent = ?, consent_comment = ?, 
                preparation = ?, preparation_comment = ?, analgesia = ?, analgesia_comment = ?, asepsis = ?,
                asepsis_comment = ?, technical_aspects = ?, technical_aspects_comment = ?, 
                unexpected_events = ?, unexpected_events_comment = ?, documentation = ?, documentation_comment = ?,
                communication = ?, communication_comment = ?, professionalism =? , professionalism_comment = ?,
                global_summary = ?, feedback = ?, strengths = ?, developmental_needs = ?, recommended_actions = ?
            WHERE id = ?`;

        const updateValues = [
            safeValue(indications), safeValue(indications_comment), safeValue(consent), safeValue(consent_comment),
            safeValue(preparation), safeValue(preparation_comment), safeValue(analgesia), safeValue(analgesia_comment),
            safeValue(asepsis), safeValue(asepsis_comment), safeValue(technical_aspects), safeValue(technical_aspects_comment),
            safeValue(unexpected_events), safeValue(unexpected_events_comment), safeValue(documentation),
            safeValue(documentation_comment), safeValue(communication), safeValue(communication_comment), safeValue(professionalism),
            safeValue(professionalism_comment), safeValue(global_summary), safeValue(feedback), safeValue(strengths), 
            safeValue(developmental_needs), safeValue(recommended_actions), id
        ];


        await pool.execute(updateQuery, updateValues);
        return res.status(200).json({ message: "DOPS form updated successfully" });
    }
    
    
        // Trainee Updates (Role 2)
        else if (hasAccess) {
            
            // Ensure the current logged-in trainee is the one assigned to the form
            if (form.trainee_id !== userId) {
                return res.status(403).json({ message: "You are not the assigned trainee for this form." });
            }

            if (form.is_sent_to_trainee !== 1) {
                return res.status(403).json({ error: "Form has not been sent to the trainee yet." });
            }

            if (form.is_signed_by_trainee) {
                return res.status(400).json({ message: "You have already signed this form and cannot edit." });
            }
            
            // Check if evaluation_date exists and is valid
            let formattedDate = null;
            if (req.body.evaluation_date) {
                const parsedDate = moment(req.body.evaluation_date, ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"], true);
    
                if (parsedDate.isValid()) {
                formattedDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");
                } else {
                    return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY." });
                }
            }
        

            const updateQuery = `
                UPDATE dops 
                SET 
                    assessment_date = ?, hospital = ?, procedure_name = ?, previous_attempts = ?, procedure_type = ?, simulated = ?,
                    simulation_details = ?, difficulty = ?, trainee_reflection = ?
                WHERE id = ?`;

            const updateValues = [
                formattedDate, safeValue(hospital),
                safeValue(procedure_name), safeValue(previous_attempts), safeValue(procedure_type), 
                safeValue(simulated), safeValue(simulation_details), safeValue(difficulty), 
                safeValue(trainee_reflection), id
            ];


        
            await pool.execute(updateQuery, updateValues);
            return res.status(200).json({ message: "DOPS form updated successfully" });
        }else{
            return res.status(403).json({ message: "Permission denied: Only supervisor or trainee can update this form." });
        }

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating DOPS form" });
    }
};

const signDOPS = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        // Fetch form data
        const [[form]] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);

        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Fetch user names for notifications
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form.supervisor_id]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [form.trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(404).json({ message: "Trainee or Supervisor not found" });
        }

        const hasAccess = await form_helper.auth('Trainee', 'sign_dops')(req, res);
        const hasAccessS = await form_helper.auth('Supervisor', 'sign_dops')(req, res);
        console.log(hasAccess,hasAccessS,userId);

        // 🔹 Trainee Signs First
        if (hasAccess) {
            if (form.is_signed_by_trainee) {
                return res.status(400).json({ message: "You have already signed this form." });
            }

            
            // Ensure signature is uploaded before processing
            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ message: "Signature file is required for trainee." });
            }

            // Get the signature file path
            const trainee_signature = req.files.signature[0].path;

            await pool.execute(`
                UPDATE dops 
                SET trainee_signature = ?, is_signed_by_trainee = TRUE 
                WHERE id = ?`, 
                [trainee_signature, id]
            );

            // Notify Supervisor
            await pool.execute(`
                INSERT INTO notifications (user_id, sender_id, message) 
                VALUES (?, ?, ?)`, 
                [form.supervisor_id, userId, "Your trainee has signed the DOPS form."]
            );

            return res.status(200).json({ message: "DOPS form signed by trainee." });
        }

        // 🔹 Supervisor Signs Last
        else if (hasAccessS) {
            if (!form.is_signed_by_trainee) {
                return res.status(400).json({ message: "The trainee must sign before you can sign." });
            }

            if (form.is_signed_by_supervisor) {
                return res.status(400).json({ message: "You have already signed this form." });
            }

            //const evaluator_signature_path = req.file ? req.files.path : null;

            // Ensure supervisor signature is uploaded
            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ message: "Signature file is required for supervisor." });
            }

            // Get the supervisor's signature file path
            const supervisor_signature = req.files.signature[0].path;
            
            await pool.execute(`
                UPDATE dops 
                SET supervisor_signature = ?, is_signed_by_supervisor = TRUE 
                WHERE id = ?`, 
                [supervisor_signature, id]
            );

            // 🔹 After Supervisor Signs, update is_draft to 0
            await pool.execute(`
                UPDATE dops 
                SET is_draft = 0 
                WHERE id = ?`, 
                [id]
            );

            // Notify Trainee
            await pool.execute(`
                INSERT INTO notifications (user_id, sender_id, message) 
                VALUES (?, ?, ?)`, 
                [form.trainee_id, userId, "Your supervisor has signed the DOPS form."]
            );

            return res.status(200).json({ message: "DOPS form signed by supervisor." });
        } else{
            return res.status(403).json({ message: "Permission denied: Only supervisor or trainee can sign this form." });
        } 
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while signing DOPS form." });
    }
};

const getDOPSById = async (req, res) => {
    try {
        const { id } = req.params;
        const { /*role,*/ userId } = req.user;

        const [result] = await pool.execute(
            `SELECT d.*, u1.Name AS trainee_name, u2.Name AS supervisor_name
             FROM dops d
             JOIN users u1 ON d.trainee_id = u1.User_ID
             JOIN users u2 ON d.supervisor_id = u2.User_ID
             WHERE d.id = ?`, 
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "DOPS record not found" });
        }

        const form = result[0];

        /*if (role !== 1 && form.trainee_id !== userId && form.supervisor_id !== userId) {
            return res.status(403).json({ message: "Permission denied: You are not authorized to view this DOPS record" });
        }*/

        res.status(200).json(form);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching DOPS record" });
    }
};

const deleteDOPSById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const [rows] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "DOPS record not found" });
        }

        const record = rows[0]; 

        if (record.supervisor_id !== userId && role !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the assessor or an admin can delete this DOPS record" });
        }

        await pool.execute("DELETE FROM dops WHERE id = ?", [id]);
        res.status(200).json({ message: "DOPS record deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting DOPS record" });
    }
};

module.exports = { createDOPS, sendDOPSToTrainee, updateDOPS, signDOPS, getDOPSById, deleteDOPSById };