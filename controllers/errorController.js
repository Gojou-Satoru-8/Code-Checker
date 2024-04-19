require("pretty-error").start();
// Formats all errors printed through console.log() or console.error()
const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  console.log("--------------X--------------X--------------X--------------");
  console.log("Error in Dev Environment 🔴:", `${err.statusCode} - ${err.message}`);
  console.log(err);
  if (err.type === "JSON") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (err.redirectUrl) {
    console.log("Redirection triggered");
    res.redirect(err.redirectUrl);
  } else res.render("error.ejs", { err });
};
const sendErrorProd = (err, res) => {};
module.exports = (err, req, res, next) => {
  // Setting defaults:
  err.statusCode ||= 500; // If no statusCode given, then we default to 500 - Internal Server Error
  err.status ||= "error"; // 400 series is fail, 500 series is error.
  err.type ||= "render"; // Default error type is render.

  const node_env = process.env.NODE_ENV;
  if (node_env === "development") sendErrorDev(err, res);
  else {
    sendErrorProd(err, res);
  }
};
