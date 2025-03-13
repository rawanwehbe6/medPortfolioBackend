const jwt = require('jsonwebtoken');

//This extracts the token from the Authorization header in the incoming request.
const authenticate = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);//checks if the token is valid using the secret key
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  console.log("Authorization Header:", token); // Debugging

  if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      console.log("Decoded User:", decoded); // Debugging
      req.user = decoded;
      next();
  } catch (err) {
      console.error("JWT Verification Error:", err.message);
      res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
