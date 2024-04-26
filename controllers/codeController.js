const { exec } = require("child_process");
const path = require("path");
const Submission = require("../models/Submission");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// const shells = {
//   python3: "/usr/bin/python3",
//   js: "/opt/homebrew/bin/node",
// };

// console.log("Shell: ", shells[lang]);
const getLangFromFileExt = (ext) => {
  const lang = {
    py: "python3",
    js: "node",
    // c: "gcc",
    // cpp: "g++"
  };
  return lang[ext];
};

exports.getCodes = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.submissionId);
  if (!submission) throw new AppError("No such submission with this ID", 404, "JSON");
  // const fileExt = path.extname(submission.filePath); // This includes the dot as in .py, .js, etc
  const fileExt = submission.filePath.split(".").at(-1);
  // console.log("File-extension:", fileExt);
  const lang = getLangFromFileExt(fileExt);
  if (!lang) throw new AppError(`File type unsupported, no command for extension ${fileExt}`, 400, "JSON");

  const scriptPath = path.join(__dirname, "..", "tests/run_script.sh");
  const filePath = path.resolve(__dirname, "..", `public/code-uploads/${submission.filePath}`);

  console.log("Script Path:", scriptPath, "| File path: ", filePath);
  console.log(path.isAbsolute(scriptPath), path.isAbsolute(filePath));

  const command = `${scriptPath} ${lang} ${filePath}`;
  exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
    console.log("STDOUT:\n", stdout);
    console.log("STDERR:\n", stderr);
    console.log("ERROR:\n", error);

    if (error) {
      // console.log(error);  // NOTE: Here, we're not using AppError to send response, due to additional fields
      return res.status(400).json({ status: "fail", message: error, stdout, stderr });
    }
    // Return output
    res.status(200).json({ status: "success", message: "Compiled/Interpreted successfully", stdout, stderr });
  });
});

// API Testing (POSTMAN) Only:
exports.postCode = (req, res, next) => {
  const { lang, source } = req.body;

  console.log(lang, source);
  const scriptPath = path.join(__dirname, "..", "tests/run_script.sh");
  const filePath = path.resolve(__dirname, "..", `public/code-uploads/${source}`);
  // console.log("-------------------------------");
  // console.log("Sricpt Path:", scriptPath, "| File path: ", filePath);
  console.log(path.isAbsolute(scriptPath), path.isAbsolute(filePath));

  const command = `${scriptPath} ${lang} ${filePath}`;
  // const command = `${__dirname}/../tests/${source}`;
  exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
    console.log("STDOUT: ", stdout);
    console.log("STDERR:", stderr);
    console.log("ERROR:", error);

    if (error) {
      // console.log(error);
      return res.status(400).json({
        status: "fail",
        message: error,
        stdout,
        stderr,
      });
    }
    // Return output

    res.status(200).json({
      status: "success",
      message: "Compiled/Interpreted successfully",
      stdout,
      stderr,
    });
  });
};
