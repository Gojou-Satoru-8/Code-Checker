const express = require("express");
// const courseRouter = require("./courseRouter");
const authController = require("../controllers/authController");
const teacherController = require("../controllers/teacherController");

const router = express.Router({ mergeParams: true });

router.route("/login").get(authController.getTeacherLogin).post(authController.postTeacherLogin);
router.get("/home", authController.protectTeacher, teacherController.getTeacherHome);
// router.use("/courses", authController.protectTeacher, courseRouter);
router.get("/courses", authController.protectTeacher, teacherController.getAllCoursesTaught);
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
module.exports = router;
