const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is a required field"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email is a required field"],
    validate: [validator.isEmail, "Invalid email"],
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "teacher"],
      message: ["Role must be any one of 'admin' or 'teacher'"],
    },
  },
  password: {
    type: String,
    required: [true, "Password is a mandatory field"],
    minLength: [8, "Password must be at least 8 characters long"],
    maxLength: [20, "Password must be at most 20 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please re-enter your password to confirm"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Passwords don't match. Please enter the same passwords in both fields",
    },
  },
  passwordLastChanged: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpiry: { type: Date, select: false },
});

teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordLastChanged = new Date().getTime();
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
