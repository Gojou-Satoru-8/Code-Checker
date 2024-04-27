const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const flash = require("express-flash");
const studentRouter = require("./routes/studentRouter");
const teacherRouter = require("./routes/teacherRouter");
const codeController = require("./controllers/codeController");
const globalErrorHandler = require("./controllers/errorController");
// const flashHandler = require("./controllers/flashController");
const AppError = require("./utils/appError");

const app = express();
app.use(express.static(`${__dirname}/public`));
// MIDDLEWARES:

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(flash());

app.route("/").get((req, res, next) => {
  if (req.cookies?.jwt_student) return res.status(302).redirect("/students/home");
  if (req.cookies?.jwt_teacher) return res.status(302).redirect("/teachers/home");
  else res.status(200).render("landing.ejs");
});

app.use("/students", studentRouter);
app.use("/teachers", teacherRouter);
app.route("/api/v1/codes/:submissionId?").get(codeController.getCodes).post(codeController.postCode);
// app.use("/flash", flashHandler);

// Ignore favicon.ico request (otherwise creates errors in console)
app.use("/favicon.ico", (req, res, next) => {
  res.send();
});

app.all("*", (req, res, next) => {
  console.log("Error route-handler triggered.");
  throw new AppError(`No such route defined: ${req.originalUrl}`, 404, "render");
});

app.use(globalErrorHandler);
module.exports = app;
