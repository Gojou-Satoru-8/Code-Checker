const express = require("express");
// const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");

const router = express.Router({ mergeParams: true });

router.route("/").get(studentController.redirectToStudentHome);
// NOTE: No need of authController.protectStudent in routes where redirection occurs to a route that already has
// that middleware (/teachers/home, for example)
router.route("/me").get(authController.protectStudent, authController.me);
router.route("/login").get(authController.getStudentLogin).post(authController.postStudentLogin);
router.route("/logout").get(authController.protectStudent, authController.logout);

router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").get(authController.getResetPasswordPage).patch(authController.resetPassword);
router.route("/update-password").patch(authController.protectStudent, authController.updatePassword);
router
  .route("/update-pfp")
  .patch(
    authController.protectStudent,
    authController.uploadPfp,
    authController.resizeUserPhoto,
    authController.updatePfp,
  );

router.get("/home", authController.protectStudent, studentController.getStudentHome);
// router.use("/courses", authController.protectStudent, courseRouter);
// NOTE: Setting the authController.protectStudent here and not inside courseRouter because for route "/",
// it won't be possible to specify since the "/" serves both /teachers/courses/ and /students/courses
// Setting protectStudent will redirect to /students/login for students as well as teachers if not logged in
// Setting protectTeacher will redirect to /teachers/login for teachers as well as students if not logged in

router.get("/courses", studentController.redirectToStudentHome);
router.get("/courses/:course_code", authController.protectStudent, studentController.getCourseAssignments);

// NOTE: Following route essentially redirects to /courses/:course_code, using the same middleware
router.get("/courses/:course_code/assignments/", authController.protectStudent, studentController.redirectToCourse);
router
  .route("/courses/:course_code/assignments/:assign_id")
  .get(authController.protectStudent, studentController.getAssignmentQuestions)
  .post(authController.protectStudent, studentController.uploadFiles, studentController.postAssignmentSolutions);

router.route("/submissions").get(authController.protectStudent, studentController.viewAllSubmissionsByStudent);

// NOTE: Following route will be used by teachers to: (1) GET - get student submissions in evaluate page,
//  (2) PATCH - write or update remarks for these submissions.
router
  .route("/submissions/:submissionId")
  .get(authController.protectTeacher, studentController.viewSubmissionByStudent)
  .patch(authController.protectTeacher, studentController.updateRemarks);
router
  .route("/:studentId/submissions/:questionId")
  .get(authController.protectStudent, studentController.viewSubmissionByStudentAndQuestion)
  .delete(authController.protectStudent, studentController.deleteSubmissionByStudentAndQuestion);

module.exports = router;
