require("dotenv").config({ path: `${__dirname}/.env` });
const fs = require("fs");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const courses = fs.readFileSync(`${__dirname}/courses.json`, "utf-8");
const coursesJSON = JSON.parse(courses);

const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.connect(DB).then(async (conn) => {
  console.log("Remote DB Connection Successful");
  console.log(conn.modelNames());
  const result = await Course.insertMany(coursesJSON);
  console.log(`${result.length} documents inserted`);
  process.exit();
});
