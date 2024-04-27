const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/sendMail");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const multerFilter = (req, file, cb) => {
  console.log("------------- Multer Filter middleware:");
  console.log({ file });

  if (file.mimetype.startsWith("image")) cb(null, true);
  else {
    console.log("Image unaccepted for this file: ", file);
    cb(new AppError("Unaccepted File type", 400, "JSON"), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
});

exports.uploadPfp = upload.single("pfp");

exports.resizeUserPhoto = (req, res, next) => {
  // As only a single file was uploaded, it's available in req.file, in case of multiple uploads, it's req.files.
  console.log("Photo: ", req.file);
  if (!req.file) throw new AppError("No photo uploaded", 400, "JSON");

  const user = req.student || req.teacher;
  const userType = req.student ? "student" : "teacher";
  // NOTE: Since we're using memoryStorage(), thus there is no filename appended to file Object,
  // as done by filename middleware in diskstorage() options. Thus we gotta set it manually.
  // const fileExt = req.file.mimetype.split("/").at(-1);
  // req.file.filename = `user-${user.id}-${req.file.originalname}.${fileExt}`;
  req.file.filename = `${userType}-${user.id}.jpeg`;
  // NOTE: Extension is fixed to jpeg as we're saving as jpeg after processing via sharp.
  // console.log("File Before resizing: ", req.file);
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.resolve(__dirname, "..", "public/user-images", req.file.filename));
  next();
};

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

  res.status(statusCode).json({ status: "success", message: data.message || "Logged in!", ...data });
};

exports.getStudentLogin = (req, res, next) => {
  // If student is already logged in :)
  console.log("Get login triggered");

  if (req.cookies.jwt_student) res.status(302).redirect("/students/home");
  //   Or res.status(302).set({ Location: "/students/home" });
  else res.status(200).render("login.ejs", { userType: "Student" });
};

exports.getTeacherLogin = (req, res, next) => {
  // If teacher is already logged in :)
  if (req.cookies.jwt_teacher) res.status(302).redirect("/teachers/home");
  //   Or res.status(302).set({ Location: "/students/home" });
  else res.status(200).render("login.ejs", { userType: "Teacher" });
};

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
  // console.log("JWT:", decoded);

  // Find student based on id inside decoded JWT:
  const student = await Student.findById(decoded.id);
  // A student might have generated a token, but deleted their account shortly after:
  if (!student) throw new AppError("User associated with the token no longer exists!", 401);
  // console.log(student);

  // If student changed password (suppose her account was hacked into), then we need to invalidate the previous JWT:
  if (decoded.iat * 1000 < student.passwordLastChanged)
    throw new AppError("Password changed after JWT was issued", 401, "render", "/students/login");
  // NOTE: JWT time-stamps are in seconds, vs ms for Date.now() used in passwordLastChanged

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

  // Find teacher based on id inside decoded JWT:
  const teacher = await Teacher.findById(decoded.id).populate({
    path: "courses",
    select: "name code language assignments students -teacher",
  });

  // A teacher might have generated a token, but deleted their account shortly after:
  if (!teacher) throw new AppError("User associated with the token no longer exists!", 401);
  // console.log(teacher);

  // If teacher changed password (suppose her account was hacked into), then we need to invalidate the previous JWT:
  if (decoded.iat * 1000 < teacher.passwordLastChanged)
    throw new AppError("Password changed after JWT was issued", 401, "render", "/students/login");
  // NOTE: JWT time-stamps are in seconds, vs ms for Date.now() used in passwordLastChanged

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

// ROUTE: /students/forgot-password and /teachers/forgot-password (POST)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // This middleware will generate a reset-password-token, which is part of the reset-password-URL, sent by email
  const userType = req.originalUrl.includes("students") ? "student" : "teacher";
  const Model = userType === "student" ? Student : Teacher;
  // console.log(req.body, req.url, req.originalUrl, req.get("host"));

  // (1) Get user via email:
  const user = await Model.findOne({ email: req.body.email });
  if (!user) throw new AppError(`No ${userType} associated with this email`, 404, "JSON");

  // (2) Generate Password Reset Token (a hashed version will be in user's document in DB):
  const token = await user.generatePasswordResetToken();
  console.log(`Password Reset Token: ${token}`);

  // (3) Set mail message and send mail:
  const resetUrl = `${req.protocol}://${req.get("host")}/${userType}s/reset-password/${token}`;
  const message = `Forgot your Password? Here's the URL to reset your password:\n${resetUrl}.\nIgnore if you remember your password`;
  try {
    await sendMail({
      recipient: "ankushbhowmikf12@gmail.com",
      subject: "Reset Password Link (Valid for 10 minutes)",
      mailBody: message,
    });
    console.log("Mail sent successfully");
    res.status(200).json({
      status: "success",
      message: `Password Reset Token sent to your email at ${new Date().toLocaleString("en-UK", {
        timeZone: "Asia/Kolkata",
      })}`,
    });
  } catch (err) {
    // If there was error sending mail, then discard the token.
    await user.discardPasswordResetToken();
    throw new AppError(err.message, 500, "JSON");
  }
});

