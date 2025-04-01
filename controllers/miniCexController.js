const pool = require("../config/db");
const moment = require("moment");

const createMiniCEX = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const {
            medical_interviewing, physical_exam, professionalism, clinical_judgment,
            counseling_skills, efficiency, overall_competence, observer_time, feedback_time,
            evaluator_satisfaction, trainee_id
        } = req.body;

        if (![3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied: Only supervisors can create this form" });
        }

        // Fetch supervisor name
        const [[supervisor]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [userId]);
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [trainee_id]);

        if (!supervisor) {
            return res.status(400).json({ message: "Invalid supervisor ID" });
        }

        // Insert the new Mini-CEX form into the database
        const [result] = await pool.execute(
            `INSERT INTO mini_cex 
            (supervisor_id, supervisor_name, trainee_id, trainee_name, medical_interviewing, physical_exam, 
            professionalism, clinical_judgment, counseling_skills, efficiency, overall_competence, 
            observer_time, feedback_time, evaluator_satisfaction, sent_to_trainee) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, supervisor.Name, trainee_id, trainee.Name, medical_interviewing, physical_exam, 
                professionalism, clinical_judgment, counseling_skills, efficiency, overall_competence,
                observer_time, feedback_time, evaluator_satisfaction, 0 // Initially not sent
            ]
        );

        res.status(201).json({ message: "Mini-CEX form created successfully", formId: result.insertId });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating Mini-CEX form" });
    }
};


const sendMiniCEXToTrainee = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { formId } = req.params; // The Mini-CEX form ID

        /*
        // Debug logs for formId and userId
        console.log("Form ID:", formId);
        console.log("User ID:", userId);
        */
       
        // Ensure both formId and userId are valid
        if (!formId || !userId) {
            return res.status(400).json({ message: "Missing required parameters: formId or userId." });
        }
        
        if (![3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied: Only supervisors can send forms to trainees" });
        }

        // Check if form exists and belongs to the supervisor
        const [[form]] = await pool.execute("SELECT trainee_id FROM mini_cex WHERE id = ? AND supervisor_id = ?", [formId, userId]);

        if (!form) {
            return res.status(404).json({ message: "Form not found or permission denied" });
        }

         /*
         // Debug logs
         console.log("Form Retrieved:", form);
         console.log("User ID:", userId);
         console.log("Trainee ID:", form.trainee_id);
         */

         // Ensure form.trainee_id and userId are not undefined before proceeding
         if (form.trainee_id === undefined || userId === undefined) {
            return res.status(400).json({ message: "Missing required parameters: trainee_id or userId." });
        }

        // Update the form to mark it as sent
        await pool.execute("UPDATE mini_cex SET sent_to_trainee = 1 WHERE id = ?", [formId]);

        // Send in-app notification to the trainee
        await pool.execute(
            "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
            [form.trainee_id, userId, "Your Mini-CEX form has been sent to you for review."]
        );

        res.status(200).json({ message: "Form sent to trainee successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while sending Mini-CEX form to trainee" });
    }
};


const updateMiniCEX = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;
        const {
            resident_level, evaluation_date, setting, patient_problem, patient_age, patient_sex, patient_type, complexity,
            medical_interviewing, physical_exam, professionalism, clinical_judgment,
            counseling_skills, efficiency, overall_competence, observer_time, feedback_time,
            evaluator_satisfaction, resident_satisfaction, comments, focus
        } = req.body;

        const safeValue = (value) => value === undefined ? null : value; 

        // Fetch form data to check the current signature status
        const [[form]] = await pool.execute("SELECT * FROM mini_cex WHERE id = ?", [id]);

        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Fetch user names for notifications
        const [[supervisor]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [form.supervisor_id]);
        const [[trainee]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [form.trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(404).json({ message: "Trainee or Supervisor not found" });
        }

        // Supervisor Updates (Roles 3, 4, 5)
        if ([3, 4, 5].includes(role)) {
            if (form.is_signed_by_supervisor) {
                return res.status(400).json({ message: "You have already signed this form and cannot edit." });
            }

            const updateQuery = `
                UPDATE mini_cex 
                SET 
                    medical_interviewing = ?, physical_exam = ?, professionalism = ?, clinical_judgment = ?, 
                    counseling_skills = ?, efficiency = ?, overall_competence = ?, observer_time = ?, 
                    feedback_time = ?, evaluator_satisfaction = ?
                WHERE id = ?`;

            const updateValues = [
                safeValue(medical_interviewing), safeValue(physical_exam), safeValue(professionalism), safeValue(clinical_judgment), safeValue(counseling_skills),
                safeValue(efficiency), safeValue(overall_competence), safeValue(observer_time), safeValue(feedback_time), safeValue(evaluator_satisfaction), id
            ];



            await pool.execute(updateQuery, updateValues);
            return res.status(200).json({ message: "Mini-CEX form updated successfully" });
        }

        // Trainee Updates (Role 2)
        if (role === 2) {
            
            // Ensure the current logged-in trainee is the one assigned to the form
            if (form.trainee_id !== userId) {
                return res.status(403).json({ message: "You are not the assigned trainee for this form." });
            }

            if (form.sent_to_trainee !== 1) {
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
                UPDATE mini_cex 
                SET 
                    resident_level = ?, evaluation_date = ?, setting = ?, patient_problem = ?, 
                    patient_age = ?, patient_sex = ?, patient_type = ?, complexity = ?,
                    resident_satisfaction = ?, comments = ?, focus = ?
                WHERE id = ?`;

            const updateValues = [
                safeValue(resident_level), formattedDate, safeValue(setting),
                safeValue(patient_problem), safeValue(patient_age), safeValue(patient_sex), 
                safeValue(patient_type), safeValue(complexity), safeValue(resident_satisfaction), 
                safeValue(comments), safeValue(focus), id
            ];


        
            await pool.execute(updateQuery, updateValues);
            return res.status(200).json({ message: "Mini-CEX form updated successfully" });
        }

        return res.status(403).json({ message: "Permission denied: Only supervisor or trainee can update this form." });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating Mini-CEX form." });
    }
};

