const { exec } = require("child_process");

const shells = {
  python3: "/usr/bin/python3",
  js: "/opt/homebrew/bin/node",
};
// console.log("Shell: ", shells[lang]);

exports.allCodes = (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "All code files below",
  });
};

exports.postCode = (req, res, next) => {
  const { lang, source } = req.body;

  console.log(lang, source);
  const command = `${process.env.RUN_SCRIPT_PATH} ${lang} ${process.env.FILES_PATH}/${source}`;
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
