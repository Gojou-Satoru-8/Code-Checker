const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Question = require("../models/Question");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { redirect } = require("statuses");

// ROUTE: /teachers/home
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

// ROUTE: /teachers/courses
exports.getAllCoursesTaught = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/teachers/home");
};

// ROUTE: /teachers/courses/:course_code
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

// ROUTE: /teachers/courses/:course_code (POST only)
exports.postCourseAssignment = async (req, res, next) => {
  console.log("Request URL", req.originalUrl);
  console.log("Request headers", req.headers);
  console.log("Request body", req.body);

  // 1) Extract questions and Insert into Question Collection:
  const questions = req.body.questions.map((questionText) => ({ question: questionText }));
  console.log(questions);

  const insertedQuestions = await Question.insertMany(questions);
  console.log(insertedQuestions);

  // 2) Create an Assignment with assignment name and newly created Question documents array.
  const newAssignment = await Assignment.create({
    name: req.body.assignmentName,
    questions: insertedQuestions,
  });

  // 3) Extract course either from req.teacher object or DB query, and update the course's assignment Array.

  // const course = await Course.findOne({ code: req.params.course_code });
  // console.log("Queried course:", course);
  // NOTE: Getting the course out of teacher object's courses works too, no need for DB transaction again
  // console.log(req.teacher.courses);
  const course = req.teacher.courses.find((course) => course.code === req.params.course_code);
  console.log("Extracted Course: ", course);

  course.assignments.push(newAssignment);
  await course.save();
  console.log(course);

  res.status(200).json({
    status: "success",
    message: "Assignment added successfully",
    redirectUrl: `/teachers/courses/${course.code}/`,
  });
};

// ROUTE: /teachers/courses/:course_code/setAssignment
exports.getPostAssignmentsPage = (req, res, next) => {
  const course = req.teacher.courses.find((course) => course.code === req.params.course_code);
  // console.log("Course for post-assignments page:", course);

  res.status(200).render("postAssignments.ejs", { course });
};
