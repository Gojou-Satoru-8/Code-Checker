const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  console.log("Error in Development Environment 🔴:", `${err.statusCode} - ${err.message}`);
  console.log(err.stack);
  if (err.type === "JSON") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else res.render("error.ejs", { err });
};
const sendErrorProd = (err, res) => {};
module.exports = (err, req, res, next) => {
  err.statusCode ||= 500; // If no statusCode given, then we default to 500 - Internal Server Error
  err.status ||= "error"; // 400 series is fail, 500 series is error.

  const node_env = process.env.NODE_ENV;
  if (node_env === "development") sendErrorDev(err, res);
  else {
    sendErrorProd(err, res);
  }
};
