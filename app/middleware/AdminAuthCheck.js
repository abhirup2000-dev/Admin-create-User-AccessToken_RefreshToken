
const jwt = require("jsonwebtoken");

const AdminAuthCheck = (req, res, next) => {

  const token = req.cookies?.admintoken;

  if (!token) {
    
    return next(); // No token, continue (or redirect to login if route requires admin)
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {

    if (err) {

      console.error("Admin JWT verification failed:", err.message);

      return next(); // Or redirect / respond with 401 if needed
    }

    req.admin = decoded; // Attach admin info to request

    next();
  });
};

module.exports = AdminAuthCheck;