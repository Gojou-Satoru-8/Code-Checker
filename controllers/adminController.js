const path = require("path");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
// ADMIN STUFF:

// ROUTE: /admin
exports.getAdminPage = (req, res, next) => {
  res.status(200).render("admin.ejs", { admin: req.teacher });
};

// ADMIN ROUTES FOR COURSES:
// ROUTE: /admin/courses
exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find(req.query);
  res.status(200).json({ status: "success", results: courses.length, data: { courses } });
});

// ROUTE: /admin/courses (POST):
exports.addCourse = catchAsync(async (req, res, next) => {
  const { name, code, language, teacher } = req.body;
  // Here, teacher is input as email, so find teacher Document in order to get the Object Id
  const teacherDoc = await Teacher.findOne({ email: teacher });
  if (!teacherDoc) throw new AppError("No such teacher with that email", 404, "JSON");
  const newCourse = await Course.create({ name, code, language, teacher: teacherDoc.id });
  res.status(201).json({
    status: "success",
    data: newCourse,
  });
});

// ROUTE: /admin/courses/:course_code/new-student (PATCH)
exports.addStudentstoCourse = catchAsync(async (req, res, next) => {
  //   console.log(req.params);
  const courseCode = req.params.course_code;
  console.log({ courseCode });

  const studentEmails = req.body.students.split(",");
  console.log({ studentEmails });

  // Convert Student Emails to Student Docs from DB, then derive the Object Ids.
  const studentDocs = await Promise.all(
    studentEmails.map(async (email) => await Student.findOne({ email: email.trim() })),
  );
  console.log({ studentDocs });
  const studentIds = studentDocs.map((doc) => doc._id);
  console.log({ studentIds });

  const course = await Course.findOne({ code: courseCode });
  console.log("Existing students: ", course);
  if (!course) throw new AppError("No such course with that code", 404, "JSON");

  const filteredStudentIds = studentIds.filter((id) => !course.students.includes(id));
  console.log({ filteredStudentIds });

  course.students.push(...filteredStudentIds);
  await course.save({ runValidators: true });

  res.status(200).json({
    status: "success",
    data: course,
  });
});

// ADMIN ROUTES FOR STUDENTS:
// ROUTE: /admin/students
exports.getAllStudents = catchAsync(async (req, res, next) => {
  const students = await Student.find(req.query);
  res.status(200).json({ status: "success", results: students.length, data: { students } });
});

// ROUTE: /admin/students (POST)
exports.addStudent = catchAsync(async (req, res, next) => {
  const newStudent = await Student.create(req.body);
  res.status(201).json({
    status: "success",
    data: newStudent,
  });
});

// ROUTE: /admin/students/:student_email (PATCH)
exports.updateStudent = catchAsync(async (req, res, next) => {
  const updatedStudent = await Student.findOneAndUpdate({ email: req.params.student_email }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedStudent) throw new AppError("No such student with that email", 404, "JSON");
  res.status(200).json({
    status: "success",
    data: {
      updatedStudent,
    },
  });
});

// ROUTE: /admin/students/:student_email (DELETE)
// HACK: Not to be used now:
exports.deleteStudent = catchAsync(async (req, res, next) => {
  const deletedStudent = await Student.findOneAndDelete({ email: req.params.student_email });
  if (!deletedStudent) throw new AppError("No such student with that email", 404, "JSON");
  res.status(200).json({
    status: "success",
    data: deletedStudent,
  });
});

// ROUTE: /admin/students/:student_email/new-course (DELETE)
exports.addCoursesToStudent = catchAsync(async (req, res, next) => {
  const studentEmail = req.params.student_email;
  console.log({ studentEmail });

  const courseCodes = req.body.courses.split(",");
  console.log({ courseCodes });

  // Convert Course Codes to Course Docs from DB, then derive the Object Ids.
  const courseDocs = await Promise.all(courseCodes.map(async (code) => await Course.findOne({ code: code.trim() })));

  console.log({ courseDocs });
  const courseIds = courseDocs.map((doc) => doc._id);
  console.log({ courseIds });

  const student = await Student.findOne({ email: studentEmail });
  if (!student) throw new AppError("No such student with that email", 404, "JSON");

  const filteredCourseIds = courseIds.filter((id) => !student.courses.map((course) => course.id).includes(id));
  // NOTE: Here, student is populated with courses, thus student.courses is an array of Docs, hence we map them
  //   to their ids in the filter
  console.log("Student Courses:", student.courses);
  console.log({ filteredCourseIds });

  student.courses.push(...filteredCourseIds);
  await student.save({ validateBeforeSave: true });

  res.status(200).json({ status: "success", data: student });
});

// ADMIN ROUTES FOR TEACHERS:
// ROUTE: /admin/teachers
exports.getAllTeachers = catchAsync(async (req, res, next) => {
  const teachers = await Teacher.find(req.query);
  res.status(200).json({ status: "success", results: teachers.length, data: { teachers } });
});

// ROUTE: /admin/teachers (POST)
exports.addTeacher = catchAsync(async (req, res, next) => {
  const newTeacher = await Teacher.create(req.body);
  res.status(201).json({
    status: "success",
    data: newTeacher,
  });
});

// ROUTE: /admin/teachers/:teacher_email (PATCH)
exports.updateTeacher = catchAsync(async (req, res, next) => {
  const updatedTeacher = await Teacher.findOneAndUpdate({ email: req.params.teacher_email }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedTeacher) throw new AppError("No such teacher with that email", 404, "JSON");
  res.status(200).json({
    status: "success",
    data: {
      updatedTeacher,
    },
  });
});
