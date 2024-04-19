const express = require("express");
const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const teacherController = require("../controllers/teacherController");

const router = express.Router({ mergeParams: true });

router.route("/login").get(authController.getTeacherLogin).post(authController.postTeacherLogin);
router.get("/home", authController.protectTeacher, teacherController.getTeacherCourses);
router.use("/courses", authController.protectTeacher, courseRouter);
module.exports = router;
