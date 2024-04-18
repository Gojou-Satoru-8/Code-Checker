const express = require("express");
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");
const router = express.Router({ mergeParams: true });

router.route("/login").get(authController.getStudentLogin).post(authController.postStudentLogin);
router.get("/home", authController.protect, studentController.getStudentCourses);
module.exports = router;