// Signing Function (Separate API)
const signMiniCEX = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;

        // Fetch form data
        const [[form]] = await pool.execute("SELECT * FROM mini_cex WHERE id = ?", [id]);

        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Fetch user names for notifications
        const [[supervisor]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [form.supervisor_id]);
        const [[trainee]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [form.trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(404).json({ message: "Trainee or Supervisor not found" });
        }

        // 🔹 Trainee Signs First
        if (role === 2) {
            if (form.is_signed_by_trainee) {
                return res.status(400).json({ message: "You have already signed this form." });
            }

            //const trainee_signature_path = req.file ? req.files.path : null;
            
            // Ensure signature is uploaded before processing
            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ message: "Signature file is required for trainee." });
            }

            // Get the signature file path
            const trainee_signature_path = req.files.signature[0].path;

            await pool.execute(`
                UPDATE mini_cex 
                SET trainee_signature_path = ?, is_signed_by_trainee = TRUE 
                WHERE id = ?`, 
                [trainee_signature_path, id]
            );

            // Notify Supervisor
            await pool.execute(`
                INSERT INTO notifications (user_id, sender_id, message) 
                VALUES (?, ?, ?)`, 
                [form.supervisor_id, userId, "Your trainee has signed the Mini-CEX form."]
            );

            return res.status(200).json({ message: "Mini-CEX form signed by trainee." });
        }

        // 🔹 Supervisor Signs Last
        if ([3, 4, 5].includes(role)) {
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
            const evaluator_signature_path = req.files.signature[0].path;
            
            await pool.execute(`
                UPDATE mini_cex 
                SET evaluator_signature_path = ?, is_signed_by_supervisor = TRUE 
                WHERE id = ?`, 
                [evaluator_signature_path, id]
            );

            // 🔹 After Supervisor Signs, update is_draft to 0
            await pool.execute(`
                UPDATE mini_cex 
                SET is_draft = 0 
                WHERE id = ?`, 
                [id]
            );

            // Notify Trainee
            await pool.execute(`
                INSERT INTO notifications (user_id, sender_id, message) 
                VALUES (?, ?, ?)`, 
                [form.trainee_id, userId, "Your supervisor has signed the Mini-CEX form."]
            );

            return res.status(200).json({ message: "Mini-CEX form signed by supervisor." });
        }

        return res.status(403).json({ message: "Permission denied: Only supervisor or trainee can sign this form." });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while signing Mini-CEX form." });
    }
};


const getMiniCEXById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        const [result] = await pool.execute(
            `SELECT mc.*, 
                    u1.Name AS trainee_name, 
                    u2.Name AS supervisor_name
             FROM mini_cex mc
             JOIN users u1 ON mc.trainee_id = u1.User_ID
             JOIN users u2 ON mc.supervisor_id = u2.User_ID
             WHERE mc.id = ?`,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "Mini-CEX form not found" });
        }

        const form = result[0];

        // Check if the user is the supervisor or trainee assigned to the form
        if (role !== 1 && form.supervisor_id !== userId && form.trainee_id !== userId) {
            return res.status(403).json({ message: "Permission denied: You can only view forms assigned to you." });
        }

        res.status(200).json(form);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Error fetching Mini-CEX form" });
    }
};

const deleteMiniCEXById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const [rows] = await pool.execute("SELECT * FROM mini_cex WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Mini-CEX record not found" });
        }

        const record = rows[0];

        // Allow only the supervisor who created the form or an admin to delete it
        if (record.supervisor_id !== userId && role !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the evaluator or an admin can delete this Mini-CEX record." });
        }

        await pool.execute("DELETE FROM mini_cex WHERE id = ?", [id]);
        res.status(200).json({ message: "Mini-CEX record deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting Mini-CEX record" });
    }
};


module.exports = { createMiniCEX, sendMiniCEXToTrainee, updateMiniCEX, signMiniCEX, getMiniCEXById, deleteMiniCEXById};
