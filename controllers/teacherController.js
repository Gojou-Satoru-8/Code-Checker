const catchAsync = require("../utils/catchAsync");
const Course = require("../models/Course");
exports.getTeacherCourses = (req, res, next) => {
  console.log(req.teacher);
  res.status(200).render("courses.ejs", { teacher: req.teacher });
  //   res.status(200).json({
  //     status: "success",
  //     data: {
  //       teacher: req.teacher,
  //     },
  //   });
};

// NOTE: To be removed later:
exports.getCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    status: "success",
    data: { courses },
  });
});
