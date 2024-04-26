const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const crypto = require("crypto");
const Submission = require("./Submission");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is a required field"],
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    year: {
      type: Number,
      required: [true, "Year is a required field"],
      min: [1, "Year has a minimum value of 1"],
      max: [5, "Year has a max value of 5"],
    },
    programme: {
      type: String,
      required: [true, "Programme is a required field"],
    },
    courses: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
      },
    ],
    photo: { type: String, default: "/src/assets/account-image.png" },
    password: {
      type: String,
      required: [true, "Password is a mandatory field"],
      minLength: [8, "Password must have minimum 8 characters"],
      maxLength: [20, "Password has a max limit of 20 characters"],
      select: false,
    },
    // passwordConfirm: {
    //   type: String,
    //   required: [true, "Please re-enter password to confirm"],
    //   validate: {
    //     validator: function (val) {
    //       return this.password === val;
    //     },
    //     message: "Passwords don't match. Please enter the same password in both fields.",
    //   },
    // },
    passwordLastChanged: {
      type: Date,
      // default: Date.now(), // this would set it everytime a .save() method is triggered on a student object,
      // even if the password wasn't changed
      select: false,
    },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpiry: { type: Date, select: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL PROPERTIES:
studentSchema.virtual("submissions", {
  ref: "Submission",
  foreignField: "student",
  localField: "_id",
});

// SCHEMA METHODS:
studentSchema.methods.isPasswordCorrect = async function (password) {
  console.log(this, "Given password: ", password);
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.generatePasswordResetToken = async function () {
  // const token = crypto.randomBytes(32).toString("hex");
  const token = faker.string.hexadecimal({ length: 32, casing: "upper", prefix: "" });
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetTokenExpiry = Date.now() + Number.parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY) * 1000;
  await this.save({ validateBeforeSave: false });
  // console.log("Student after generating a reset token: ", this);
  console.log("Info about Password Reset Token generated:\n", {
    token,
    hashedToken,
    expiry: this.passwordResetTokenExpiry.toLocaleString("en-GB", { timezone: "Asia/Kolkata" }),
  });

  return token;
};

studentSchema.methods.discardPasswordResetToken = async function () {
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpiry = undefined;
  await this.save({ validateBeforeSave: false });
};

// MONGOOSE MIDDLEWARES:
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // isModified() returns true when document is newly created or if any of the mentioned fields are updated in
  // any way, either via updateOne(), or findByIdAndUpdate() or findOne(), and manually updating the fields.
  this.password = await bcrypt.hash(this.password, 12);
  // this.passwordConfirm = undefined;
  this.passwordLastChanged = Date.now() - 1000; // Or new Date().getTime() - 1000;
  // The 1 second subtraction is for routes where JWT is signed simultaneously, ensuring JWT is issued after
  // change in password.
  next();
});

studentSchema.pre(/^find/, async function (next) {
  this.select("-__v").populate({
    path: "courses",
    select: "name code language assignments teacher",
  });
  next();
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
