const express = require("express");
const codeController = require("./controllers/codeController");

const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.route("/api/v1/codes").get(codeController.allCodes).post(codeController.postCode);
module.exports = app;
