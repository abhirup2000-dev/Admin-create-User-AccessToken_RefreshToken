const express = require("express");

const router = express.Router();

const employeeRoute = require("./employeeRoute");

const adminRoute = require("./adminRoute");


router.use(employeeRoute);
router.use(adminRoute);



module.exports = router;