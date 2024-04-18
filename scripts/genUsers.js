require("dotenv").config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
// const random = require("randy");

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const generateStudents = (size) => {
  const students = Array.from({ length: size }, () => ({}));
  // Gotta wrap the returned empty empty object {} inside (), otherwise it gets interpreted as empty function {}.
  //   faker.seed(55);
  students.forEach((stud) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    stud.name = `${firstName} ${lastName}`;
    stud.email = faker.internet.email({ firstName, lastName }); // OR:
    // stud.email =
    //   stud.name.split(" ").join(".") +
    //   random.randInt(1, 100) +
    //   random.choice(["@gmail.com", "@yahoo.com", "@outlook.com", "@icloud.com", "@skiff.com"]);
    // stud.year = random.randInt(1, 4);
    stud.year = faker.number.int({ min: 1, max: 4 });
    // stud.programme = random.choice(["BCA", "MCA", "BTech CSE", "BTECH ECE"]);
    stud.programme = faker.helpers.arrayElement(["BCA", "MCA", "BTech CSE", "BTech ECE"]);
    stud.password = faker.internet.password(15);
    stud.passwordConfirm = stud.password;
  });
  console.log(students);
  return students;
};

const generateTeachers = (size) => {
  const teachers = [];
  for (let i = 1; i <= size; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const password = faker.internet.password(15);
    teachers.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      role: "teacher",
      password,
      passwordConfirm: password,
    });
  }
  return teachers;
};

const populateDB = async (objects, Model) => {
  //   const result = await Model.insertMany(objects);    // Or
  const result = await Model.create(objects);
  console.log(result);
  console.log("Populated DB successfully");
  process.exit();
};

const deleteFromDB = async (Model) => {
  await Model.deleteMany();
  console.log("Deletion from DB successfully");
  process.exit();
};

const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then(async (conn) => {
    // const result = await Student.insertMany(students);
    console.log("Remote DB Connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// console.log(process.argv);
const [, , operation, collection] = process.argv;
if (operation === "--import") {
  if (collection === "students") {
    const students = generateStudents(2);
    populateDB(students, Student);
  } else if (collection === "teachers") {
    const teachers = generateTeachers(2);
    populateDB(teachers, Teacher);
  }
} else if (operation === "--delete") {
  if (collection === "students") deleteFromDB(Student);
  else if (collection === "teachers") deleteFromDB(Teacher);
}
