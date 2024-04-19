const express = require("express");
const authController = require("../controllers/authController");
const teacherController = require("../controllers/teacherController");

const router = express.Router({ mergeParams: true });

router.route("/login").get(authController.getTeacherLogin).post(authController.postTeacherLogin);
router.get("/home", authController.protectTeacher, teacherController.getTeacherCourses);
router.get("/courses", teacherController.getCourses);
module.exports = router;
