const express = require("express");
const courseController = require("../controllers/courseController");
const router = express.Router({ mergeParams: true });

// TODO: Dilemma here as to how to route "/" such that it calls authController.protectStudent if /students/courses
// and calls authController.protectTeacher if at /teachers/courses.
router.get("/", courseController.getAllStudentCourses);
router.get("/:course_code", courseController.getCourseAssignments);

module.exports = router;
