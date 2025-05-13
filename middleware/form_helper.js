const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const BASE_URL = "";

function cleanupUploadedFiles(files) {
  if (!files) return;

  Object.values(files)
    .flat()
    .forEach((file) => {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted uploaded file due to failure:", filePath);
      }
    });
}

async function deleteOldSignatureIfUpdated(tableName, id, column, newFileUrl) {
  try {
    const [rows] = await pool.execute(
      `SELECT ${column} FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return;

    const oldFileUrl = rows[0][column];

    if (
      oldFileUrl &&
      newFileUrl &&
      oldFileUrl !== newFileUrl &&
      oldFileUrl.startsWith(BASE_URL)
    ) {
      const relativePath = oldFileUrl.replace(`${BASE_URL}/`, "");
      const filePath = path.join(__dirname, "..", relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file for column '${column}':`, filePath);
      }
    }
  } catch (err) {
    console.error("Error deleting updated signature:", err);
    throw err;
  }
}

async function deleteSignatureFilesFromDB(tableName, id, columns = []) {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new Error("You must provide at least one column name.");
  }

  try {
    const [rows] = await pool.execute(
      `SELECT ${columns.join(", ")} FROM ${tableName} WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return;

    const record = rows[0];

    columns.forEach((col) => {
      const fileUrl = record[col];
      if (fileUrl && fileUrl.startsWith(BASE_URL)) {
        const relativePath = fileUrl.replace(`${BASE_URL}/`, "");
        const filePath = path.join(__dirname, "..", relativePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted file from column '${col}':`, filePath);
        }
      }
    });
  } catch (err) {
    console.error("Error deleting signature files:", err);
    throw err;
  }
}

function getPublicUrl(filePath) {
  if (!filePath) return null;
  return `${BASE_URL}/${filePath.replace(/\\/g, "/")}`;
}
const sendFormToTrainee = async (userId, formType, formId) => {
  try {
    if (!formType || !formId || !userId) {
      return {
        success: false,
        message: "Missing required parameters: formType, formId, or userId.",
      };
    }

    // Check if form exists and belongs to the supervisor
    const query = `SELECT resident_id FROM ${formType} WHERE id = ? AND supervisor_id = ?`;
    const [[form]] = await pool.execute(query, [formId, userId]);
    if (!form) {
      return {
        success: false,
        message: "Form not found or permission denied.",
      };
    }

    if (!form.resident_id) {
      return { success: false, message: "Missing trainee ID in form." };
    }
    const [[name]] = await pool.execute(
      `SELECT Name FROM users WHERE User_ID = ? `,
      [userId]
    );
    // Send in-app notification to the trainee
    await pool.execute(
      "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
      [
        form.resident_id,
        userId,
        `Your ${formType.replace(/_/g, " ")} form has been sent to you by ${
          name.Name
        } for review.`,
      ]
    );
    return {
      success: true,
      message: `Form (${formType}) sent to trainee successfully.`,
    };
  } catch (err) {
    console.error("Database Error:", err);
    return {
      success: false,
      message: "Server error while sending form to trainee.",
    };
  }
};

