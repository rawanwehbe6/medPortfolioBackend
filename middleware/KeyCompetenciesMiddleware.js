const jwt = require('jsonwebtoken'); // For verifying JWT tokens

const checkTraineeRole = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user role is 2 (trainee)
    if (decoded.role !== 2) {
      return res.status(403).json({ message: 'Permission denied: User is not a trainee' });
    }

    // Attach decoded information to request object (optional, if needed for other middleware or routes)
    req.user = decoded; // Store the decoded user info (including userId) in the request
    // Continue with the next middleware/route handler
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
module.exports = {
  checkTraineeRole
};
