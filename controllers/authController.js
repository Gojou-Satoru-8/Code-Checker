const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: +process.env.JWT_EXPIRES_IN,
    // A string value "60" means 60 milliseconds, int 60 implies 60 seconds, thus the conversion.
  });
  return token;
};

const respondWithCookie = (res, statusCode, cookie, data) => {
  res.cookie(cookie.name, cookie.value, {
    maxAge: +process.env.JWT_EXPIRES_IN * 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(statusCode).json({ status: "success", message: "Logged in!", ...data });
};

exports.getStudentLogin = catchAsync(async (req, res, next) => {
  // If student is already logged in :)
  console.log("Get login triggered");

  if (req.cookies.jwt_student) res.status(302).redirect("/students/home");
  //   Or res.status(302).set({ Location: "/students/home" });
  else res.render("login.ejs");
});

exports.getTeacherLogin = catchAsync(async (req, res, next) => {
  // If teacher is already logged in :)
  if (req.cookies.jwt_teacher) res.status(302).redirect("/teachers/home");
  //   Or res.status(302).set({ Location: "/students/home" });
  else res.render("login.ejs");
});

exports.postStudentLogin = catchAsync(async (req, res, next) => {
  console.log("Post login triggered with: ", req.body);
  // console.log(req.cookies["jwt"]);

  // Extract email and password:
  const { email, password } = req.body;

  // Find student with the given email:
  const student = await Student.findOne({ email }).select("+password");
  console.log(student);

  // If student doesn't exist:
  if (!student) throw new AppError("No such student with that email", 404, "JSON");

  // If student exists but password is incorrect:
  const isPasswordMatch = await student.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError("Wrong password", 401, "JSON");

  //   res.locals.user = student;
  const token = signToken(student._id);
  console.log("JWT token before sending as cookie:", token);
  console.log(typeof +process.env.JWT_EXPIRES_IN);
  console.log(process.env.NODE_ENV);

  const cookie = { name: "jwt_student", value: token };
  const data = {
    redirectURL: "/students/home",
    // student: {
    //   email,
    //   name: student.name,
    //   year: student.year,
    //   courses: student.courses,
    // },
  };
  respondWithCookie(res, 200, cookie, data);
});

exports.postTeacherLogin = catchAsync(async (req, res, next) => {
  console.log(req.body);
  // console.log(req.cookies["jwt"]);

  // Extract email and password:
  const { email, password } = req.body;

  // Find teacher with the given email:
  const teacher = await Teacher.findOne({ email }).select("+password");
  console.log(teacher);

  // If teacher doesn't exist:
  if (!teacher) throw new AppError("No such teacher with that email", 404, "JSON");

  // If teacher exists but incorrect password given:
  const isPasswordMatch = await teacher.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError("Wrong password", 401, "JSON");

  //   res.locals.user = teacher;
  const token = signToken(teacher._id);
  console.log("JWT token before sending as cookie:", token);
  console.log(typeof +process.env.JWT_EXPIRES_IN);
  console.log(process.env.NODE_ENV);

  const cookie = { name: "jwt_teacher", value: token };
  const data = {
    redirectURL: "/teachers/home",
    // teacher: {
    //   email,
    //   name: teacher.email,
    //   role: teacher.role,
    //   courses: teacher.courses,
    // },
  };
  respondWithCookie(res, 200, cookie, data);
});

exports.protectStudent = catchAsync(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);

  // Check is token exists in the cookie:
  const token = req.cookies?.jwt_student;
  // if (!token) throw new AppError("No JWT token present for student", 401, "JSON");
  if (!token) throw new AppError("No JWT token present for student", 401, "render", "/students/login");
  // Redirect URL when using flash messaging: "/flash?err=Logged%20Out&redirectUrl=/students/login"

  // Verify cookie (Possible erros being invalid token and token expired):
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // Find student based on id inside decoded JWT:
  const student = await Student.findById(decoded.id);
  console.log(student);
  req.student = student;
  next();
});

exports.protectTeacher = catchAsync(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);
  // console.log("URL: ", req.url, req.originalUrl, req.path);

  // Check is token exists in the cookie:
  const token = req.cookies?.jwt_teacher;
  // if (!token) throw new AppError("No JWT token present for teacher", 401, "JSON");
  if (!token) throw new AppError("No JWT token present for teacher", 401, "render", "/teachers/login");

  // Verify cookie (Possible erros being invalid token and token expired):
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // Find student based on id inside decoded JWT:
  const teacher = await Teacher.findById(decoded.id).populate({
    path: "courses",
    select: "name code language assignments students -teacher",
  });
  console.log("Teacher retrieved and populated:", teacher);
  req.teacher = teacher;
  next();
});

// ROUTE: /teachers/logout and /students/logout
exports.logout = (req, res, next) => {
  // This middleware will be preceded by either protectStudent() or protectTeacher()
  const user = req.teacher ? "teacher" : "student";
  res.cookie(`jwt_${user}`, "logged_out", {
    maxAge: 0, // We overwrite the cookie with any value, and (most importantly) let it expire immediately.
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  res.status(302).redirect(`/${user}s/login`);
};
