const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Submission must be linked to a Question"],
  },
  student: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Submission must be linked to a Student"],
  },
  filePath: {
    type: String,
    required: [true, "Submission must have a file-path"],
  },
  remarks: {
    type: String,
    maxLength: [30, "Remarks must be 30 characters at max"],
  },
});

submissionSchema.index({ student: 1, question: 1 }, { unique: true });

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
