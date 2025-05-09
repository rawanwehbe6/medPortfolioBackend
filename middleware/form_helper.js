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

module.exports = {
  sendFormToTrainee,
  sendSignatureToSupervisor,
  auth,
  getPublicUrl,
  deleteSignatureFilesFromDB,
  deleteOldSignatureIfUpdated,
  cleanupUploadedFiles,
};
