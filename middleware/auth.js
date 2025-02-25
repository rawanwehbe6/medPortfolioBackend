const pool = require("../config/db");
const jwt = require('jsonwebtoken');// For generating JWT tokens

const auth = (requiredFunction) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);

      if (!decoded.role) return res.status(401).json({ message: "Invalid token: Role missing" });

      req.user = decoded;

      if (decoded.role === 1) return next(); // Admin can access everything

      if (!requiredFunction) {
        return res.status(500).json({ message: "Internal Server Error: Function name missing" });
      }

      const [rows] = await pool.execute(
        `SELECT COUNT(*) as count FROM usertype_functions 
         JOIN functions ON usertype_functions.FunctionsId = functions.Id
         WHERE usertype_functions.UsertypeId = ? AND functions.Name = ?`,
        [decoded.role, requiredFunction]
      );

      console.log("Permission Check:", rows);

      if (rows[0].count > 0) return next();
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });

    } catch (error) {
      console.error("Auth Error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};


module.exports = auth;
