const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Question = require("../models/Question");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { redirect } = require("statuses");

// ROUTE: /teachers/home
exports.getTeacherHome = (req, res, next) => {
  console.log(req.teacher);
  res.status(200).render("courses.ejs", { teacher: req.teacher });
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     teacher: req.teacher,
  //   },
  // });
};

// ROUTE: /teachers/courses
exports.redirectToTeacherHome = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/teachers/home");
};

// ROUTE: /teachers/courses/:course_code
exports.getCourseAssignments = catchAsync(async (req, res, next) => {
  // Middleware preceded by protectTeacher(), so req.teacher will always be set:
  const teacher = req.teacher;
  const course_code = req.params.course_code;

  //   const [course] = teacher.courses.filter((course) => course.code === course_code);  // OR:
  const course = teacher.courses.find((course) => course.code === course_code);
  if (!course) throw new AppError("No such course taught by this teacher!", 404, "JSON");
  await course.populate({ path: "assignments" });
  // NOTE: Populating assignments populates the questions too, since Assignment schema is configured to populate
  // the questions fields using pre-find middleware.

  // res.status(200).json({
  //   teacher: req.teacher,
  //   course,
  // });
  res.status(200).render("assignments.ejs", { teacher, course: course });
  // TODO: Might need to rethink what data is being sent for rendering, since as (1) whole teacher object is unused
  // (2) furthermore, assignments is the real requirement here.
});

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

// ROUTE: /teachers/courses/:course_code/new-assignment
exports.getPostAssignmentsPage = (req, res, next) => {
  const course = req.teacher.courses.find((course) => course.code === req.params.course_code);
  // console.log("Course for post-assignments page:", course);

  res.status(200).render("postAssignments.ejs", { course });
};

// ROUTE: /teachers/courses/:course_code/assignments
exports.redirectToCourse = (req, res, next) => {
  res.redirect(`/teachers/courses/${req.params.course_code}`);
};

// ROUTE: /teachers/courses/:course_code/assignments/:assign_id
exports.getAssignmentQuestions = catchAsync(async (req, res, next) => {
  const teacher = req.teacher;
  const { course_code, assign_id } = req.params;

  const course = teacher.courses.find((course) => course.code === course_code);
  // await course.populate("assignments");  // NOTE: No need to popualte all the assignments
  // console.log(course.assignments);
  // const assignment = course.assignments.find((assignment) => assignment.id === assign_id);

  const assignment = await Assignment.findById(assign_id);
  console.log(assignment);
  for (const question of assignment.questions) {
    await question.populate("submissions");
    console.log(question.submissions);
  }
  // console.log(assignment.questions);

  // res.status(200).json({
  //   status: "success",
  //   data: { course, assignment },
  // });
  res.status(200).render("evaluate.ejs", {
    course: { name: course.name, code: course_code },
    assignment,
  });
});
