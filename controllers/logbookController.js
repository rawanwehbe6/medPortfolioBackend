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

    const [result] = await pool.execute(
      `INSERT INTO logbook_profile_info 
       (trainee_id, resident_name, academic_year, email, mobile_no) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, resident_name, academic_year, email, mobile_no]
    );

    const logbookId = result.insertId;
    // Update certificate_id in profile
    await pool.execute(
    "UPDATE logbook_profile_info SET certificate_id = ? WHERE id = ?",
    [logbookId, logbookId]
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

// Delete profile picture (DELETE)
const deleteLogbookProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;

        // Ensure only the trainee can delete their profile picture
        if (role !== 2) {
            return res.status(403).json({ message: "Only trainees can delete their profile picture." });
        }

        // Check if the profile image exists
        const [rows] = await pool.execute(
            `SELECT id, image_path FROM trainee_portfolio_images WHERE trainee_id = ?`,
            [userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "Profile picture not found." });
        }

        // Update the profile image path to null (effectively deleting it)
        await pool.execute(
            `UPDATE trainee_portfolio_images SET image_path = NULL WHERE trainee_id = ?`,
            [userId]
        );

        res.status(200).json({ message: "Profile picture deleted successfully." });
    } catch (err) {
        console.error("Error deleting profile picture:", err);
        res.status(500).json({ message: "Server error while deleting profile picture." });
    }
};

// Delete logbook profile info (DELETE)
const deleteLogbookProfileInfo = async (req, res) => {
    try {
        const { role, userId } = req.user; // Trainee's ID from token

        if (role !== 2) {
            return res.status(403).json({ message: "Only trainees can delete their profile info." });
        }

        // Fetch the existing profile info
        const [rows] = await pool.execute(
            `SELECT trainee_id FROM logbook_profile_info WHERE trainee_id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No profile info found for this trainee." });
        }

        // Delete the profile info for the trainee
        await pool.execute(
            `DELETE FROM logbook_profile_info WHERE trainee_id = ?`,
            [userId]
        );

        res.status(200).json({ message: "Logbook profile info deleted successfully." });
    } catch (err) {
        console.error("Error deleting logbook profile info:", err);
        res.status(500).json({ error: "Server error while deleting logbook profile info." });
    }
};

