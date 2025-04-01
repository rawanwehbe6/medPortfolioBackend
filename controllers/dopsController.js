const pool = require("../config/db");

//Ensure date is in the format mm/dd/yyyy
const isValidDate = (date) => {
    const regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // MM/DD/YYYY format
    if (!regex.test(date)) return "Invalid date format. Expected MM/DD/YYYY.";

    const [month, day, year] = date.split('/').map(Number); // Convert to numbers

    if (month < 1 || month > 12) return "Invalid month. Must be between 01 and 12.";
    if (day < 1 || day > 31) return "Invalid day. Must be between 01 and 31.";

    // Check valid days in months
    const daysInMonth = {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    };

    // Leap year check for February
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        daysInMonth[2] = 29; // Leap year February has 29 days
    }

    if (day > daysInMonth[month]) return `Invalid day for the given month. ${month} has a maximum of ${daysInMonth[month]} days.`;

    return null; // Date is valid
};

const formatDateToDatabaseFormat = (date) => {
    const [month, day, year] = date.split('/').map(Number); // Split and convert to numbers
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`; // Format as YYYY-MM-DD
};


const createDOPS = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const {
            trainee_id, assessment_date, hospital, indications, consent, preparation, analgesia, asepsis,
            technical_aspects, unexpected_events, documentation, communication, professionalism, global_summary,
            procedure_name, previous_attempts, procedure_type, simulated, simulation_details, difficulty, feedback
        } = req.body;

        if (![3, 4, 5].includes(role)) {
            return res.status(403).json({ message: "Permission denied: Only supervisors can create this form" });
        }

        const [[supervisor]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [userId]);
        const [[trainee]] = await pool.execute("SELECT Name, email FROM users WHERE User_ID = ?", [trainee_id]);

        if (!supervisor || !trainee) {
            return res.status(400).json({ message: "Invalid assessor or trainee ID" });
        }

        const dateValidationResult = isValidDate(assessment_date);
        if (dateValidationResult) {
            return res.status(400).json({ message: dateValidationResult });
        }
    
        // Step 2: Format the date to YYYY-MM-DD for database insertion
        const formattedDate = formatDateToDatabaseFormat(assessment_date);

        const assessor_signature = req.files?.signature ? req.files.signature[0].path : null;

        await pool.execute(
            `INSERT INTO dops 
            (supervisor_id, supervisor_name, trainee_id, trainee_name, assessment_date, hospital, indications, consent, 
            preparation, analgesia, asepsis, technical_aspects, unexpected_events, documentation, communication, professionalism, 
            global_summary, procedure_name, previous_attempts, procedure_type, simulated, simulation_details, difficulty, 
            feedback, assessor_signature, is_signed_by_assessor, is_signed_by_trainee) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
            [
                userId, supervisor.Name, trainee_id, trainee.Name, formattedDate, hospital, indications, consent,
                preparation, analgesia, asepsis, technical_aspects, unexpected_events, documentation, communication,
                professionalism, global_summary, procedure_name, previous_attempts, procedure_type, simulated,
                simulation_details, difficulty, feedback, assessor_signature
            ]
        );

        const [[traineeEmail]] = await pool.execute("SELECT email FROM users WHERE User_ID = ?", [trainee_id]);
        if (traineeEmail?.email) {
            await sendEmailNotification(traineeEmail.email);  // Send email to trainee
        }

        res.status(201).json({ message: "DOPS form created and signed by supervisor" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while creating DOPS form" });
    }
};

const nodemailer = require("nodemailer");

const sendEmailNotification = async (traineeEmail) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // or another email service you prefer
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: traineeEmail, // recipient
        subject: "Your DOPS Form Has Been Filled and Signed",
        text: "Hello, your supervisor has filled and signed your DOPS form. Please review and complete your part.",
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent to trainee successfully.");
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

