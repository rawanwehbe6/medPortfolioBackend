const pool = require("../config/db");
const jwt = require('jsonwebtoken');// For generating JWT tokens

const auth = (requiredFunction) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token)
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      if (!decoded.role)
        return res.status(401).json({ message: "Invalid token: Role missing" });

      req.user = decoded;

      if (decoded.role === 1 || requiredFunction === "Image") return next(); // Admin can access everything

      if (!requiredFunction) {
        return res
          .status(500)
          .json({ message: "Internal Server Error: Function name missing" });
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM usertype_functions 
         JOIN functions ON usertype_functions.FunctionsId = functions.Id
         WHERE usertype_functions.UsertypeId = ? AND functions.Name = ?`,
        [decoded.role, requiredFunction]
      );

      console.log("Permission Check:", rows);

      if (rows[0].count > 0) return next();
      const [functionRow] = await pool.execute(
        `SELECT Id, Name FROM functions WHERE Name = ? LIMIT 1`,
        [requiredFunction]
      );
      const [username] = await pool.execute(
        `SELECT Name FROM users WHERE User_ID = ? LIMIT 1`,
        [decoded.userId]
      );

      if (functionRow.length > 0) {
        const functionId = functionRow[0].Id;
        const functionName = functionRow[0].Name;

        //     const [logRow] = await pool.execute(
        //       `SELECT cumulative FROM forbidden_logs
        //  WHERE User_ID = ? AND Function_ID = ?`,
        //       [decoded.user_id, functionId]
        //     );

        //     const newCumulative = logRow.length > 0 ? logRow[0].cumulative + 1 : 1;
        console.log(decoded.userId, username[0].Name, functionId, functionName);
        await pool.execute(
          `INSERT INTO forbidden_logs (User_ID, User_Name, Function_ID, Function_Name, timestamp, cumulative)
          VALUES (?, ?, ?, ?, NOW(), ?)
          ON DUPLICATE KEY UPDATE 
          cumulative = VALUES(cumulative),
          timestamp = NOW()`,
          [decoded.userId, username[0].Name, functionId, functionName, 1]
        );
      }

      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    } catch (error) {
      console.error("Auth Error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};


module.exports = auth;
