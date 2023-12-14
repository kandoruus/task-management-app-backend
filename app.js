//set up app
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/pages/index.html");
});
//import modules
const taskApi = require("task-api");
const userApi = require("user-api");
const punchApi = require("punch-api");
//apply middleware
const { validateSession } = require("helper/functions");
app.use("/task-api", validateSession);
app.use("/punch-api", validateSession);
//connect to modules
app.use(taskApi);
app.use(userApi);
app.use(punchApi);
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
