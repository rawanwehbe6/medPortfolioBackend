const pool = require("../config/db");

// Create logbook profile (POST)
const createLogbookProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 2) {
      return res.status(403).json({ message: "Only trainees can fill profile info." });
    }

    const { resident_name, traineeId, academic_year, email, mobile_no } = req.body;

    // Check if profile already exists
    const [existing] = await pool.execute(
      "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Profile already exists. Use update instead." });
    }

    await pool.execute(
      `INSERT INTO logbook_profile_info 
       (trainee_id, resident_name, academic_year, email, mobile_no) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, resident_name, academic_year, email, mobile_no]
    );

    res.status(201).json({ message: "Logbook profile created successfully." });
  } catch (err) {
    console.error("Error creating logbook profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update logbook profile (PUT)
const updateLogbookProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 2) {
      return res.status(403).json({ message: "Only trainees can update profile info." });
    }

    const { resident_name, traineeId, academic_year, email, mobile_no } = req.body;

    const [existing] = await pool.execute(
      "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Profile not found. Please create it first." });
    }

    await pool.execute(
      `UPDATE logbook_profile_info 
       SET resident_name= ?, academic_year = ?, email = ?, mobile_no = ?
       WHERE trainee_id = ?`,
      [resident_name, academic_year, email, mobile_no, userId]
    );

    res.status(200).json({ message: "Logbook profile updated successfully." });
  } catch (err) {
    console.error("Error updating logbook profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLogbookProfileInfo = async (req, res) => {
    try {
      const { userId } = req.user; // trainee's ID from token
  
      const [rows] = await pool.execute(
        `SELECT trainee_id, resident_name, academic_year, email, mobile_no
         FROM logbook_profile_info
         WHERE trainee_id = ?`,
        [userId]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({ message: "No profile info found for this trainee." });
      }
  
      res.status(200).json(rows[0]);
    } catch (err) {
      console.error("Error fetching logbook profile info:", err);
      res.status(500).json({ error: "Server error while fetching profile info." });
    }
  };

// Get profile info with image (GET)
const getLogbookProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
    
        if (role !== 2) {
          return res.status(403).json({ message: "Only trainees can access their profile picture." });
        }
    
        const [rows] = await pool.execute(
          `SELECT id, image_path as imagePath
           FROM trainee_portfolio_images 
           WHERE trainee_id = ?`,
          [userId]
        );
    
        if (!rows || rows.length === 0) {
          return res.status(404).json({ message: "Profile picture not found." });
        }
    
        res.status(200).json({ image: rows[0] });
      } catch (err) {
        console.error("Error fetching profile picture:", err);
        res.status(500).json({ message: "Server error while fetching profile picture." });
      }
};

module.exports = {
  createLogbookProfile,
  updateLogbookProfile,
  getLogbookProfileInfo,
  getLogbookProfile,
};
/*/ Logbook Signing Route
router.post("/logbook/certificate/:trainee_id/:hospital_id", upload.single("signature"), signLogbookCertificate);
router.get("/logbook/certificate/:trainee_id/:hospital_id", getCertificateSignature);
*/
/*const signLogbookCertificate = async (req, res) => {
    try {
        const { role, userId } = req.user; // extracts userId from token
        const { trainee_id, hospital_id } = req.params;

        // Fetch certificate data
        const [[certificate]] = await pool.execute(
            "SELECT * FROM logbook_certificates WHERE trainee_id = ? AND hospital_id = ?",
            [trainee_id, hospital_id]
        );

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Fetch user names for notifications
        const [[trainee]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [trainee_id]);
        const [[hospital]] = await pool.execute("SELECT Name FROM users WHERE User_ID = ?", [hospital_id]);

        if (!trainee || !hospital) {
            return res.status(404).json({ message: "Trainee or Hospital not found" });
        }

        // 🔹 **Trainee Signs First**
        if (role === 2) {
            if (certificate.trainee_signature) {
                return res.status(400).json({ message: "You have already signed this certificate." });
            }

            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ message: "Signature file is required for trainee." });
            }

            const trainee_signature_path = req.files.signature[0].path;

            await pool.execute(
                "UPDATE logbook_certificates SET trainee_signature = ? WHERE trainee_id = ? AND hospital_id = ?",
                [trainee_signature_path, trainee_id, hospital_id]
            );

            // Notify Hospital Admin
            await pool.execute(
                "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
                [hospital_id, userId, "A trainee has signed the logbook certificate."]
            );

            return res.status(200).json({ message: "Logbook certificate signed by trainee." });
        }

        // 🔹 **Hospital Signs Last**
        if (role === 6) { // Assuming role 6 is for hospitals
            if (!certificate.trainee_signature) {
                return res.status(400).json({ message: "The trainee must sign before you can sign." });
            }

            if (certificate.hospital_signature) {
                return res.status(400).json({ message: "You have already signed this certificate." });
            }

            if (!req.files || !req.files.signature || req.files.signature.length === 0) {
                return res.status(400).json({ message: "Signature file is required for hospital." });
            }

            const hospital_signature_path = req.files.signature[0].path;

            await pool.execute(
                "UPDATE logbook_certificates SET hospital_signature = ?, signed_at = NOW() WHERE trainee_id = ? AND hospital_id = ?",
                [hospital_signature_path, trainee_id, hospital_id]
            );

            // Notify Trainee
            await pool.execute(
                "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
                [trainee_id, userId, "The hospital has signed the logbook certificate."]
            );

            return res.status(200).json({ message: "Logbook certificate signed by hospital." });
        }

        return res.status(403).json({ message: "Permission denied: Only trainee or hospital can sign this certificate." });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while signing logbook certificate." });
    }
};

const getCertificateSignature = async (req, res) => {
    try {
        const { trainee_id, hospital_id } = req.params;

        // Fetch the certificate details
        const [[certificate]] = await pool.execute(
            "SELECT * FROM logbook_certificates WHERE trainee_id = ? AND hospital_id = ?",
            [trainee_id, hospital_id]
        );

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        res.status(200).json(certificate);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Server error while fetching logbook certificate." });
    }
};

*/
//module.exports = {signLogbookCertificate, getCertificateSignature}