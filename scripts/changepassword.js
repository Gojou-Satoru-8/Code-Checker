require("dotenv").config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");

const [, , user] = process.argv;
const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(DB).then(async (conn) => {
  console.log("Remote DB Connection Successful");
  console.log(conn.modelNames());

  let Model;
  if (user === "teachers") Model = Teacher;
  else if (user === "students") Model = Student;
  else {
    console.log("Please specify the collection (teachers / students)");
    process.exit();
  }

  const users = await Model.find().select("+password -courses");
  // Works without .select() too, because even if the password field is absent, we are setting it here,
  // wouldn't have worked if we were viewing or comparing it, since the password property is not present.
  console.log(users);
  for (const user of users) {
    user.password = user.passwordConfirm = Model === Teacher ? "sensei1710#" : "kaminari777";
    const updatedUser = await user.save();
    console.log(updatedUser.password);
  }
  process.exit();
});
