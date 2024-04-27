const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

const data = JSON.parse(fs.readFileSync(`${__dirname}/model/data.json`, "utf-8"));
// console.log(data);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(`${__dirname}/views`));

app.get("/", (req, res) => {
  res.set({
    "Content-Type": "text/html",
  });
  res.status(200).render("index.html");
});

// Testing express' error-handling middlewares (placing it in different places across the code):
// app.get("/error", (req, res, next) => {
//   try {
//     console.log(`Wrong url triggered: ${req.baseUrl}`);
//     throw new Error(
//       `Random error with ${req.url}. Path: ${req.path}, Query: ${new URLSearchParams(req.query).toString()}`
//     );
//   } catch (err) {
//     console.log("Moving to the error handler middleware...");
//     next(err);
//   }
// });

app.get("/students", (req, res, next) => {
  console.log("------------x------------");

  console.log(req.url, req.baseUrl);
  console.log(req.params);
  console.log(req.body);

  res.status(200).json(data);
  // Calling the error handling middleware:
  // next(new Error("Nothing"));
  // next();  // Without error object being passed, it won't trigger the error-handler middleware, instead it will
  // go to the next middleware.
});

app.get("/students/:id", (req, res) => {
  // throw new Error(`Error thrown without catch block in ${req.url} route`);
  // NOTE: Unlike other places where we wrapped things inside a try and catch block with the catch block
  // having the code that calls the next(err), simply throwing an error without catch block calling next(err)
  // also works. The following code will just be unreachable.
  console.log(req.query);
  console.log(req.url, req.baseUrl);
  console.log(req.params);
  console.log(req.body);
  const target = data.users?.filter((v) => v.id == req.params.id);
  console.log(target);
  if (target.length != 0) {
    return res.status(200).json({
      status: "success",
      users: target,
    });
  } else {
    return res.status(404).json({
      status: "fail",
      message: "No such student",
    });
  }
});

app.post("/students", (req, res) => {
  const body = { ...req.body };
  console.log("Request Body: ", body);

  const fields = Object.keys(body);
  if (fields.includes("name") && fields.includes("country") && fields.includes("email")) {
    body.id = Math.ceil(Math.random() * 50);
    console.log(`ID generated: ${body.id}`);

    data.users.push(body);
    // console.log(data);
    fs.writeFile(`${__dirname}/model/data.json`, JSON.stringify(data), (err) => {
      if (err) {
        return res.status(500).json({
          status: "fail",
          message: "error saving changes",
        });
      } else {
        return res.status(201).json({
          status: "success",
          message: "new data created",
          data: body,
        });
      }
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message: "missing fields",
    });
  }
});

// There can be multiple error handling middleware, but to pass it to the next, you need to call next with the err
// object.
// NOTE: Error handling middlewares should always be at the end of all middlewares, otherwise errors happening in
// subsequent middlewares won't be caught.
app.use((err, req, res, next) => {
  console.log("1st Error middleware: ", err);
  next(err);
  // next(); // Without passing error object, it will go to the normal middleware immediately following:
});

app.use((req, res, next) => {
  console.log("Called after 1st error handler middleware if no err obj was passed");
  // This is because middlewares are triggered in order of their placement.
  res.end();
});

app.use((err, req, res, next) => {
  console.log("------------");

  res.status(500).json({
    status: "fail",
    error: err.message,
  });
});

app.listen(3000, "127.0.0.1", (req, res) => {
  console.log(`Server's up, running on port 3000`);
});
