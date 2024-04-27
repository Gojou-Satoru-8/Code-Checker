const express = require("express");
// const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const teacherController = require("../controllers/teacherController");

const router = express.Router({ mergeParams: true });

router.route("/").get(teacherController.redirectToTeacherHome);
// NOTE: No need of authController.protectTeacher in routes where redirection occurs to a route that already has
// that middleware (/teachers/home, for example)
router.route("/me").get(authController.protectTeacher, authController.me);

router.route("/login").get(authController.getTeacherLogin).post(authController.postTeacherLogin);
router.route("/logout").get(authController.protectTeacher, authController.logout);

router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").get(authController.getResetPasswordPage).patch(authController.resetPassword);
router.route("/update-password").patch(authController.protectTeacher, authController.updatePassword);
router
  .route("/update-pfp")
  .patch(
    authController.protectTeacher,
    authController.uploadPfp,
    authController.resizeUserPhoto,
    authController.updatePfp,
  );

router.get("/home", authController.protectTeacher, teacherController.getTeacherHome);
// router.use("/courses", authController.protectTeacher, courseRouter);
router.get("/courses", teacherController.redirectToTeacherHome);
// Currently redirecting to /teachers/home
router
  .route("/courses/:course_code")
  .get(authController.protectTeacher, teacherController.getCourseAssignments)
  .post(authController.protectTeacher, teacherController.postCourseAssignment);
router.get(
  "/courses/:course_code/new-assignment",
  authController.protectTeacher,
  teacherController.getPostAssignmentsPage,
);

// NOTE: Following route essentially redirects to /courses/:course_code, using the same middleware
router.get("/courses/:course_code/assignments/", authController.protectTeacher, teacherController.redirectToCourse);
router.get(
  "/courses/:course_code/assignments/:assign_id",
  authController.protectTeacher,
  teacherController.getAssignmentQuestions,
);

// ADMIN Stuff:
// router
//   .route("/admin")
//   .get(authController.protectTeacher, authController.restrictTo("admin"), authController.getAdminPage);

// router
//   .route("/admin/courses")
//   .get(authController.restrictTo("admin"), authController.getAllCourses)
//   .post(authController.restrictTo("admin"), authController.addCourse);

// router
//   .route("/admin/courses/:course_code/new-student")
//   .patch(authController.restrictTo("admin"), authController.addStudentstoCourse);

// router.route("/admin/students/").get(authController.restrictTo("admin"), authController.getAllStudents);
// router.route("/admin/students/:student_email").patch(authController.updateStudent);
module.exports = router;
