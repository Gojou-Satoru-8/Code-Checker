const express = require("express");
const morgan = require("morgan");
const codeController = require("./controllers/codeController");

const app = express();

// MIDDLEWARES:

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded());

app.route("/api/v1/codes").get(codeController.allCodes).post(codeController.postCode);
module.exports = app;
