const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/studentRouter");
const teacherRouter = require("./routes/teacherRouter");
const codeController = require("./controllers/codeController");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();
app.use(express.static(`${__dirname}/public`));
// MIDDLEWARES:

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use("/students", studentRouter);
app.use("/teachers", teacherRouter);
app.route("/api/v1/codes").get(codeController.allCodes).post(codeController.postCode);

app.all("*", (req, res, next) => {
  console.log("Error route-handler triggered.");
  throw new AppError("No such route defined!", 404, "render");
});

app.use(globalErrorHandler);
module.exports = app;
