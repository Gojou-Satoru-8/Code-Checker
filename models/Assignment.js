const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Assignment must have a name"],
  },
  // course: {
  //   type: mongoose.Schema.ObjectId,
  //   required: [true, "Assignment must be linked to a course"],
  // },
  questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

assignmentSchema.pre(/^find/, function (next) {
  this.select("-__v").sort("createdAt").populate({ path: "questions" });
  // This makes sure the assignments are ordered from earliest to latest, ensuring correct numbering in views
  // Also, the questions are populated.
  next();
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
