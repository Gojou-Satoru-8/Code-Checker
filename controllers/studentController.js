exports.getStudentCourses = (req, res, next) => {
  console.log(req.student);
  res.status(200).render("courses.ejs", { student: req.student });
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     student: req.student,
  //   },
  // });
};
