const Student = require("../models/Student");
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

exports.getStudentLogin = catchAsync(async (req, res, next) => {
  if (!req.user) return res.render("login.ejs");

  const student = await Student.findById(req.user._id).select("+password");
  if (!student) return res.render("login.ejs");
  else res.render("courses.ejs");
  //   next();
});

exports.postStudentLogin = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(req.cookies["jwt"]);

  // Extract email and password:
  const { email, password } = req.body;

  // Find student with the given email:
  const student = await Student.findOne({ email }).select("+password");
  console.log(student);

  // If student doesn't exist:
  if (!student) throw new AppError("No such student with that email", 404, "JSON");

  // If student exists but passwords don't match:
  const isPasswordMatch = await student.isPasswordCorrect(password);
  if (!isPasswordMatch) throw new AppError("Wrong password", 401, "JSON");

  //   res.locals.user = student;
  const token = signToken(student._id);
  console.log("JWT token before sending as cookie:", token);
  console.log(typeof +process.env.JWT_EXPIRES_IN);
  console.log(process.env.NODE_ENV);

  res.cookie("jwt", token, {
    maxAge: +process.env.JWT_EXPIRES_IN * 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged in!",
    redirectURL: "/students/home",
    data: {
      student: {
        email,
        name: student.email,
        year: student.year,
        courses: student.courses,
      },
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log("Cookies: ", req.cookies);

  // Check is token exists in the cookie:
  const token = req.cookies?.jwt;
  if (!token) throw new AppError("No JWT token present", 401, "JSON");

  // Verify cookie (Possible erros being invalid token and token expired):
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // Find student based on id inside decoded JWT:
  const student = await Student.findById(decoded.id);
  console.log(student);
  req.student = student;
  next();
});
