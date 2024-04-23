const multer = require("multer");
const path = require("path");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Submission = require("../models/Submission");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log("------------- Multer diskStorage destination middleware:");
    console.log(file);
    cb(null, `${__dirname}/../public/code-uploads`);
  },
  filename: (req, file, cb) => {
    // console.log("------------- Multer diskStorage fileName middleware:");
    // console.log(file);
    const fileExt = file.mimetype.split("/").at(-1);
    console.log(`${req.student.id}-${file.originalname}.${fileExt}`);

    cb(null, `${req.student.id}-${file.originalname}`);
  },
});

// const multerFilter = (req, file, cb) => {
//   // if file.mime
//   console.log("------------- Multer Filter middleware:");
//   console.log(file);

//   cb(null, true);
// };

const upload = multer({
  storage: multerStorage,
  // storage: multer.memoryStorage(),
  // fileFilter: multerFilter,  // NOTE: The filtering functionality is added on the client side.
});

exports.uploadFiles = upload.array("codeFiles");

// ROUTE: /students/home
exports.getStudentHome = (req, res, next) => {
  console.log(req.student);
  res.status(200).render("courses.ejs", { student: req.student });
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     student: req.student,
  //   },
  // });
};

// ROUTE: /students/courses
exports.getAllCoursesTaken = (req, res, next) => {
  // No dedicated courses page has been defined, since the home page suffices for now.
  res.redirect("/students/home");
};

// ROUTE: /students/courses/:course_code
exports.getCourseAssignments = catchAsync(async (req, res, next) => {
  // Middleware preceded by protectStudent(), so req.student will always be set:
  const student = req.student;
  const { course_code } = req.params;

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

// ROUTE: /students/courses/:course_code/assignments
exports.redirectToCourse = (req, res, next) => {
  res.redirect(`/students/courses/${req.params.course_code}`);
};

// ROUTE: /students/courses/:course_code/assignments/:assign_id
exports.getAssignmentQuestions = catchAsync(async (req, res, next) => {
  const student = req.student;
  const { course_code, assign_id } = req.params;

  const course = student.courses.find((course) => course.code === course_code);
  await course.populate("assignments");
  // console.log(course.assignments);

  const assignment = course.assignments.find((assignment) => assignment.id === assign_id);
  // console.log(assignment);

  // Find existing submission by students for each question inside the assignment:
  for (const question of assignment.questions) {
    console.log("Question: ", question);
    const existingSubmission = await Submission.findOne({ student: student.id, question: question.id });
    // console.log("Existing submission: ", existingSubmission);
    // question.existingSubmissionPath = existingSubmission.filePath;
    // NOTE: Above way to be used if files are to be downloaded via link relative to static folder ie public
    question.existingSubmissionId = existingSubmission?.id;
    // console.log("Question with existing submission:", question);
    // NOTE: Logging question to the console will not show the properties set right now, but only those that
    // have been persisted to the database.
    console.log("Question with existing submission:", question.existingSubmissionId);
  }

  // res.status(200).json({
  //   status: "success",
  //   data: { course, assignment },
  // });
  res.status(200).render("upload_assignments.ejs", {
    course: { name: course.name, code: course_code },
    student: { name: student.name, id: student.id },
    assignment,
  });
});

// ROUTE: /students/courses/:course_code/assignments/:assign_id (POST)
exports.postAssignmentSolutions = catchAsync(async (req, res, next) => {
  console.log("Request URL:", req.originalUrl);
  console.log("Headers Content-Type:", req.headers?.["content-type"]);

  // console.log("Request Body:", req.body);
  // console.log("Files uploaded: ", req.files);
  const student = req.student;
  const { course_code, assign_id } = req.params;

  const submissions = req.files.map((file) => {
    const questionId = file.originalname.split(".").at(0);
    return { question: questionId, student: req.student.id, filePath: file.filename };
  });
  console.log("Submissions:", submissions);
  console.log("--------------------------X--------------------------");
  // NOTE: Now we gotta exclude those submissions already inserted, otherwise insertMany causes problems.
  // One way:
  // const submissionsToInsert = [];
  // for (const submission of submissions) {
  //   const existingSubmission = await Submission.findOne(submission);
  //   console.log(existingSubmission);
  //   if (existingSubmission.id) console.log("Existing submission persists");
  //   else submissionsToInsert.push({...submission, createdAt: Date.now()});
  // }
  // const insertedSubmissions = await Submission.insertMany(submissionsToInsert);
  // const insertedSubmissions = await Submission.insertMany(submissions, { ordered: true });

  // Better way: findOneAndUpdate() with upsert: true
  const insertedSubmissions = [];
  for (const submission of submissions) {
    const insertedSubmission = await Submission.findOneAndUpdate(
      submission, // Finds a document with this query
      { $setOnInsert: submission },
      { new: true, upsert: true, runValidators: true },
      // If no docs found matching the query, upsert will insert a new doc. But to avoid existing docs (which
      // matched the query) to get overwritten unnecessarily, $setOnInsert ensures that these fields are set
      // only on insert
    );
    insertedSubmissions.push(insertedSubmission);
  }
  console.log("Inserted Submissions: ", insertedSubmissions);

  res.status(200).json({
    status: "success",
    message: "Files uploded successfully",
    filesUploaded: req.files.length,
    filesInsertedToDB: insertedSubmissions.length,
    studentId: student.id,
    questionIds: insertedSubmissions.map((submission) => submission.question.id),
    // NOTE: If using submission Id for managing routes, following data needs to be sent:
    // submissions: insertedSubmissions.map((submission) => ({
    //   submissionId: submission.id,
    //   questionId: submission.question.id,
    // })),
  });
});

exports.viewSubmissionsByStudent = catchAsync(async (req, res, next) => {
  const submissions = await Submission.find({ student: req.student.id });
  console.log(submissions);
  res.status(200).json({
    data: submissions,
  });
});

// exports.viewSubmissionById (name if using submissionId in req.params)
exports.viewSubmissionByStudentAndQuestion = catchAsync(async (req, res, next) => {
  // const submission = await Submission.findById(req.params.submissionId);
  const submission = await Submission.findOne({ student: req.params.studentId, question: req.params.questionId });
  console.log(submission);

  if (!submission)
    throw new AppError("No submission by this student for this question", 404, "render", "/students/home");

  // res.status(200).json({
  //   data: submission,
  // });
  res.status(200).sendFile(submission.filePath, { root: `${__dirname}/../public/code-uploads` });
  // res.status(200).download(submission.filePath, { root: `${__dirname}/../public/code-uploads` });
  // Both produce (download) effect, except sendFile instructs browsers to present supported file types
});

// deleteSubmissionById (name if using submissionId in req.params)
exports.deleteSubmissionByStudentAndQuestion = catchAsync(async (req, res, next) => {
  // const submission = await Submission.findByIdAndDelete(req.params.submissionId);
  const submission = await Submission.findOne({ student: req.params.studentId, question: req.params.questionId });
  console.log(submission);
  console.log("Deleted submission: ", submission);

  if (!submission) console.log("No submission to delete", 404);

  res.status(204).json({ status: "success", message: "Deleted Successfully" });
});