const updateDOPS = async (req, res) => {
    try {
        const { role, userId } = req.user;
        const { id } = req.params;
        const {
            trainee_reflection, strengths, developmental_needs, recommended_actions,
            assessment_date, hospital, indications, consent, preparation, analgesia, asepsis,
            technical_aspects, unexpected_events, documentation, communication, professionalism,
            global_summary, procedure_name, previous_attempts, procedure_type, simulated,
            simulation_details, difficulty, feedback
        } = req.body;

        // Fetch the DOPS record
        const [records] = await pool.execute("SELECT * FROM dops WHERE id = ?", [id]);
        if (records.length === 0) return res.status(404).json({ error: "DOPS record not found" });

        const record = records[0];

        // Fetch Trainee and Supervisor Names
        const [[supervisor]] = await pool.execute("SELECT Name, Email FROM users WHERE User_ID = ?", [userId]);
        const [[trainee]] = await pool.execute("SELECT Name, Email FROM users WHERE User_ID = ?", [record.trainee_id]);

        if (!trainee) return res.status(404).json({ message: "Trainee not found" });
        if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });

        let traineeSignature = record.trainee_signature;
        let assessorSignature = record.assessor_signature;

        // Supervisors can edit everything until they sign
        if ([3, 4, 5].includes(role)) {
            if (record.is_signed_by_assessor) {
                return res.status(400).json({ message: "Supervisor has already signed this form and cannot update it" });
            }

            // If the supervisor provides a signature in the update, mark as signed
            if (req.files?.signature) {
                assessorSignature = req.files.signature[0].path;
            }

            await pool.execute(
                `UPDATE dops 
                 SET trainee_reflection = ?, strengths = ?, developmental_needs = ?, recommended_actions = ?, 
                     assessment_date = ?, hospital = ?, indications = ?, consent = ?, preparation = ?, analgesia = ?, 
                     asepsis = ?, technical_aspects = ?, unexpected_events = ?, documentation = ?, communication = ?, 
                     professionalism = ?, global_summary = ?, procedure_name = ?, previous_attempts = ?, procedure_type = ?, 
                     simulated = ?, simulation_details = ?, difficulty = ?, feedback = ?, 
                     assessor_signature = ?, is_signed_by_assessor = ?
                 WHERE id = ?`,
                [
                    trainee_reflection, strengths, developmental_needs, recommended_actions,
                    assessment_date, hospital, indications, consent, preparation, analgesia,
                    asepsis, technical_aspects, unexpected_events, documentation, communication,
                    professionalism, global_summary, procedure_name, previous_attempts, procedure_type,
                    simulated, simulation_details, difficulty, feedback,
                    assessorSignature, assessorSignature ? true : record.is_signed_by_assessor,
                    id
                ]
            );

            // Notify trainee when supervisor signs
            if (assessorSignature) {
                await sendEmailNotification(trainee.Email, "DOPS Form Signed by Supervisor", 
                    `Dear ${trainee.Name}, your supervisor ${supervisor.Name} has signed the DOPS form.`);
            }

            return res.status(200).json({ message: "DOPS form updated successfully by supervisor" });
        }

        // Trainee can only update specific fields
        if (role === 2) {
            if (!record.is_signed_by_assessor) {
                return res.status(400).json({ message: "You cannot update this form until the supervisor has signed it" });
            }

            // If the trainee provides a signature in the update, mark as signed
            if (req.files?.signature) {
                traineeSignature = req.files.signature[0].path;
            }

            await pool.execute(
                `UPDATE dops 
                 SET trainee_reflection = ?, strengths = ?, developmental_needs = ?, recommended_actions = ?, 
                     trainee_signature = ?, is_signed_by_trainee = ?
                 WHERE id = ?`,
                [
                    trainee_reflection, strengths, developmental_needs, recommended_actions,
                    traineeSignature, traineeSignature ? true : record.is_signed_by_trainee,
                    id
                ]
            );

            // Notify supervisor when trainee signs
            if (traineeSignature) {
                await sendEmailNotification(supervisor.Email, "DOPS Form Signed by Trainee", 
                    `Dear ${supervisor.Name}, the trainee ${trainee.Name} has signed the DOPS form.`);
            }

            return res.status(200).json({ message: "DOPS form updated successfully by trainee" });
        }

        return res.status(403).json({ message: "Permission denied" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while updating DOPS form" });
    }
};


const getDOPSById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, userId } = req.user;

        const [result] = await pool.execute(
            `SELECT d.*, u1.Name AS trainee_name, u2.Name AS assessor_name
             FROM dops d
             JOIN users u1 ON d.trainee_id = u1.id
             JOIN users u2 ON d.assessor_id = u2.id
             WHERE d.id = ?`, 
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "DOPS record not found" });
        }

        const form = result[0];

        if (role !== 1 && form.trainee_id !== userId && form.assessor_id !== userId) {
            return res.status(403).json({ message: "Permission denied: You are not authorized to view this DOPS record" });
        }

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

        if (record.assessor_id !== userId && role !== 1) {
            return res.status(403).json({ message: "Permission denied: Only the assessor or an admin can delete this DOPS record" });
        }

        await pool.execute("DELETE FROM dops WHERE id = ?", [id]);
        res.status(200).json({ message: "DOPS record deleted successfully" });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while deleting DOPS record" });
    }
};

module.exports = { createDOPS, updateDOPS, getDOPSById, deleteDOPSById };
