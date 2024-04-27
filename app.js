const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// const flash = require("express-flash");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const studentRouter = require("./routes/studentRouter");
const teacherRouter = require("./routes/teacherRouter");
const adminRouter = require("./routes/adminRouter");
const codeController = require("./controllers/codeController");
const globalErrorHandler = require("./controllers/errorController");
// const flashHandler = require("./controllers/flashController");
const AppError = require("./utils/appError");

const app = express();

// MIDDLEWARES:
app.use(express.static(`${__dirname}/public`));

// 1) Set security HTTP Headers:
app.use(helmet());
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// 2) Limit number of requests in a given time window (in ms) from a certain IP
app.use(
  "/",
  rateLimit({
    max: process.env.NODE_ENV === "production" ? 300 : 1000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
  }),
);

// 3) Sanitizing POST request body against NoSQL query injection and XSS:
app.use(mongoSanitize());
app.use(xss());

// 4) Prevent HTTP Parameter Pollution in URL query string:
app.use(
  hpp({
    whitelist: ["name", "programme", "code", "course", "email", "language", "courses", "role"],
  }),
);

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
app.use("/admin", adminRouter);
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
