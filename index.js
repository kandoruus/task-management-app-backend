const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  username: String,
  log: [{ description: String, duration: Number, date: String }],
});

const User = mongoose.model("User", userSchema);

const postUser = async (userName) => {
  if (!(await User.exists({ username: userName }))) {
    await User.create({ username: userName, log: [] });
  }
  return { username: userName, _id: (await User.findOne({ username: userName }))._id };
};

//number validation function found here https://stackoverflow.com/a/58550111
const isNumeric = (num) =>
  (typeof num === "number" || (typeof num === "string" && num.trim() !== "")) && !isNaN(num);

//reformat the toUTCString to match the format of toDateString
const toUTCDateString = (toUTCString) => {
  let dateStringArray = toUTCString.split(/,\s+|\s+\d\d:\d\d:\d\d\s+\w+$|\s+/);
  let dateDay = dateStringArray[1];
  dateStringArray[1] = dateStringArray[2];
  dateStringArray[2] = dateDay;

  return dateStringArray.join(" ").trim();
};

const getDateString = (inputString) => {
  return inputString === "" || inputString === undefined
    ? new Date(Date.now()).toDateString()
    : toUTCDateString(new Date(inputString).toUTCString());
};

const validateId = async (inputId) => {
  try {
    if (!(await User.exists({ _id: inputId }))) {
      throw new Error("");
    }
  } catch (e) {
    throw new Error("_id is invalid");
  }
};

const validateExerciseInputs = async (_id, reqBody) => {
  let errorString = "";
  try {
    await validateId(_id);
  } catch (e) {
    errorString = e.toString();
  }
  if (reqBody.description === "") errorString = errorString + " description required";
  if (reqBody.duration === "") errorString = errorString + " duration required";
  if (!isNumeric(reqBody.duration)) errorString = errorString + " duration must be a number";
  if (
    reqBody.date !== "" &&
    reqBody.date !== undefined &&
    new Date(reqBody.date).toString() === "Invalid Date"
  )
    errorString = errorString + " date must be a valid format";
  if (errorString !== "") throw new Error(errorString.trim());
};

const updateUserLog = async (_id, reqBody) => {
  await validateExerciseInputs(_id, reqBody);
  let logEntry = {
    description: reqBody.description,
    duration: Number(reqBody.duration),
    date: getDateString(reqBody.date),
  };

  let user = await User.findById(_id, (err, userFound) => {
    if (err) return console.error(err);
    userFound.log.push(logEntry);
    userFound.save((saveErr) => {
      if (err) return console.error(saveErr);
    });
  });

  return {
    username: user.username,
    description: logEntry.description,
    duration: logEntry.duration,
    date: logEntry.date,
    _id: _id,
  };
};

const filterLogs = (query, log) => {
  let filteredLog = log.slice();
  if (query.from)
    filteredLog = filteredLog.filter((logEntry) => {
      return new Date(logEntry.date) >= new Date(query.from);
    });
  if (query.to)
    filteredLog = filteredLog.filter((logEntry) => {
      return new Date(logEntry.date) <= new Date(query.to);
    });
  if (query.limit) filteredLog = filteredLog.slice(0, Math.min(query.limit, filteredLog.length));
  return filteredLog;
};

const getUserLogs = async (_id, query) => {
  await validateId(_id);
  let user = await User.findById(_id);
  let logs = filterLogs(query, user.log);
  return { username: user.username, count: user.log.length, _id: _id, log: logs };
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/arc/pages/index.html");
});

app.post("/api/users", async (req, res) => {
  res.json(await postUser(req.body.username));
});

app.get("/api/users", async (req, res) => {
  res.json(await User.find({}));
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    res.json(await updateUserLog(req.params._id, req.body));
  } catch (e) {
    res.json({ error: e.toString() });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  try {
    res.json(await getUserLogs(req.params._id, req.query));
  } catch (e) {
    res.json({ error: e.toString() });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
