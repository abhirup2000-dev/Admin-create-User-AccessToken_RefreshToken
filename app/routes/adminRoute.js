const express = require("express");

const AdminController = require("../controllers/AdminController");

const AdminAuthCheck = require("../middleware/AdminAuthCheck");

const router = express.Router();

// login view & create
router.get("/admin/login", AdminController.adminLoginPage);

router.post("/admin/login/create", AdminController.adminLogin);

router.use(AdminAuthCheck);

// get admin dashboard
router.get("/admin/dashboard", AdminController.AdminCheckAuth, AdminController.adminDashboard);
router.get("/admin/edit/:id", AdminController.AdminCheckAuth, AdminController.editAdminProfile);
router.post("/update/data/:id", AdminController.AdminCheckAuth, AdminController.updateAdminData);
router.get("/toggle-status/:id", AdminController.deactivateUser);
router.get("/delete/:id", AdminController.deleteUser);
// logout
router.get("/admin/logout", AdminController.adminLogout);


module.exports = router;