const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/studentRouter");
const teacherRouter = require("./routes/teacherRouter");
const codeController = require("./controllers/codeController");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.use(express.static(`${__dirname}/public`));
// MIDDLEWARES:

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.use("/students", studentRouter);
app.use("/students", teacherRouter);
app.route("/api/v1/codes").get(codeController.allCodes).post(codeController.postCode);

app.all("*", (err, req, res, next) => {
  console.log("Error handling middlware triggered");
  res.render("error.ejs", { error: err });
});

app.use(globalErrorHandler);
module.exports = app;
