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

questionSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
