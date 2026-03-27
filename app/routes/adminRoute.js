const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/AdminController");
const AdminAuthCheck = require("../middleware/AdminAuthCheck");


//  PUBLIC ROUTES
router.get("/admin/login", AdminController.adminLoginPage);
router.post("/admin/login/create", AdminController.adminLogin);


//  PROTECTED ROUTES
router.use(AdminAuthCheck);

// dashboard
router.get("/admin/dashboard", AdminController.AdminCheckAuth, AdminController.adminDashboard);

// profile
router.get("/admin/profile", AdminController.editAdminProfile);
router.post("/update/data/:id", AdminController.updateAdminData);


// user actions
router.get("/admin/signup-employee", AdminController.signupUser);
router.post("/admin/create-employee", AdminController.createUser);
router.get("/toggle-status/:id", AdminController.deactivateUser);
router.get("/delete/:id", AdminController.deleteUser);

// logout
router.get("/admin/logout", AdminController.logout);

module.exports = router;
