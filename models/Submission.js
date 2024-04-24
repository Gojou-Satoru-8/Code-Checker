const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.ObjectId,
    ref: "Question",
    required: [true, "Submission must be linked to a Question"],
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "Student",
    required: [true, "Submission must be linked to a Student"],
  },
  filePath: {
    type: String,
    required: [true, "Submission must have a file-path"],
  },
  remarks: {
    type: String,
    trim: true,
    maxLength: [100, "Remarks must be 100 characters at max"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

submissionSchema.index({ student: 1, question: 1 }, { unique: true });

submissionSchema.pre(/^find/, function (next) {
  this.select("-__v").populate({ path: "question" }).populate({ path: "student", select: "name email" });
  next();
});
const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