const sendSignatureToSupervisor = async (userId, formType, formId) => {
  try {
    if (!formType || !formId || !userId) {
      return {
        success: false,
        message: "Missing required parameters: formType, formId, or userId.",
      };
    }
    // Check if form exists and belongs to the supervisor
    const query = `SELECT supervisor_id FROM ${formType} WHERE id = ? AND resident_id = ?`;
    const [[form]] = await pool.execute(query, [formId, userId]);
    if (!form) {
      return {
        success: false,
        message: "Form not found or permission denied.",
      };
    }

    if (!form.supervisor_id) {
      return { success: false, message: "Missing trainee ID in form." };
    }
    const [[name]] = await pool.execute(
      `SELECT Name FROM users WHERE User_ID = ? `,
      [userId]
    );
    // Send in-app notification to the trainee
    await pool.execute(
      "INSERT INTO notifications (user_id, sender_id, message) VALUES (?, ?, ?)",
      [
        form.supervisor_id,
        userId,
        `Your trainee ${name.Name} has signed the  ${formType.replace(
          /_/g,
          " "
        )} form .`,
      ]
    );
    return {
      success: true,
      message: `Form (${formType}) sent to trainee successfully.`,
    };
  } catch (err) {
    console.error("Database Error:", err);
    return {
      success: false,
      message: "Server error while sending form to trainee.",
    };
  }
};
const auth = (Type, requiredFunction) => {
  return async (req, res) => {
    try {
      const user = req.user; // Already decoded from a previous middleware
      if (!user || !user.role) {
        return false;
      }

      // Admin (User_ID = 1) has access to all
      if (user.role === 1) return true;

      if (!requiredFunction) {
        return false;
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) AS count
         FROM users
         JOIN usertypes ON users.Role = usertypes.Id
         JOIN usertype_functions ON usertypes.Id = usertype_functions.UsertypeId
         JOIN functions ON usertype_functions.FunctionsId = functions.Id
         WHERE users.User_ID = ?
           AND usertypes.Type = ?
           AND functions.Name = ?`,
        [user.userId, Type, requiredFunction] // user.role is actually the User_ID
      );

      return rows[0].count > 0;
    } catch (error) {
      console.error("Auth Error:", error);
      return false;
    }
  };
};

const checkFormLimitAndCleanDrafts = async (traineeId, formType, currentFormId = null) => {
  try {
    // Define form type configurations with their maximum limits
    const formLimits = {
      case_based_discussion_assessment: {
        table: "case_based_discussion_assessment",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 3,
      },
      grand_round_presentation_assessment: {
        table: "grand_round_presentation_assessment",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 1,
      },
      mortality_morbidity_review_assessment: {
        table: "mortality_morbidity_review_assessment",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 4,
      },
      seminar_assessment: {
        table: "seminar_assessment",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 5,
      },
      mini_cex: {
        table: "mini_cex",
        idCol: "resident_id",
        sentCol: "sent_to_trainee",
        draftCol: "sent_to_trainee",
        draftValue: 0,
        maxAllowed: 19,
      },
      dops: {
        table: "dops",
        idCol: "resident_id",
        sentCol: "is_sent_to_trainee",
        draftCol: "is_sent_to_trainee",
        draftValue: 0,
        maxAllowed: 1,
      },
      journal_club_assessment: {
        table: "journal_club_assessment",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 4,
      },
      fellow_resident_evaluation: {
        table: "fellow_resident_evaluation",
        idCol: "resident_id",
        sentCol: "sent",
        draftCol: "sent",
        draftValue: 0,
        maxAllowed: 1,
      },
    };

    // Check if the formType is valid
    const formConfig = formLimits[formType];
    if (!formConfig) {
      return {
        success: false,
        message: `Invalid form type: ${formType}`,
      };
    }

    // Get the current count of submitted forms
    const [submittedForms] = await pool.execute(
      `SELECT COUNT(*) as count FROM ${formConfig.table} 
       WHERE ${formConfig.idCol} = ? AND ${formConfig.sentCol} = 1`,
      [traineeId]
    );

    const currentCount = submittedForms[0].count + 1;

    // Check if the user has reached the maximum allowed forms
    if (currentCount === formConfig.maxAllowed) {
      // Delete all drafts for this form type for this trainee, except the current form being submitted
      let deleteQuery = `DELETE FROM ${formConfig.table} 
                         WHERE ${formConfig.idCol} = ? AND ${formConfig.draftCol} = ?`;
      let deleteParams = [traineeId, formConfig.draftValue];
      
      // If currentFormId is provided, exclude it from deletion
      if (currentFormId) {
        deleteQuery += ` AND id != ?`;
        deleteParams.push(currentFormId);
      }
      
      const [deleteResult] = await pool.execute(deleteQuery, deleteParams);
      
      return {
        success: true,
        canSubmit: true,
        currentCount: currentCount,
        maxAllowed: formConfig.maxAllowed,
        remaining: formConfig.maxAllowed - currentCount,
        deletedDrafts: deleteResult.affectedRows
      };
    }
    
    if (currentCount > formConfig.maxAllowed) {
      return {
        success: true,
        canSubmit: false,
        message: `Maximum limit reached (${formConfig.maxAllowed}). All draft forms have been deleted.`,
      };
    }

    // User can still submit more forms
    return {
      success: true,
      canSubmit: true,
      currentCount: currentCount,
      maxAllowed: formConfig.maxAllowed,
      remaining: formConfig.maxAllowed - currentCount,
    };
  } catch (error) {
    console.error("Error checking form limits:", error);
    return {
      success: false,
      message: "Server error while checking form limits",
      error: error.message,
    };
  }
};

module.exports = {
  sendFormToTrainee,
  sendSignatureToSupervisor,
  auth,
  getPublicUrl,
  deleteSignatureFilesFromDB,
  deleteOldSignatureIfUpdated,
  cleanupUploadedFiles,
  checkFormLimitAndCleanDrafts,
};
