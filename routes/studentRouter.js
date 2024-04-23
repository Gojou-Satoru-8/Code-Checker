const express = require("express");
// const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");

const router = express.Router({ mergeParams: true });

router.route("/login").get(authController.getStudentLogin).post(authController.postStudentLogin);
router.get("/home", authController.protectStudent, studentController.getStudentHome);
// router.use("/courses", authController.protectStudent, courseRouter);
// NOTE: Setting the authController.protectStudent here and not inside courseRouter because for route "/",
// it won't be possible to specify since the "/" serves both /teachers/courses/ and /students/courses
// Setting protectStudent will redirect to /students/login for students as well as teachers if not logged in
// Setting protectTeacher will redirect to /teachers/login for teachers as well as students if not logged in

router.get("/courses", authController.protectStudent, studentController.getAllCoursesTaken);
router.get("/courses/:course_code", authController.protectStudent, studentController.getCourseAssignments);

// NOTE: Following route essentially redirects to /courses/:course_code, using the same middleware
router.get("/courses/:course_code/assignments/", authController.protectStudent, studentController.redirectToCourse);
router
  .route("/courses/:course_code/assignments/:assign_id")
  .get(authController.protectStudent, studentController.getAssignmentQuestions)
  .post(authController.protectStudent, studentController.uploadFiles, studentController.postAssignmentSolutions);

router.route("/all-submissions").get(authController.protectStudent, studentController.viewSubmissions);
module.exports = router;
