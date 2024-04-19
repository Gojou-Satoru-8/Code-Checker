const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllStudentCourses = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  if (req.student) res.redirect("/students/home");
  else if (req.teacher) res.redirect("/teachers/home");
};

exports.getCourseAssignments = (req, res, next) => {
  // Middleware preceded by protectStudent(), so req.student will always be set:
  if (req.student) {
    const student = req.student;
    const course_code = req.params.course_code;

    //   const [courseDetail] = student.courses.filter((course) => course.code === course_code);  // OR:
    const courseDetail = student.courses.find((course) => course.code === course_code);
    if (!courseDetail) throw new AppError("No such course studied by this student!", 404, "JSON");
    res.status(200).json({
      student: req.student,
      course: courseDetail,
    });
  } else if (req.teacher) {
    const teacher = req.teacher;
    const course_code = req.params.course_code;

    //   const [courseDetail] = teacher.courses.filter((course) => course.code === course_code);  // OR:
    const courseDetail = teacher.courses.find((course) => course.code === course_code);
    if (!courseDetail) throw new AppError("No such course studied by this teacher!", 404, "JSON");
    res.status(200).json({
      teacher: req.teacher,
      course: courseDetail,
    });
  }
};