// ROUTE: /students/reset-password/:token and /teachers/reset-password/:token
exports.getResetPasswordPage = catchAsync(async (req, res, next) => {
  const userType = req.originalUrl.includes("students") ? "Student" : "Teacher";
  const Model = userType === "Student" ? Student : Teacher;

  // (1) Get the token from URL, and hash it.
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  // (2) Find user via the hashed token.
  const user = await Model.findOne({ passwordResetToken: hashedToken }).select(
    "+passwordResetToken +passwordResetTokenExpiry",
  );
  if (!user) throw new AppError("Invalid Token! ", 401, "render");
  // console.log("User found: ", user);
  // console.log(
  //   "Password Reset Token Expiry in IST: ",
  //   user.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  // );

  // (3) Check if token has expired (it's expiry time in unix timestamp must be less than now):
  if (user.passwordResetTokenExpiry < Date.now())
    throw new AppError("Token for updating password has expired", 400, "render");

  // (4) Send the reset password page:
  res.status(200).render("resetPassword.ejs", { userType });
});

// ROUTE: /students/reset-password/:token and /teachers/reset-password/:token (PATCH)
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  // (1) Hash the token from the URL
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const userType = req.originalUrl.includes("students") ? "student" : "teacher";
  const Model = userType === "student" ? Student : Teacher;

  // (2) Find user via the hashed token
  const user = await Model.findOne({ passwordResetToken: hashedToken }).select(
    "+passwordResetToken +passwordResetTokenExpiry",
  );
  if (!user) throw new AppError("Invalid Token!", 401, "render");
  console.log(
    "Password Reset Token Expiry in IST: ",
    user.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  );

  //  (3) Check if token has expired (it's expiry time in unix timestamp must be less than now):/
  if (user.passwordResetTokenExpiry < Date.now())
    throw new AppError("Token for updating password has expired", 400, "render");

  // (4) Proceed towards updating the password.
  user.password = password;
  // user.passwordConfirm = passwordConfirm;
  await user.save({ validateBeforeSave: true });
  await user.discardPasswordResetToken();

  const signInToken = signToken(user.id);
  respondWithCookie(
    res,
    200,
    { name: `jwt_${userType}`, value: signInToken },
    { message: "Password Reset Successfuly... You're Logged In!", redirectURL: `/${userType}s/home` },
  );
});

// ROUTE: /students/me and /teachers/me
exports.me = (req, res, next) => {
  // const userType = req.student ? "student" : "teacher";
  // const user = req.student || req.teacher;
  // res.status(200).json({ status: "success", user: Object.assign({ type: userType }, user) });
  // let user; // OR:
  // if (req.student) user = { type: "student", ...req.student };
  // else user = { type: "teacher", ...req.teacher };
  // res.status(200).json({ status: "success", user });
  // NOTE: Spreading the req.student or req.teacher object, or using Object.assign() provides a lot more fields
  // on the user Object which disrupt the normal access pattern of properties. Uncomment to see the json response.
  console.log(req.student);

  if (req.student) res.status(200).render("me.ejs", { student: req.student });
  else if (req.teacher) res.status(200).render("me.ejs", { teacher: req.teacher });
};

// ROUTE: /students/update-password and /teachers/update-password
exports.updatePassword = catchAsync(async (req, res, next) => {
  let user = req.student || req.teacher;
  const userType = req.student ? "student" : "teacher";
  const Model = req.student ? Student : Teacher;
  const { passwordCurrent, passwordNew } = req.body;
  console.log(passwordCurrent, passwordNew);

  // Re-quering for the user, so as to get the password field this time
  user = await Model.findById(user.id).select("+password");

  const isPasswordMatch = await user.isPasswordCorrect(passwordCurrent);
  if (!isPasswordMatch) throw new AppError("Wrong password", 401, "JSON");
  // console.log("Password Matched");

  user.password = passwordNew;
  await user.save({ validateBeforeSave: true });

  const signInToken = signToken(user.id);
  respondWithCookie(
    res,
    200,
    { name: `jwt_${userType}`, value: signInToken },
    { message: "Password Updated Successfuly!", redirectURL: `/${userType}s/home` },
  );
});

exports.updatePfp = catchAsync(async (req, res, next) => {
  console.log("User: ", req.file); // Has filename attribute crucially.
  const user = req.student || req.teacher;
  const userType = req.student ? "student" : "teacher";
  const Model = req.student ? Student : Teacher;
  const updatedUser = await Model.findByIdAndUpdate(
    user.id,
    { photo: req.file.filename },
    { new: true, runValidators: true },
  );
  res.status(200).json({ status: "success", message: "Pfp Changed Successfully" });
});

exports.restrictTo = (...acceptedRoles) => {
  return (req, res, next) => {
    if (!acceptedRoles.includes(req.teacher.role))
      throw new AppError(`Unauthorized Access! Route restricted to roles: ${acceptedRoles.join(", ")}`, 403, "render");
    next();
  };
};

exports.getAdminPage = (req, res, next) => {
  res.status(200).render("admin.ejs", { admin: req.teacher });
};
