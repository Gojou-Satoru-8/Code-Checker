const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Assignment must have a name"],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Assignment must be linked to a course"],
  },
  questions: [{ type: mongoose.Schema.ObjectId, ref: "Question" }],
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
