const pool = require("../config/db");
const { get } = require("../routes/authRoutes");
const moment = require("moment");
const form_helper = require('../middleware/form_helper');


// Create logbook profile (POST)
const createLogbookProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const { resident_name, traineeId, academic_year, email, mobile_no } = req.body;

    // Check if profile already exists
    const [existing] = await pool.execute(
      "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Profile already exists. Use update instead." });
    }

    const [[trainee]] = await pool.execute(
      "SELECT Name FROM users WHERE User_ID = ?",
      [userId]
    );

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found." });
    }

    const [result] = await pool.execute(
      `INSERT INTO logbook_profile_info 
       (trainee_id, resident_name, academic_year, email, mobile_no) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, trainee.Name, academic_year, email, mobile_no]
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
    const { userId } = req.user;

    const { resident_name, traineeId, academic_year, email, mobile_no } = req.body;

    const [existing] = await pool.execute(
      "SELECT * FROM logbook_profile_info WHERE trainee_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Profile not found. Please create it first." });
    }

    const [[trainee]] = await pool.execute(
      "SELECT Name FROM users WHERE User_ID = ?",
      [userId]
    );

    if (!trainee) {
      return res.status(404).json({ message: "Trainee not found." });
    }

    await pool.execute(
      `UPDATE logbook_profile_info 
       SET resident_name= ?, academic_year = ?, email = ?, mobile_no = ?
       WHERE trainee_id = ?`,
      [trainee.Name, academic_year, email, mobile_no, userId]
    );

    res.status(200).json({ message: "Logbook profile updated successfully." });
  } catch (err) {
    console.error("Error updating logbook profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLogbookProfileInfo = async (req, res) => {
    try {
      const { userId } = req.user;
      const { traineeId } = req.params;

      // Auth logic
      const hasAccess = await form_helper.auth(
        "Trainee",
        "get_logbook_profile_info"
      )(req, res);
      const hasAccessS = await form_helper.auth(
        "Supervisor",
        "get_logbook_profile_info"
      )(req, res);

      // Determine the actual traineeId based on who is making the request
      const actualTraineeId = hasAccess ? userId : traineeId;

      const [rows] = await pool.execute(
        `SELECT trainee_id, resident_name, academic_year, email, mobile_no
         FROM logbook_profile_info
         WHERE trainee_id = ?`,
        [actualTraineeId]
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
        const { userId } = req.user;
    
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
        const { userId } = req.user;

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
        const { userId } = req.user; // Trainee's ID from token

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

const signLogbookCertificate = async (req, res) => {
  try {
    const { userId } = req.user;

    const hasAccess = await form_helper.auth('Trainee', 'sign_logbook_certificate')(req, res);
    const hasAccessS = await form_helper.auth('Supervisor', 'sign_logbook_certificate')(req, res);
    console.log(hasAccess,hasAccessS,userId);
     
    const traineeId = hasAccessS ? req.params.trainee_id : userId;

    if (hasAccessS && !traineeId) {
      return res.status(400).json({ message: "Trainee ID is required for supervisor signing." });
    }
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

    const a_signature = req.files?.signature
      ? req.files.signature[0].path
      : null;
    const signaturePath = form_helper.getPublicUrl(a_signature);

    // Trainee signs
    if (hasAccess) {
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
    else if (hasAccessS) {
      if (profile.hospital_signature) {
        return res.status(400).json({ message: "Hospital already signed." });
      }

      await pool.execute(
        "UPDATE logbook_profile_info SET hospital_signature = ?, hospital_id = ? WHERE trainee_id = ?",
        [signaturePath, userId, traineeId]
      );

      return res.status(200).json({ message: "Hospital signed the profile." });
    }else{
      return res.status(403).json({ message: "Permission denied." });

    }

    
  } catch (err) {
    console.error("Error signing logbook profile:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const getCertificateSignature = async (req, res) => {
  try {
    const { userId } = req.user;
    const { trainee_id } = req.params;

    // Auth logic
    const hasAccess = await form_helper.auth(
      "Trainee",
      "get_certificate_signature"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "get_certificate_signature"
    )(req, res);

    // Determine the actual trainee_id based on who is making the request
    const actualTraineeId = hasAccess ? userId : trainee_id;

    // Fetch the certificate details and signatures from the logbook_profile_info table
    const [[profileInfo]] = await pool.execute(
      "SELECT id, trainee_id, hospital_signature, trainee_signature FROM logbook_profile_info WHERE trainee_id = ?",
      [actualTraineeId]
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
    const { userId } = req.user;

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

    // Delete the actual signature files from the server
    await deleteSignatureFilesFromDB("logbook_profile_info", certificate_id, [
        "hospital_signature",
        "trainee_signature"
    ]);

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

const createRotation3rdYearConfig = async (req, res) => {
  const { from_date, to_date } = req.body;
  const { userId } = req.user;

  try {
    let formattedDate1 = null;
            if (req.body.from_date) {
                const parsedDate = moment(req.body.from_date, ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"], true);
                
                if (parsedDate.isValid()) {
                    formattedDate1 = parsedDate.format("YYYY-MM-DD HH:mm:ss");
                } else {
                    return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY." });
                }
      }

      let formattedDate2 = null;
              if (req.body.to_date) {
                  const parsedDate = moment(req.body.to_date, ["YYYY-MM-DD", "MM/DD/YYYY", "DD-MM-YYYY"], true);
                  
                  if (parsedDate.isValid()) {
                      formattedDate2 = parsedDate.format("YYYY-MM-DD HH:mm:ss");
                  } else {
                      return res.status(400).json({ error: "Invalid date format. Please use YYYY-MM-DD, MM/DD/YYYY, or DD-MM-YYYY." });
                  }
                }
    const [result] = await pool.execute(
      `INSERT INTO rotation_3rd_year_config (trainee_id, from_date, to_date)
       VALUES (?, ?, ?)`,
      [userId, formattedDate1, formattedDate2]
    );
    res.status(201).json({ message: 'Rotation config created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateRotation3rdYearConfig = async (req, res) => {
  const { id } = req.params;
  const { from_date, to_date } = req.body;

  try {
     // Fetch the existing record to compare and update only the fields provided
     const [existingRecord] = await pool.execute(
      `SELECT * FROM rotation_3rd_year_config WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Config entry not found.' });
    }

    // Initialize updatedFields with existing values
    const updatedFields = {
      from_date: from_date !== undefined ? from_date : existingRecord[0].from_date,
      to_date: to_date !== undefined ? to_date : existingRecord[0].to_date
    };

    await pool.execute(
      `UPDATE rotation_3rd_year_config
       SET from_date = ?, to_date = ?
       WHERE id = ?`,
      [updatedFields.from_date, updatedFields.to_date, id]
    );
    res.status(200).json({ message: 'Rotation config updated' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const getRotation3rdYearConfig = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_rotation_3rd_year_config"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_rotation_3rd_year_config"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_3rd_year_config WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No config found for this trainee' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteRotation3rdYearConfig = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute(
      `DELETE FROM rotation_3rd_year_config WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No config found to delete' });
    }

    res.status(200).json({ message: 'Rotation config deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const createThirdYearRotationDetails = async (req, res) => {
  const { userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;

   // Validate required fields (basic check)
   if (!from_date || !to_date || !total_duration || !area_of_rotation || !overall_performance) {
    return res.status(400).json({
      message: 'All fields are required.'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO third_year_rotations (
        trainee_id, from_date, to_date, total_duration,
        area_of_rotation, overall_performance
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId, from_date, to_date, total_duration, area_of_rotation, overall_performance
      ]
    );

    res.status(201).json({ message: 'Rotation added successfully', rotation_id: result.insertId });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateThirdYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params;
  const { userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance } = req.body;

  try {
    // Check if the rotation entry exists
    const [existing] = await pool.execute(
      `SELECT * FROM third_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    // Initialize updatedFields with existing values
    const updatedFields = {
      from_date: from_date !== undefined ? from_date : existing[0].from_date,
      to_date: to_date !== undefined ? to_date : existing[0].to_date,
      total_duration: total_duration !== undefined ? total_duration : existing[0].total_duration,
      area_of_rotation: area_of_rotation !== undefined ? area_of_rotation : existing[0].area_of_rotation,
      overall_performance: overall_performance !== undefined ? overall_performance : existing[0].overall_performance
    };

    const hasAccess = await form_helper.auth('Trainee', 'sign_logbook_certificate')(req, res);
    const hasAccessS = await form_helper.auth('Supervisor', 'sign_logbook_certificate')(req, res);

    // Trainee can update rotation details
    if (hasAccess) { 
      await pool.execute(
        `UPDATE third_year_rotations 
        SET from_date = ?, to_date = ?, total_duration = ?,
        area_of_rotation = ?, overall_performance = ?
        WHERE rotation_id = ?`,
        [
          updatedFields.from_date,
          updatedFields.to_date,
          updatedFields.total_duration,
          updatedFields.area_of_rotation,
          updatedFields.overall_performance,
          rotation_id
        ]
      );
      return res.status(200).json({ message: 'Rotation details updated successfully' });
    }
  
    // Supervisors can sign the rotation
    if (hasAccessS) {
      if (!req.body.signature || req.body.signature === '') {
        return res.status(400).json({ message: 'Signature text is required.' });
      }

            
      const supervisor_signature = req.body.signature;

      // Check if supervisor_signature is already set in the database, or it's null
      if (existing[0].supervisor_signature !== null && existing[0].supervisor_signature !== '') {
        return res.status(400).json({ message: 'Supervisor already signed.' });
      }

      console.log("SIGNING ROTATION:", {
        supervisor_signature,
        userId,
        rotation_id
      });

      await pool.execute(
        `UPDATE third_year_rotations 
         SET supervisor_signature = ?, supervisor_id = ?, is_signed = ?
         WHERE rotation_id = ?`,
        [supervisor_signature, userId, true, rotation_id] // Pass the signature text here
      );
      return res.status(200).json({ message: 'Supervisor signed the rotation.'});
    }

    

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};




const getThirdYearRotationDetailsById = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_third_year_rotation_details"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_third_year_rotation_details"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM third_year_rotations WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteThirdYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params;

  try {
    const [result] = await pool.execute(
      `DELETE FROM third_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No rotation found to delete' });
    }

    res.status(200).json({ message: 'Rotation deleted' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

const createRotation2ndYearConfig = async (req, res) => {
  const { from_date, to_date } = req.body;
  const { userId } = req.user;


  try {
    const [result] = await pool.execute(
      `INSERT INTO rotation_2nd_year_config (trainee_id, from_date, to_date)
       VALUES (?, ?, ?)`,
      [userId, from_date, to_date]
    );
    res.status(201).json({ message: 'Rotation config created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateRotation2ndYearConfig = async (req, res) => {
  const { id } = req.params;
  const { from_date, to_date } = req.body;

  try {
    await pool.execute(
      `UPDATE rotation_2nd_year_config
       SET from_date = ?, to_date = ?
       WHERE id = ?`,
      [from_date, to_date, id]
    );
    res.status(200).json({ message: 'Rotation config updated' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const getRotation2ndYearConfig = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_rotation_2nd_year_config"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_rotation_2nd_year_config"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_2nd_year_config WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No config found for this trainee' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteRotation2ndYearConfig = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute(
      `DELETE FROM rotation_2nd_year_config WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No config found to delete' });
    }

    res.status(200).json({ message: 'Rotation config deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const createSecondYearRotationDetails = async (req, res) => {
  const {userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;

   // Validate required fields (basic check)
   if (!from_date || !to_date || !total_duration || !area_of_rotation || !overall_performance) {
    return res.status(400).json({
      message: 'All fields are required.'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO second_year_rotations (
        trainee_id, from_date, to_date, total_duration,
        area_of_rotation, overall_performance
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId, from_date, to_date, total_duration,area_of_rotation, overall_performance
      ]
    );

    res.status(201).json({ message: 'Rotation added successfully', rotation_id: result.insertId });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateSecondYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params; 
  const {  userId } = req.user;  
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance } = req.body;

  try {
    console.log("DEBUG — Supervisor Signing Rotation:", {
      rotation_id, 
      userId
    });

    // Check if the rotation entry exists
    const [existing] = await pool.execute(
      `SELECT * FROM second_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    const updatedFields = {
      from_date: from_date !== undefined ? from_date : existing[0].from_date,
      to_date: to_date !== undefined ? to_date : existing[0].to_date,
      total_duration: total_duration !== undefined ? total_duration : existing[0].total_duration,
      area_of_rotation: area_of_rotation !== undefined ? area_of_rotation : existing[0].area_of_rotation,
      overall_performance: overall_performance !== undefined ? overall_performance : existing[0].overall_performance
    };
    const hasAccess = await form_helper.auth('Trainee', 'sign_logbook_certificate')(req, res);
    const hasAccessS = await form_helper.auth('Supervisor', 'sign_logbook_certificate')(req, res);
    console.log(hasAccess,hasAccessS,userId);
    // Trainee can update rotation details
    if (hasAccess) { 
      await pool.execute(
        `UPDATE second_year_rotations 
        SET from_date = ?, to_date = ?, total_duration = ?,
        area_of_rotation = ?, overall_performance = ?
        WHERE rotation_id = ?`,
        [
          updatedFields.from_date, 
          updatedFields.to_date, 
          updatedFields.total_duration, 
          updatedFields.area_of_rotation, 
          updatedFields.overall_performance,
          rotation_id
        ]
      );
      return res.status(200).json({ message: 'Rotation details updated successfully' });
    }
  
    // Supervisors can sign the rotation
    if (hasAccessS) {
      if (!req.body.signature || req.body.signature === '') {
        return res.status(400).json({ message: 'Signature text is required.' });
      }

            
      const supervisor_signature = req.body.signature;

      // Check if supervisor_signature is already set in the database, or it's null
      if (existing[0].supervisor_signature !== null && existing[0].supervisor_signature !== '') {
        return res.status(400).json({ message: 'Supervisor already signed.' });
      }

      console.log("SIGNING ROTATION:", {
        supervisor_signature,
        userId,
        rotation_id
      });

      await pool.execute(
        `UPDATE second_year_rotations 
         SET supervisor_signature = ?, supervisor_id = ?, is_signed = ?
         WHERE rotation_id = ?`,
        [supervisor_signature, userId, true, rotation_id] // Pass the signature text here
      );
      return res.status(200).json({ message: 'Supervisor signed the rotation.'});
    }

    

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};




const getSecondYearRotationDetailsById = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_second_year_rotation_details"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_second_year_rotation_details"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM second_year_rotations WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteSecondYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params;

  try {
    const [result] = await pool.execute(
      `DELETE FROM second_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No rotation found to delete' });
    }

    res.status(200).json({ message: 'Rotation deleted' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const createRotation1stYearConfig = async (req, res) => {
  const { from_date, to_date } = req.body;
  const { userId } = req.user;

  try {
    const [result] = await pool.execute(
      `INSERT INTO rotation_1st_year_config (trainee_id, from_date, to_date)
       VALUES (?, ?, ?)`,
      [userId, from_date, to_date]
    );
    res.status(201).json({ message: 'Rotation config created', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateRotation1stYearConfig = async (req, res) => {
  const { id } = req.params;
  const { from_date, to_date } = req.body;

  try {
    // Fetch the existing record to compare and update only the fields provided
    const [existingRecord] = await pool.execute(
      `SELECT * FROM rotation_1st_year_config WHERE id = ?`,
      [id]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: 'Config entry not found.' });
    }

    // Initialize updatedFields with existing values
    const updatedFields = {
      from_date: from_date !== undefined ? from_date : existingRecord[0].from_date,
      to_date: to_date !== undefined ? to_date : existingRecord[0].to_date
    };

    await pool.execute(
      `UPDATE rotation_1st_year_config
       SET from_date = ?, to_date = ?
       WHERE id = ?`,
      [from_date, to_date, id]
    );
    res.status(200).json({ message: 'Rotation config updated' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const getRotation1stYearConfig = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_rotation_1st_year_config"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_rotation_1st_year_config"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_1st_year_config WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No config found for this trainee' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteRotation1stYearConfig = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute(
      `DELETE FROM rotation_1st_year_config WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No config found to delete' });
    }

    res.status(200).json({ message: 'Rotation config deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error });
  }
};

const createFirstYearRotationDetails = async (req, res) => {
  const { userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;

   // Validate required fields (basic check)
   if (!from_date || !to_date || !total_duration || !area_of_rotation || !overall_performance) {
    return res.status(400).json({
      message: 'All fields are required.'
    });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO first_year_rotations (
        trainee_id, from_date, to_date, total_duration,
        area_of_rotation, overall_performance
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId, from_date, to_date, total_duration,area_of_rotation, overall_performance
      ]
    );

    res.status(201).json({ message: 'Rotation added successfully', rotation_id: result.insertId });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateFirstYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params; 
  const { userId } = req.user;  
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance } = req.body;
  
  console.log(userId, from_date, to_date, total_duration, area_of_rotation, overall_performance);
  try {
    console.log("DEBUG — Supervisor Signing Rotation:", {
      rotation_id, // Make sure rotation_id is properly logged
      userId
    });

    // Check if the rotation entry exists
    const [existing] = await pool.execute(
      `SELECT * FROM first_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    // Initialize updatedFields with existing values
    const updatedFields = {
      from_date: from_date !== undefined ? from_date : existing[0].from_date,
      to_date: to_date !== undefined ? to_date : existing[0].to_date,
      total_duration: total_duration !== undefined ? total_duration : existing[0].total_duration,
      area_of_rotation: area_of_rotation !== undefined ? area_of_rotation : existing[0].area_of_rotation,
      overall_performance: overall_performance !== undefined ? overall_performance : existing[0].overall_performance
    };
    const hasAccess = await form_helper.auth('Trainee', 'sign_logbook_certificate')(req, res);
    const hasAccessS = await form_helper.auth('Supervisor', 'sign_logbook_certificate')(req, res);
    console.log(hasAccess,hasAccessS,userId);
    // Trainee can update rotation details
    if (hasAccess) { 
      await pool.execute(
        `UPDATE first_year_rotations 
        SET from_date = ?, to_date = ?, total_duration = ?,
        area_of_rotation = ?, overall_performance = ?
        WHERE rotation_id = ?`,
        [
          updatedFields.from_date, updatedFields.to_date, updatedFields.total_duration, updatedFields.area_of_rotation, updatedFields.overall_performance, rotation_id
        ]
      );
      return res.status(200).json({ message: 'Rotation details updated successfully' });
    }
  
    // Supervisors can sign the rotation
    if (hasAccessS) {
      if (!req.body.signature || req.body.signature === '') {
        return res.status(400).json({ message: 'Signature text is required.' });
      }

            
      const supervisor_signature = req.body.signature;

      // Check if supervisor_signature is already set in the database, or it's null
      if (existing[0].supervisor_signature !== null && existing[0].supervisor_signature !== '') {
        return res.status(400).json({ message: 'Supervisor already signed.' });
      }

      console.log("SIGNING ROTATION:", {
        supervisor_signature,
        userId,
        rotation_id
      });

      await pool.execute(
        `UPDATE first_year_rotations 
         SET supervisor_signature = ?, supervisor_id = ?, is_signed = ?
         WHERE rotation_id = ?`,
        [supervisor_signature, userId, true, rotation_id] // Pass the signature text here
      );
      return res.status(200).json({ message: 'Supervisor signed the rotation.'});
    }

    

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};


const getFirstYearRotationDetailsById = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_first_year_rotation_details"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_first_year_rotation_details"
  )(req, res);

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM first_year_rotations WHERE trainee_id = ?`,
      [actualTraineeId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const deleteFirstYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params;

  try {
    const [result] = await pool.execute(
      `DELETE FROM first_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No rotation found to delete' });
    }

    res.status(200).json({ message: 'Rotation deleted' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const createOrUpdateSingleProcedureLog = async (req, res) => {
  try {
    const traineeId = req.user.userId;
    const { procedure_name } = req.params; 
    const { performed_count, observed_count } = req.body;

    // Check if procedure_name is provided
    if (!procedure_name) {
      return res.status(400).json({ message: "Procedure name is required." });
    }

    // Query the procedure table to find the procedure ID
    const [procedureRows] = await pool.execute(
      `SELECT id FROM procedures WHERE name = ?`,
      [procedure_name]
    );

    // If no matching procedure is found
    if (procedureRows.length === 0) {
      return res.status(404).json({ message: "Procedure not found." });
    }

    const procedureId = procedureRows[0].id;
    console.log("Final values to insert:");
    console.log("traineeId:", traineeId);
    console.log("procedureId:", procedureId);
    console.log("performed:", performed_count ?? 0);
    console.log("observed:", observed_count ?? 0);

    // Insert or update the procedure log for the trainee
    await pool.execute(
      `
      INSERT INTO user_procedure_logs (trainee_id, procedure_id, num_performed, num_observed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        num_performed = IF(VALUES(num_performed) IS NOT NULL, VALUES(num_performed), num_performed),
        num_observed = IF(VALUES(num_observed) IS NOT NULL, VALUES(num_observed), num_observed)

    `,
      [
        traineeId,
        procedureId,
        performed_count ?? 0, // Default to 0 if performed is not provided
        observed_count ?? 0, // Default to 0 if observed is not provided
      ]
    );

    res.status(200).json({ message: "Procedure log saved successfully." });
  } catch (err) {
    // Log error details for debugging
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while saving procedure log." });
  }
};

const getProcedureLogs = async (req, res) => {
  const { trainee_id } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth("Trainee", "get_procedure_logs")(
    req,
    res
  );
  const hasAccessS = await form_helper.auth("Supervisor", "get_procedure_logs")(
    req,
    res
  );

  // Determine the actual trainee_id based on who is making the request
  const actualTraineeId = hasAccess ? userId : trainee_id;

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM user_procedure_logs WHERE trainee_id = ?",
      [actualTraineeId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while retrieving logs." });
  }
};

const deleteProcedureLog = async (req, res) => {
  try {
    const { procedure_name } = req.params;
    const traineeId = req.user.userId;

    const [procedureRows] = await pool.execute(
      `SELECT id FROM procedures WHERE name = ?`,
      [procedure_name]
    );

    if (procedureRows.length === 0) {
      return res.status(404).json({ message: "Procedure not found." });
    }

    const procedureId = procedureRows[0].id;

    await pool.execute(
      `
      DELETE FROM user_procedure_logs
      WHERE trainee_id = ? AND procedure_id = ?
    `,
      [traineeId, procedureId]
    );

    res.status(200).json({ message: "Procedure log deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting procedure log." });
  }
};

const addProcedureSummary = async (req, res) => {

  try {
    const { serial_no, date, procedure_name, status /*, trainer_signature */ } =
      req.body;
    const traineeId = req.user.userId;

    // Convert undefined values to null for optional fields
    const fields = {
      serial_no: serial_no !== undefined ? serial_no : null,
      date: date !== undefined ? date : null,
      procedure_name: procedure_name !== undefined ? procedure_name : null,
      status: status !== undefined ? status : null,
      //trainer_signature: trainer_signature !== undefined ? trainer_signature : null,
    };

    await pool.execute(
      `INSERT INTO procedure_summary_logs 
       (serial_no, trainee_id, date, procedure_name, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        fields.serial_no,
        traineeId,
        fields.date,
        fields.procedure_name,
        fields.status /*, fields.trainer_signature*/,
      ]
    );

    res.status(201).json({ message: "Procedure summary entry added." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save entry." });
  }
};

const getProcedureSummaries = async (req, res) => {
  const { traineeId } = req.params;
  const { userId } = req.user;

  // Auth logic
  const hasAccess = await form_helper.auth(
    "Trainee",
    "get_procedure_summaries"
  )(req, res);
  const hasAccessS = await form_helper.auth(
    "Supervisor",
    "get_procedure_summaries"
  )(req, res);

  // Determine the actual traineeId based on who is making the request
  const actualTraineeId = hasAccess ? userId : traineeId;

  try {
    const [rows] = await pool.execute(
      `SELECT serial_no, date, procedure_name, status, trainer_signature
       FROM procedure_summary_logs
       WHERE trainee_id = ? 
       ORDER BY date DESC`,
      [actualTraineeId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch procedure summaries." });
  }
};

const updateProcedureSummary = async (req, res) => {
  const { userId } = req.user;

  try {
    const { id } = req.params; // The id from the route
    const traineeId = req.user.userId; // The trainee's ID (userId from the request)
    const { serial_no, date, procedure_name, status, trainer_signature } =
      req.body;

    console.log("DEBUG — Trainee ID:", traineeId); // Log the trainee ID
    console.log("DEBUG — Entry ID (Route):", id); // Log the entry ID from the route

    // Step 1: Fetch the existing record from the database
    const [existingRecord] = await pool.execute(
      `SELECT serial_no, date, procedure_name, status, trainer_signature, trainee_id
       FROM procedure_summary_logs 
       WHERE id = ?`,
      [id]
    );

    console.log("DEBUG — Existing Record:", existingRecord); // Log the result of the query

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const hasAccess = await form_helper.auth(
      "Trainee",
      "sign_logbook_certificate"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "sign_logbook_certificate"
    )(req, res);
    console.log(hasAccess, hasAccessS, userId);

    // Step 2: Check if it's the trainee or supervisor updating
    if (hasAccess) {
      // Trainee
      if (existingRecord[0].trainee_id !== traineeId) {
        return res
          .status(403)
          .json({ message: "This log is not associated with you." });
      }

      // Only update fields that are provided in the request body (but not trainer_signature)
      const updatedFields = {
        serial_no:
          serial_no !== undefined ? serial_no : existingRecord[0].serial_no,
        date: date !== undefined ? date : existingRecord[0].date,
        procedure_name:
          procedure_name !== undefined
            ? procedure_name
            : existingRecord[0].procedure_name,
        status: status !== undefined ? status : existingRecord[0].status,
        trainer_signature: existingRecord[0].trainer_signature, // Trainee cannot modify the trainer signature
      };

      // Update the record
      const [result] = await pool.execute(
        `UPDATE procedure_summary_logs 
         SET serial_no = ?, date = ?, procedure_name = ?, status = ?, trainer_signature = ? 
         WHERE id = ? AND trainee_id = ?`,
        [
          updatedFields.serial_no,
          updatedFields.date,
          updatedFields.procedure_name,
          updatedFields.status,
          updatedFields.trainer_signature,
          id,
          traineeId,
        ]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Entry not found or not authorized." });
      }

      return res
        .status(200)
        .json({ message: "Procedure summary updated successfully." });
    } else if (hasAccessS) {
      // Supervisor
      // Check if the trainer_signature already exists, meaning the supervisor has already signed
      if (
        existingRecord[0].trainer_signature !== null &&
        existingRecord[0].trainer_signature !== ""
      ) {
        return res
          .status(400)
          .json({ message: "Trainer signature already provided." });
      }

      // Ensure the supervisor provides a signature
      if (!trainer_signature || trainer_signature === "") {
        return res
          .status(400)
          .json({ message: "Trainer signature is required." });
      }

      // Update the trainer_signature field
      const [result] = await pool.execute(
        `UPDATE procedure_summary_logs 
         SET trainer_signature = ?, is_signed = ?
         WHERE id = ? AND trainee_id = ?`,
        [trainer_signature, 1, id, existingRecord[0].trainee_id] // Save the signature, current date, and supervisor ID
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Entry not found or not authorized." });
      }

      return res
        .status(200)
        .json({ message: "Trainer signature updated successfully." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry." });
  }
};

const deleteProcedureSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const traineeId = req.user.userId;

    const [result] = await pool.execute(
      `DELETE FROM procedure_summary_logs WHERE id = ? AND trainee_id = ?`,
      [id, traineeId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Entry not found or not authorized." });
    }

    res
      .status(200)
      .json({ message: "Procedure summary deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete entry." });
  }
};

const createProcedureEvalForm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { resident_id } = req.params;

    // Process the request body to convert empty strings to null
    const processedBody = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    const {
      trainee_name,
      evaluator_name,
      procedure_name,
      date,
      setting,
      difficulty,
      preparation_and_set_up,
      consent_and_communication,
      technical_skills,
      asepsis_and_safety,
      problem_management,
      documentation,
      strengths,
      areas_for_improvement,
    } = processedBody;

    // Auth logic
    const hasAccess = await form_helper.auth(
      "Trainee",
      "create_procedure_eval_form"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "create_procedure_eval_form"
    )(req, res);

    // Determine the actual resident_id based on who is making the request
    const actualResidentId = hasAccess ? userId : resident_id;

    // Check if form already exists for this trainee
    const [existing] = await pool.execute(
      `SELECT * FROM procedure_evaluation WHERE resident_id = ?`,
      [actualResidentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "A Procedure Evaluation form already exists for this trainee.",
      });
    }

    if (hasAccess) {
      // Get trainee name
      const [[trainee]] = await pool.execute(
        "SELECT Name FROM users WHERE User_ID = ?",
        [actualResidentId]
      );
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found." });
      }

      const insertTrainee = `
        INSERT INTO procedure_evaluation (
          resident_id, trainee_name, procedure_name, date, setting, difficulty
        )
        VALUES (?, ?, ?, ?, ?, ?)`;

      const values = [
        actualResidentId,
        trainee.Name,
        procedure_name,
        date,
        setting,
        difficulty,
      ];

      await pool.execute(insertTrainee, values);

      return res.status(201).json({
        message: "Procedure Evaluation form created by trainee.",
      });
    }

    if (hasAccessS) {
      // Get supervisor name
      const [[supervisor]] = await pool.execute(
        "SELECT Name FROM users WHERE User_ID = ?",
        [userId]
      );

      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor not found." });
      }
      const [[trainee]] = await pool.execute(
        "SELECT Name FROM users WHERE User_ID = ?",
        [actualResidentId]
      );
      if (!trainee) {
        return res.status(404).json({ message: "Trainee not found." });
      }
      const insertSupervisor = `
        INSERT INTO procedure_evaluation (
          resident_id,
          supervisor_id, 
          evaluator_name, 
          trainee_name,
          preparation_and_set_up, 
          consent_and_communication, 
          technical_skills,
          asepsis_and_safety, 
          problem_management, 
          documentation,
          strengths, 
          areas_for_improvement
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        actualResidentId,
        userId,
        supervisor.Name,
        trainee.Name,
        preparation_and_set_up,
        consent_and_communication,
        technical_skills,
        asepsis_and_safety,
        problem_management,
        documentation,
        strengths,
        areas_for_improvement,
      ];

      await pool.execute(insertSupervisor, values);

      return res.status(201).json({
        message: "Procedure Evaluation form created by supervisor.",
      });
    }

    return res.status(403).json({
      message: "You are not authorized to create this form.",
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({
      error: "An error occurred while creating the procedure evaluation form.",
    });
  }
};

const updateProcedureEvalForm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const [formResult] = await pool.execute(
      `SELECT * FROM procedure_evaluation WHERE id = ?`,
      [id]
    );

    if (formResult.length === 0) {
      return res.status(404).json({ message: "Form not found." });
    }

    const form = formResult[0];

    //  auth
    const hasAccess = await form_helper.auth(
      "Trainee",
      "update_procedure_eval_form"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "update_procedure_eval_form"
    )(req, res);

    if (hasAccess) {
      const { procedure_name, date, setting, difficulty } = req.body;

      const updateQuery = `
        UPDATE procedure_evaluation
        SET procedure_name = ?, 
            date = ?, 
            setting = ?, 
            difficulty = ?
        WHERE id = ?
      `;

      const values = [
        procedure_name ?? form.procedure_name,
        date ?? form.date,
        setting ?? form.setting,
        difficulty ?? form.difficulty,
        id,
      ];

      await pool.execute(updateQuery, values);

      return res.status(200).json({ message: "Form updated by trainee." });
    }

    if (hasAccessS) {
      const {
        preparation_and_set_up,
        consent_and_communication,
        technical_skills,
        asepsis_and_safety,
        problem_management,
        documentation,
        strengths,
        areas_for_improvement,
      } = req.body;

      const [[supervisor]] = await pool.execute(
        "SELECT Name FROM users WHERE User_ID = ?",
        [userId]
      );

      if (!supervisor) {
        return res.status(404).json({ message: "Supervisor not found." });
      }

      const updateQuery = `
        UPDATE procedure_evaluation
        SET evaluator_name = ?, 
            supervisor_id = ?,
            preparation_and_set_up = ?, 
            consent_and_communication = ?, 
            technical_skills = ?, 
            asepsis_and_safety = ?, 
            problem_management = ?, 
            documentation = ?, 
            strengths = ?, 
            areas_for_improvement = ?
        WHERE id = ?
      `;

      const values = [
        supervisor.Name,
        userId ?? form.supervisor_id,
        preparation_and_set_up ?? form.preparation_and_set_up,
        consent_and_communication ?? form.consent_and_communication,
        technical_skills ?? form.technical_skills,
        asepsis_and_safety ?? form.asepsis_and_safety,
        problem_management ?? form.problem_management,
        documentation ?? form.documentation,
        strengths ?? form.strengths,
        areas_for_improvement ?? form.areas_for_improvement,
        id,
      ];

      await pool.execute(updateQuery, values);

      return res.status(200).json({ message: "Form updated by supervisor." });
    }

    return res
      .status(403)
      .json({ message: "You are not authorized to update this form." });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({
      error: "An error occurred while updating the procedure evaluation form.",
    });
  }
};

const getProcedureEvalForm = async (req, res) => {
  try {
    const { userId } = req.user;
    const { resident_id } = req.params;

    // Auth logic
    const hasAccess = await form_helper.auth(
      "Trainee",
      "get_procedure_eval_form"
    )(req, res);
    const hasAccessS = await form_helper.auth(
      "Supervisor",
      "get_procedure_eval_form"
    )(req, res);

    // Determine the actual resident_id based on who is making the request
    const actualResidentId = hasAccess ? userId : resident_id;

    const [rows] = await pool.execute(
      `SELECT * FROM procedure_evaluation WHERE resident_id = ?`,
      [actualResidentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Format the date to mm/dd/yyyy
    const form = rows[0];
    if (form.date) {
      const date = new Date(form.date);
      form.date = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
        .getDate()
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    }

    res.status(200).json({ form });
  } catch (err) {
    console.error("Error fetching form:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const deleteProcedureEvalForm = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT * FROM procedure_evaluation WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Form not found." });
    }

    const form = rows[0];

    if (form.trainee_signature_path) {
        await form_helper.deleteSignatureFilesFromDB(
          "procedure_evaluation",
            id,
            ["evaluator_signature_path"]
        );
    }
    if (form.evaluator_signature_path) {
      await form_helper.deleteSignatureFilesFromDB(
        "procedure_evaluation",
          id,
          ["evaluator_signature_path"]
      );
    }

    await pool.execute(
      `DELETE FROM procedure_evaluation WHERE id = ?`,
      [id]
    );

    res.status(200).json({ message: "Form deleted successfully." });
  } catch (err) {
    console.error("Error deleting form:", err);
    res.status(500).json({ error: "Internal server error." });
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
    deleteLogbookCertificate,

    createRotation1stYearConfig,
    updateRotation1stYearConfig,
    getRotation1stYearConfig,
    deleteRotation1stYearConfig,

    createFirstYearRotationDetails,
    updateFirstYearRotationDetails,
    getFirstYearRotationDetailsById,
    deleteFirstYearRotationDetails,

    createRotation2ndYearConfig,
    updateRotation2ndYearConfig,
    getRotation2ndYearConfig,
    deleteRotation2ndYearConfig,

    createSecondYearRotationDetails,
    updateSecondYearRotationDetails,
    getSecondYearRotationDetailsById,
    deleteSecondYearRotationDetails,

    createRotation3rdYearConfig,
    updateRotation3rdYearConfig,
    getRotation3rdYearConfig,
    deleteRotation3rdYearConfig,
    
    createThirdYearRotationDetails,
    getThirdYearRotationDetailsById,
    deleteThirdYearRotationDetails,
    updateThirdYearRotationDetails,

    createOrUpdateSingleProcedureLog,
    getProcedureLogs,
    deleteProcedureLog,

    addProcedureSummary,
    getProcedureSummaries,
    updateProcedureSummary,
    deleteProcedureSummary,

    createProcedureEvalForm,
    updateProcedureEvalForm,
    getProcedureEvalForm,
    deleteProcedureEvalForm
  };