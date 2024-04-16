const dotenv = require("dotenv");
const mongoose = require("mongoose");

process.on("uncaughtException", function (err) {
  console.log("Uncaught Exception ⚠️", err);
  process.exit(1);
});

dotenv.config({ path: "./.env" });
const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose.connect(DB).then((conn) => {
  console.log("Database connection successful!");
  console.log(conn.connections);
});

const app = require("./app");

const port = process.env.PORT;
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Server's up, listening to requests at port no: ${port}`);
  console.log("--------------X--------------X--------------X--------------");
});

process.on("unhandledRejection", function (err) {
  console.log("Unhandled Rejection ⚠️:", err);
  server.close(() => process.exit(1));
});
