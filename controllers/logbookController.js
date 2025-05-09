const pool = require("../config/db");
const { get } = require("../routes/authRoutes");
const moment = require("moment");
const form_helper = require('../middleware/form_helper');


// Create logbook profile (POST)
const createLogbookProfile = async (req, res) => {
  try {
    const { userId/*, role*/ } = req.user;

   /* if (role !== 2) {
      return res.status(403).json({ message: "Only trainees can fill profile info." });
    }*/

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
    const { userId/*, role*/ } = req.user;

    /*if (role !== 2) {
      return res.status(403).json({ message: "Only trainees can update profile info." });
    }*/

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
      //const { userId } = req.user; // trainee's ID from token
      const { traineeId } = req.params;
      /*// Only trainees are allowed to delete certificates
      if (role !== 2 || [3,4,5].includes(role) ) {
        return res.status(403).json({ message: "Only trainees and supervisors can get logbook profile info." });
      }*/

      const [rows] = await pool.execute(
        `SELECT trainee_id, resident_name, academic_year, email, mobile_no
         FROM logbook_profile_info
         WHERE trainee_id = ?`,
        [traineeId]
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
        const { userId/*, role*/ } = req.user;
    
        /*if (role !== 2 || [3,4,5].includes(role) ) {
          return res.status(403).json({ message: "Only trainees and supervisors can access the trainee's profile picture." });
        }*/
    
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
        const { userId, /*role*/ } = req.user;

        /*// Ensure only the trainee can delete their profile picture
        if (role !== 2) {
            return res.status(403).json({ message: "Only trainees can delete their profile picture." });
        }*/

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
        const { /*role,*/ userId } = req.user; // Trainee's ID from token

        /*if (role !== 2) {
            return res.status(403).json({ message: "Only trainees can delete their profile info." });
        }*/

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
  const { /*role,*/ userId } = req.user;
  
  // Ensure only the trainee or authorized role can delete the logbook entry
  /*if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can Create their logbook third year config entry.' });
  }*/

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
  const { role } = req.user;

  // Ensure only the trainee can update their third year rotation config logbook entry
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can update their logbook third year config entry.' });
  }

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
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook third year config entry.' });
  }*/
  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_3rd_year_config WHERE trainee_id = ?`,
      [trainee_id]
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
  /*const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their logbook third year config entry.' });
  }*/
  
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
  const { /*role,*/ userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;

  /*if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can create their third year rotation entry.' });
  }*/

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
        userId, from_date, to_date, total_duration,area_of_rotation, overall_performance
      ]
    );

    res.status(201).json({ message: 'Rotation added successfully', rotation_id: result.insertId });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Database error', error });
  }
};

const updateThirdYearRotationDetails = async (req, res) => {
  const { rotation_id } = req.params; // Ensure that rotation_id is being passed in the URL
  const { role, userId } = req.user;  // Get user role and ID from the request (assumed from auth)
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance } = req.body;
  console.log(userId, from_date, to_date, total_duration, area_of_rotation, overall_performance);

  try {
    console.log("DEBUG — Supervisor Signing Rotation:", {
      rotation_id, // Make sure rotation_id is properly logged
      userId
    });

    // Check if the rotation entry exists
    const [existing] = await pool.execute(
      `SELECT * FROM third_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rotation not found' });
    }
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
        `UPDATE third_year_rotations 
        SET from_date = ?, to_date = ?, total_duration = ?,
        area_of_rotation = ?, overall_performance = ?
        WHERE rotation_id = ?`,
        [
          updatedFields.formattedDate1, 
          updatedFields.formattedDate2, 
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
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook third year rotation entry.' });
  }*/

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM third_year_rotations WHERE trainee_id = ?`,
      [trainee_id]
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
  const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their third year rotation entry.' });
  }
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
  const { role, userId } = req.user;
  
  // Ensure only the trainee or authorized role can delete the logbook entry
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can Create their logbook second year config entry.' });
  }

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
  /*const { role } = req.user;

  // Ensure only the trainee can update their third year rotation config logbook entry
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can update their logbook second year config entry.' });
  }*/

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
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook second year config entry.' });
  }*/

  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_2nd_year_config WHERE trainee_id = ?`,
      [trainee_id]
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
  /*const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their logbook second year config entry.' });
  }*/
  
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
  const { /*role,*/ userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;
  
  /*if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can create their second year rotation entry.' });
  }*/

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
  const { rotation_id } = req.params; // Ensure that rotation_id is being passed in the URL
  const { /*role,*/ userId } = req.user;  // Get user role and ID from the request (assumed from auth)
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance } = req.body;

  try {
    console.log("DEBUG — Supervisor Signing Rotation:", {
      rotation_id, // Make sure rotation_id is properly logged
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
  const { rotation_id } = req.params;
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook second year rotation entry.' });
  }*/

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM third_year_rotations WHERE trainee_id = ?`,
      [trainee_id]
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
  const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their second year rotation entry.' });
  }
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
  const { role, userId } = req.user;
  
  // Ensure only the trainee or authorized role can delete the logbook entry
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can Create their logbook first year config entry.' });
  }

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
  const { role } = req.user;

  // Ensure only the trainee can update their third year rotation config logbook entry
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee can update their logbook first year config entry.' });
  }

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
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook first year config entry.' });
  }*/
  try {
    const [rows] = await pool.execute(
      `SELECT from_date, to_date FROM rotation_1st_year_config WHERE trainee_id = ?`,
      [trainee_id]
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
  const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their logbook first year config entry.' });
  }
  
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
  const { role, userId } = req.user;
  const { from_date, to_date, total_duration, area_of_rotation, overall_performance} = req.body;
  
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can create their first year rotation entry.' });
  }

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
  const { rotation_id } = req.params; // Ensure that rotation_id is being passed in the URL
  const { role, userId } = req.user;  // Get user role and ID from the request (assumed from auth)
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
  const { rotation_id } = req.params;
  /*const { role } = req.user;

  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee can get trainees logbook first year rotation entry.' });
  }*/

  try {
    const [result] = await pool.execute(
      `SELECT trainee_id, from_date, to_date, total_duration, 
      area_of_rotation, overall_performance, supervisor_signature 
      FROM third_year_rotations WHERE rotation_id = ?`,
      [rotation_id]
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
  const { role } = req.user;
  if (role !== 2){
    return res.status(403).json({ message: 'Only a trainee can delete their first year rotation entry.' });
  }
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
    const { procedure_name } = req.params;  // Extract procedure_name from URL parameter
    const { performed, observed } = req.body;  // Extract performed and observed from the request body
    const { role } = req.user;  // Get the role from user information

    // Check if procedure_name is provided
    if (!procedure_name) {
      return res.status(400).json({ message: 'Procedure name is required.' });
    }

    // Log the procedure name for debugging
    console.log("Procedure name:", procedure_name);

    // Only allow trainees to log procedures
    if (role !== 2) {
      return res.status(403).json({ message: 'Only a trainee can log procedures.' });
    }

    // Query the procedure table to find the procedure ID
    const [procedureRows] = await pool.execute(
      `SELECT id FROM procedures WHERE name = ?`, 
      [procedure_name]
    );

    // If no matching procedure is found
    if (procedureRows.length === 0) {
      return res.status(404).json({ message: 'Procedure not found.' });
    }

    const procedureId = procedureRows[0].id;
    console.log("Final values to insert:");
console.log("traineeId:", traineeId);
console.log("procedureId:", procedureId);
console.log("performed:", performed ?? 0);
console.log("observed:", observed ?? 0);

    // Insert or update the procedure log for the trainee
    await pool.execute(`
      INSERT INTO user_procedure_logs (trainee_id, procedure_id, num_performed, num_observed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        num_performed = IF(VALUES(num_performed) IS NOT NULL, VALUES(num_performed), num_performed),
        num_observed = IF(VALUES(num_observed) IS NOT NULL, VALUES(num_observed), num_observed)

    `, [
      traineeId,
      procedureId,
      performed ?? 0,  // Default to 0 if performed is not provided
      observed ?? 0    // Default to 0 if observed is not provided
    ]);

    res.status(200).json({ message: "Procedure log saved successfully." });

  } catch (err) {
    // Log error details for debugging
    console.error(err);
    res.status(500).json({ message: "Server error while saving procedure log." });
  }
};



const getProcedureLogs = async (req, res) => {
  const {trainee_id} = req.params; // or req.user.User_ID — match this with your token
  const { role } = req.user;
  if (![2,3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee or supervisor can get log procedures.' });
  }
  try {
    
    /*if (!traineeId) {
      return res.status(400).json({ message: 'Trainee ID is missing in token.' });
    }*/

    const [rows] = await pool.execute(
      "SELECT * FROM user_procedure_logs WHERE trainee_id = ?",
      [trainee_id]
    );

    res.status(200).json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while retrieving logs.' });
  }
};


const deleteProcedureLog = async (req, res) => {
  try {
    const { procedure_name } = req.params;
    const traineeId = req.user.userId;
    /*const { role } = req.user;

    if (role !== 2) {
      return res.status(403).json({ message: 'Only a trainee can delete log procedures.' });
    }*/

    const [procedureRows] = await pool.execute(
      `SELECT id FROM procedures WHERE name = ?`, 
      [procedure_name]
    );

    if (procedureRows.length === 0) {
      return res.status(404).json({ message: 'Procedure not found.' });
    }

    const procedureId = procedureRows[0].id;

    await pool.execute(`
      DELETE FROM user_procedure_logs
      WHERE trainee_id = ? AND procedure_id = ?
    `, [traineeId, procedureId]);

    res.status(200).json({ message: "Procedure log deleted successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting procedure log." });
  }
};

const addProcedureSummary = async (req, res) => {
  const {role} = req.user;
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee add log summary.' });
  }
  try {
    const { serial_no, date, procedure_name, status/*, trainer_signature */} = req.body;
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
      [fields.serial_no, traineeId, fields.date, fields.procedure_name, fields.status/*, fields.trainer_signature*/]
    );

    res.status(201).json({ message: "Procedure summary entry added." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save entry." });
  }
};

const getProcedureSummaries = async (req, res) => {
  const {traineeId} = req.params;
  const {role} = req.user;
  if (role !== 2 || [3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee or supervisor log summary.' });
  }
  try {
    

    const [rows] = await pool.execute(
      `SELECT serial_no, date, procedure_name, status, trainer_signature
       FROM procedure_summary_logs
       WHERE trainee_id = ? 
       ORDER BY date DESC`,
      [traineeId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch procedure summaries." });
  }
};

/*const updateProcedureSummary = async (req, res) => {
  const { role } = req.user;
  console.log('User role:', role);

  // Only a trainee can update their log summary
  if (![2,3,4,5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee or supervisor can update their log summary.' });
  }

  try {
    const { id } = req.params;
    const traineeId = req.user.userId;
    const { serial_no, date, procedure_name, status, trainer_signature } = req.body;

    // Step 1: Fetch the existing record from the database
    const [existingRecord] = await pool.execute(
      `SELECT serial_no, date, procedure_name, status, trainer_signature
       FROM procedure_summary_logs 
       WHERE id = ? AND trainee_id = ?`,
      [id, traineeId]
    );

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "Entry not found or not authorized." });
    }

    // Step 2: Only update fields that are provided in the request body
    const updatedFields = {
      serial_no: serial_no !== undefined ? serial_no : existingRecord[0].serial_no,
      date: date !== undefined ? date : existingRecord[0].date,
      procedure_name: procedure_name !== undefined ? procedure_name : existingRecord[0].procedure_name,
      status: status !== undefined ? status : existingRecord[0].status,
      trainer_signature: trainer_signature !== undefined ? trainer_signature : existingRecord[0].trainer_signature
    };

    // If the role is a supervisor (3, 4, 5), only allow updating the signature
    if ([3, 4, 5].includes(role)) {
      if (trainer_signature === undefined) {
        return res.status(400).json({ message: 'Trainer signature is required for supervisor updates.' });
      }

      updatedFields.trainer_signature = trainer_signature;
    }

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
        traineeId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found or not authorized." });
    }

    res.status(200).json({ message: "Procedure summary updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry." });
  }
};*/
const updateProcedureSummary = async (req, res) => {
  const { role, userId } = req.user;

  // Ensure that the user is either a trainee or a supervisor
  if (![2, 3, 4, 5].includes(role)) {
    return res.status(403).json({ message: 'Only a trainee or supervisor can update their log summary.' });
  }

  try {
    const { id } = req.params;  // The id from the route
    const traineeId = req.user.userId;  // The trainee's ID (userId from the request)
    const { serial_no, date, procedure_name, status, trainer_signature } = req.body;

    console.log("DEBUG — Trainee ID:", traineeId);  // Log the trainee ID
    console.log("DEBUG — Entry ID (Route):", id);    // Log the entry ID from the route

    // Step 1: Fetch the existing record from the database
    const [existingRecord] = await pool.execute(
      `SELECT serial_no, date, procedure_name, status, trainer_signature, trainee_id
       FROM procedure_summary_logs 
       WHERE id = ?`,
      [id] 
    );

    console.log("DEBUG — Existing Record:", existingRecord);  // Log the result of the query

    if (existingRecord.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const hasAccess = await form_helper.auth('Trainee', 'sign_logbook_certificate')(req, res);
    const hasAccessS = await form_helper.auth('Supervisor', 'sign_logbook_certificate')(req, res);
    console.log(hasAccess,hasAccessS,userId);

    // Step 2: Check if it's the trainee or supervisor updating
    if (hasAccess) {  // Trainee
      if (existingRecord[0].trainee_id !== traineeId) {
        return res.status(403).json({ message: "This log is not associated with you." });
      }

      // Only update fields that are provided in the request body (but not trainer_signature)
      const updatedFields = {
        serial_no: serial_no !== undefined ? serial_no : existingRecord[0].serial_no,
        date: date !== undefined ? date : existingRecord[0].date,
        procedure_name: procedure_name !== undefined ? procedure_name : existingRecord[0].procedure_name,
        status: status !== undefined ? status : existingRecord[0].status,
        trainer_signature: existingRecord[0].trainer_signature  // Trainee cannot modify the trainer signature
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
          traineeId
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Entry not found or not authorized." });
      }

      return res.status(200).json({ message: "Procedure summary updated successfully." });

    } else if (hasAccessS) {  // Supervisor
      // Check if the trainer_signature already exists, meaning the supervisor has already signed
      if (existingRecord[0].trainer_signature !== null && existingRecord[0].trainer_signature !== '') {
        return res.status(400).json({ message: "Trainer signature already provided." });
      }

      // Ensure the supervisor provides a signature
      if (!trainer_signature || trainer_signature === '') {
        return res.status(400).json({ message: "Trainer signature is required." });
      }

      // Update the trainer_signature field
      const [result] = await pool.execute(
        `UPDATE procedure_summary_logs 
         SET trainer_signature = ?, is_signed = ?
         WHERE id = ? AND trainee_id = ?`,
        [trainer_signature, 1, id, existingRecord[0].trainee_id]  // Save the signature, current date, and supervisor ID
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Entry not found or not authorized." });
      }

      return res.status(200).json({ message: "Trainer signature updated successfully." });
    }

    // If the role is neither a trainee nor supervisor, return forbidden
    return res.status(403).json({ message: "Only a trainee or supervisor can update their log summary." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry." });
  }
};




const deleteProcedureSummary = async (req, res) => {
  const {role} = req.user;
  if (role !== 2) {
    return res.status(403).json({ message: 'Only a trainee delete log summary.' });
  }
  try {
    const { id } = req.params;
    const traineeId = req.user.userId;
    

    const [result] = await pool.execute(
      `DELETE FROM procedure_summary_logs WHERE id = ? AND trainee_id = ?`,
      [id, traineeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Entry not found or not authorized." });
    }

    res.status(200).json({ message: "Procedure summary deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete entry." });
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
    deleteProcedureSummary
  };