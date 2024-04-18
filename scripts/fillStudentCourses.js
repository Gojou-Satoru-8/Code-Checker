require("dotenv").config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(DB).then(async (conn) => {
  console.log("Remote Database connected successfully!");
  const courses = await Course.find();
  //   console.log(courses);
  for (const course of courses) {
    const students = await Promise.all(course.students.map(async (objID) => await Student.findById(objID)));
    console.log(`List of students for ${course.code}: ${course.name}`);
    console.log(students.slice(0, 3));
    for (const student of students) {
      student.courses.push(course._id);
      await student.save({ validateModifiedOnly: true });
    }
    console.log(`Successfully set course ${course.code}-${course.name} for students`);
  }
});
