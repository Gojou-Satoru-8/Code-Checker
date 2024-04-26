require("pretty-error").start();
// Formats all errors printed through console.log() or console.error()
const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  console.log("Triggered casterror");
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  console.error("Triggered duplicate fields error");

  const message = `Duplicate value for field ${Object.keys(err.keyValue).at(0)}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //   const messages = [];
  //   for (const [name, obj] of Object.entries(err.errors)) {
  //     console.log(name);
  //     messages.push(`${name}: ${obj.message}`);
  //   }
  //   const errors = Object.entries(err.errors).map((el) => `${el[0]}: ${el[1]}`);
  // Here, every element el is an array of [key, value] pair within err.errors

  const fields = Object.keys(err.errors);
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = "Invalid input in fields: " + fields.join(", ") + ". " + errors.join(". ");
  return new AppError(message, 400, "JSON");
};

const handleJWTInvalidError = (err) => {
  console.error(`Triggered JWT Error: ${err.message}`);
  return new AppError("Invalid Token. Please log-in again", 401);
};

const handleJWTExpiredError = (err) => {
  console.error(`Triggered JWT Error: ${err.message}`);
  return new AppError("Token expired. Please log-in again", 401);
};

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
  if (err.name === "CastError") err = handleCastErrorDB(err);
  else if (err.code === 11000) err = handleDuplicateFieldsDB(err);
  else if (err.name === "ValidationError") err = handleValidationErrorDB(err);
  else if (err.name === "JsonWebTokenError") err = handleJWTInvalidError(err);
  else if (err.name === "TokenExpiredError") err = handleJWTExpiredError(err);

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
