const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A course must have a name"],
    minlength: [5, "A course must be at least 5 characters long"],
    maxlength: [25, "A course must be atmost 25 characters long"],
  },
  code: {
    type: String,
    unique: true,
    required: [true, "A course must have a code"],
    minlength: [4, "Course code must be of at least 4 characters"],
    maxlength: [8, "Course code must be of at most 8 characters"],
  },
  language: {
    type: String,
    enum: {
      values: ["python", "js"],
      message: "Language must be any of python, js...",
    },
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: "Teacher",
    required: [true, "A course must have a teacher"],
  },
  students: [{ type: mongoose.Schema.ObjectId, ref: "Student" }],
  assignments: [{ type: mongoose.Schema.ObjectId, ref: "Assignment" }],
  slug: String,
});

courseSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

courseSchema.pre(/^find/, function (next) {
  this.select("-__v").populate({
    path: "teacher",
    select: "name email",
  });
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