/*const signLogbookCertificate = async (req, res) => {
    try {
      const { role, userId } = req.user;
      const { trainee_id } = req.params;
      console.log("Trainee ID (from params):", trainee_id);
      // Get the logbook profile info
      const [[profile]] = await pool.execute(
        "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
        [userId]
      );
  
      if (!profile) {
        return res.status(404).json({ message: "Logbook profile not found." });
      }
  
      // Trainee signs the certificate
      if (role === 2) {
        // Get the logbook profile info
      const [[profile]] = await pool.execute(
        "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
        [userId]
      );
  
      if (!profile) {
        return res.status(404).json({ message: "Logbook profile not found." });
      }

        if (profile.trainee_signature) {
          return res.status(400).json({ message: "You already signed." });
        }
  
        if (!req.files || !req.files.signature || req.files.signature.length === 0) {
          return res.status(400).json({ message: "Signature file is required." });
        }
  
        const signaturePath = req.files.signature[0].path;
  
        // Save the trainee's signature in the profile info
        await pool.execute(
          "UPDATE logbook_profile_info SET trainee_signature = ? WHERE trainee_id = ?",
          [signaturePath, userId]
        );
  
        return res.status(200).json({ message: "Trainee signed the profile." });
      }
  
      // Hospital signs the certificate
      if ([3,4,5].includes(role)) {

        const [rows] = await pool.execute(
            "SELECT * FROM logbook_profile_info WHERE trainee_id = 26",
            [trainee_id]
          );
          console.log("DB rows:", rows);
          if (rows.length === 0) {
            return res.status(404).json({ message: "Logbook profile not found." });
          }
          const profile = rows[0];
          

        if (!profile) {
            return res.status(404).json({ message: "Logbook profile not found." });
        }

        if (profile.hospital_signature) {
          return res.status(400).json({ message: "Hospital already signed." });
        }
  
        if (!req.files || !req.files.signature || req.files.signature.length === 0) {
          return res.status(400).json({ message: "Signature file is required." });
        }
  
        const signaturePath = req.files.signature[0].path;
  
        // Save the hospital's signature and ID in the profile info
        await pool.execute(
          "UPDATE logbook_profile_info SET hospital_signature = ?, hospital_id = ?, signed_at = NOW() WHERE trainee_id = ?",
          [signaturePath, userId, userId]
        );
  
        return res.status(200).json({ message: "Hospital signed the profile." });
      }
  
      return res.status(403).json({ message: "Permission denied." });
  
    } catch (err) {
      console.error("Error signing logbook profile:", err);
      res.status(500).json({ message: "Server error." });
    }
  };  
*/
const signLogbookCertificate = async (req, res) => {
  try {
    const { role, userId } = req.user;
    const traineeId = [3, 4, 5].includes(role) ? req.params.trainee_id : userId;

    console.log("Resolved traineeId:", traineeId);

    const [rows] = await pool.execute(
      "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
      [traineeId]
    );
    console.log("DB rows:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Logbook profile not found." });
    }

    const profile = rows[0];

    if (!req.files || !req.files.signature || req.files.signature.length === 0) {
      return res.status(400).json({ message: "Signature file is required." });
    }

    const signaturePath = req.files.signature[0].path;

    // Trainee signs
    if (role === 2) {
      if (profile.trainee_signature) {
        return res.status(400).json({ message: "You already signed." });
      }

      await pool.execute(
        "UPDATE logbook_profile_info SET trainee_signature = ? WHERE trainee_id = ?",
        [signaturePath, traineeId]
      );

      return res.status(200).json({ message: "Trainee signed the profile." });
    }

    // Hospital signs
    if ([3, 4, 5].includes(role)) {
      if (profile.hospital_signature) {
        return res.status(400).json({ message: "Hospital already signed." });
      }

      await pool.execute(
        "UPDATE logbook_profile_info SET hospital_signature = ?, hospital_id = ? WHERE trainee_id = ?",
        [signaturePath, userId, traineeId]
      );

      return res.status(200).json({ message: "Hospital signed the profile." });
    }

    return res.status(403).json({ message: "Permission denied." });
  } catch (err) {
    console.error("Error signing logbook profile:", err);
    res.status(500).json({ message: "Server error." });
  }
};

  const getCertificateSignature = async (req, res) => {
    try {
      const trainee_id = req.user.userId;
  
      // Fetch the certificate details and signatures from the logbook_profile_info table
      const [[profileInfo]] = await pool.execute(
        "SELECT id, trainee_id, hospital_signature, trainee_signature FROM logbook_profile_info WHERE trainee_id = ?",
        [trainee_id]
      );
  
      if (!profileInfo) {
        return res.status(404).json({ message: "Profile info not found for this trainee." });
      }
  
      // Check if signatures are available
      if (!profileInfo.trainee_signature && !profileInfo.hospital_signature) {
        return res.status(404).json({ message: "No signatures found for this certificate." });
      }
  
      res.status(200).json(profileInfo);
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error while fetching logbook certificate." });
    }
  };
  
  const deleteLogbookCertificate = async (req, res) => {
    try {
      const { certificate_id } = req.params;
      const { role, userId } = req.user;
  
      // Only trainees are allowed to delete certificates
      if (role !== 2) {
        return res.status(403).json({ message: "Only trainees can delete certificates." });
      }
  
      // Fetch certificate data from logbook_profile_info to ensure it exists
      const [[profileInfo]] = await pool.execute(
        "SELECT id, trainee_id FROM logbook_profile_info WHERE id = ?",
        [certificate_id]
      );
  
      if (!profileInfo) {
        return res.status(404).json({ message: "Certificate profile info not found." });
      }
  
      // Ensure the trainee owns the certificate
      if (profileInfo.trainee_id !== userId) {
        return res.status(403).json({ message: "You do not have permission to delete this certificate." });
      }
  
      // Update the signature fields to NULL
      const [updateResult] = await pool.execute(
        "UPDATE logbook_profile_info SET hospital_signature = NULL, trainee_signature = NULL WHERE id = ?",
        [certificate_id]
      );
  
      if (updateResult.affectedRows === 0) {
        return res.status(500).json({ message: "Failed to remove signatures." });
      }
  
      return res.status(200).json({ message: "Signatures removed successfully." });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Server error while removing signatures from logbook certificate." });
    }
  };
  

module.exports = {
    createLogbookProfile,
    updateLogbookProfile,
    getLogbookProfileInfo,
    getLogbookProfile,
    deleteLogbookProfile,
    deleteLogbookProfileInfo,
    signLogbookCertificate,
    getCertificateSignature,
    deleteLogbookCertificate
  };