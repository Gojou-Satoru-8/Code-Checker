const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "A question must have some text"],
  },
  // assignment: {
  //   type: mongoose.Schema.ObjectId,
  //   required: [true, "A question must belong to an assignment"],
  // },
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
