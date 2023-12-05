//set up app
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/pages/index.html");
});
//import modules
const { validateSession } = require("helper/functions");
const taskApi = require("task-api");
app.use("/task-api", validateSession);
app.use(taskApi);
const userApi = require("user-api");
app.use(userApi);
//connect to database
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI_APP, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
//listen to port
const listener = app.listen(process.env.PORT || 3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
