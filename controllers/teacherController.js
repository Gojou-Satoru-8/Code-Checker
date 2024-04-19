const Course = require("../models/Course");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getTeacherHome = (req, res, next) => {
  console.log(req.teacher);
  //   res.status(200).render("courses.ejs", { teacher: req.teacher });
  res.status(200).json({
    status: "success",
    data: {
      teacher: req.teacher,
    },
  });
};

exports.getAllCoursesTaught = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/teachers/home");
};

exports.getCourseAssignments = (req, res, next) => {
  // Middleware preceded by protectTeacher(), so req.teacher will always be set:
  const teacher = req.teacher;
  const course_code = req.params.course_code;

  //   const [courseDetail] = teacher.courses.filter((course) => course.code === course_code);  // OR:
  const courseDetail = teacher.courses.find((course) => course.code === course_code);
  if (!courseDetail) throw new AppError("No such course taught by this teacher!", 404, "JSON");
  //   res.status(200).json({
  //     teacher: req.teacher,
  //     course: courseDetail,
  //   });
  res.render("assignments.ejs", { teacher, course: courseDetail });
};

exports.getPostAssignmentsPage = (req, res, next) => {
  res.status(200).render("postAssignments.ejs");
};
