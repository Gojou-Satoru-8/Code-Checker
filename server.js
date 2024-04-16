require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");

const app = require("./app");

const port = 8000;
app.listen(port, "127.0.0.1", () => {
  console.log(`Server's up, listening to requests at port no: ${port}`);
  console.log("--------------X--------------X--------------X--------------");
});
