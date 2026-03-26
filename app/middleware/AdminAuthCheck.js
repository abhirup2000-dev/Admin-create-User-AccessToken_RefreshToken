
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


// const Admin = require("../models/admin");
// const jwt = require("jsonwebtoken");

// const AdminAuthCheck = async (req, res, next) => {
//   const accessToken = req.cookies?.adminAccessToken;
//   const refreshToken = req.cookies?.adminRefreshToken;

//   // ❌ No tokens
//   if (!accessToken && !refreshToken) {
//     return res.redirect("/admin/login");
//   }

//   // ✅ Try access token
//   try {
//     const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
//     req.admin = decoded;
//     return next();
//   } catch (err) {
//     // Access token failed → try refresh
//   }

//   // 🔁 Try refresh token
//   if (!refreshToken) {
//     return res.redirect("/admin/login");
//   }

//   try {
//     const decodedRefresh = jwt.verify(
//       refreshToken,
//       process.env.JWT_REFRESH_SECRET_KEY
//     );

//     const user = await Admin.findById(decodedRefresh.userId);

//     // ❌ Invalid refresh token
//     if (!user || user.refreshToken !== refreshToken) {
//       res.clearCookie("adminAccessToken");
//       res.clearCookie("adminRefreshToken");
//       return res.redirect("/admin/login");
//     }

//     // 🔥 Generate new access token
//     const newAccessToken = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "15m" }
//     );

//     res.cookie("adminAccessToken", newAccessToken, {
//       httpOnly: true,
//       maxAge: 15 * 60 * 1000,
//     });

//     req.admin = decodedRefresh;
//     next();

//   } catch (error) {
//     res.clearCookie("adminAccessToken");
//     res.clearCookie("adminRefreshToken");
//     return res.redirect("/admin/login");
//   }
// };

// module.exports = AdminAuthCheck;