// const express = require("express");

// const AdminController = require("../controllers/AdminController");

// const AdminAuthCheck = require("../middleware/AdminAuthCheck");

// const router = express.Router();

// // login view & create
// router.get("/admin/login", AdminController.adminLoginPage);

// router.post("/admin/login/create", AdminController.adminLogin);

// router.use(AdminAuthCheck);

// // get admin dashboard
// router.get("/admin/dashboard", AdminController.AdminCheckAuth, AdminController.adminDashboard);
// router.get("/admin/edit/:id", AdminController.AdminCheckAuth, AdminController.editAdminProfile);
// router.post("/update/data/:id", AdminController.AdminCheckAuth, AdminController.updateAdminData);
// router.get("/toggle-status/:id", AdminController.deactivateUser);
// router.get("/delete/:id", AdminController.deleteUser);
// // logout
// router.get("/admin/logout", AdminController.logout);

// module.exports = router;

const express = require("express");
const router = express.Router();

const AdminController = require("../controllers/AdminController");
const AdminAuthCheck = require("../middleware/AdminAuthCheck");

//  PUBLIC ROUTES
router.get("/admin/login", AdminController.adminLoginPage);
router.post("/admin/login/create", AdminController.adminLogin);

//  PROTECTED ROUTES (everything below this uses middleware)
router.use(AdminAuthCheck);

// dashboard
router.get("/admin/dashboard", AdminController.AdminCheckAuth, AdminController.adminDashboard);

// profile
router.get("/admin/profile", AdminController.editAdminProfile);
router.post("/update/data/:id", AdminController.updateAdminData);

// user actions (protect these properly)
router.get("/toggle-status/:id", AdminController.deactivateUser);
router.get("/delete/:id", AdminController.deleteUser);

// logout
router.get("/admin/logout", AdminController.logout);

module.exports = router;
