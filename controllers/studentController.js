const AppError = require("../utils/appError");

exports.getStudentHome = (req, res, next) => {
  console.log(req.student);
  // res.status(200).render("courses.ejs", { student: req.student });
  res.status(200).json({
    status: "success",
    data: {
      student: req.student,
    },
  });
};

exports.getAllCoursesTaken = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/students/home");
};

exports.getCourseAssignments = (req, res, next) => {
  // Middleware preceded by protectStudent(), so req.student will always be set:
  const student = req.student;
  const course_code = req.params.course_code;

  //   const [courseDetail] = student.courses.filter((course) => course.code === course_code);  // OR:
  const courseDetail = student.courses.find((course) => course.code === course_code);
  if (!courseDetail) throw new AppError("No such course studied by this student!", 404, "JSON");
  // res.status(200).json({
  //   student: req.student,
  //   course: courseDetail,
  // });
  res.render("assignments.ejs", { student, course: courseDetail });
};
