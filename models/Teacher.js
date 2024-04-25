const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const crypto = require("crypto");
// const Course = require("./Course");

const teacherSchema = new mongoose.Schema(
  {
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
    // passwordConfirm: {
    //   type: String,
    //   required: [true, "Please re-enter your password to confirm"],
    //   validate: {
    //     validator: function (val) {
    //       return this.password === val;
    //     },
    //     message: "Passwords don't match. Please enter the same passwords in both fields",
    //   },
    // },
    passwordLastChanged: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiry: { type: Date, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL PROPERTIES: NOTE: Virtual Properties can't be populated in Mongoose Query middleware:
teacherSchema.virtual("courses", {
  ref: "Course",
  foreignField: "teacher",
  localField: "_id",
});

// SCHEMA METHODS:
teacherSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

teacherSchema.methods.generatePasswordResetToken = async function () {
  // const token = crypto.randomBytes(32).toString("hex");
  const token = faker.string.hexadecimal({ length: 32, casing: "upper", prefix: "" });
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiry = Date.now() + Number.parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000;
  await this.save({ validateBeforeSave: false });
  // console.log("Teacher after generating a reset token: ", this);
  console.log("Info about Password Reset Token generated:\n", {
    token,
    hashedToken,
    expiry: this.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  });

  return token;
};

teacherSchema.methods.discardPasswordResetToken = async function () {
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

// MONGOOSE MIDDLEWARES:
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // this.passwordConfirm = undefined;
  this.passwordLastChanged = new Date().getTime() - 1000;
  // The 1 second subtraction is for routes where JWT is signed simultaneously, ensuring JWT is issued after
  // change in password.
  next();
});

teacherSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
