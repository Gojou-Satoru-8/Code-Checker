const express = require("express");
// const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");

const router = express.Router({ mergeParams: true });

router.route("/").get(authController.protectTeacher, authController.restrictTo("admin"), adminController.getAdminPage);

// router.use(authController.protectTeacher, authController.restrictTo("admin"));

// ROUTES FOR COURSES:
router.route("/courses").get(adminController.getAllCourses).post(adminController.addCourse);
router.route("/courses/:course_code/new-student").patch(adminController.addStudentstoCourse);
// NOTE: Add students to course is the default way of mapping students to courses.
// ROUTES FOR STUDENTS:
router.route("/students").get(adminController.getAllStudents).post(adminController.addStudent);
router.route("/students/:student_email").patch(adminController.updateStudent);
// router.route("/students/:student_email/new-course").patch(adminController.addCoursesToStudent);
// ROUTES FOR TEACHERS:
router.route("/teachers").get(adminController.getAllTeachers).post(adminController.addTeacher);
router.route("/teachers/:teacher_email").patch(adminController.updateTeacher);

module.exports = router;
