const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// ROUTE: /students/home
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

// ROUTE: /students/courses
exports.getAllCoursesTaken = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/students/home");
};

// ROUTE: /teachers/courses/:course_code
exports.getCourseAssignments = catchAsync(async (req, res, next) => {
  // Middleware preceded by protectStudent(), so req.student will always be set:
  const student = req.student;
  const course_code = req.params.course_code;

  //   const [course] = student.courses.filter((course) => course.code === course_code);  // OR:
  const course = student.courses.find((course) => course.code === course_code);
  if (!course) throw new AppError("No such course studied by this student!", 404, "JSON");
  await course.populate({ path: "assignments" });
  // NOTE: Populating assignments populates the questions too, since Assignment schema is configured to populate
  // the questions fields using pre-find middleware.

  // res.status(200).json({
  //   student: req.student,
  //   course: course,
  // });
  res.render("assignments.ejs", { student, course: course });
  // TODO: Might need to rethink what data is being sent for rendering, since as (1) whole student object is unused
  // (2) furthermore, assignments is the real requirement here.
});
