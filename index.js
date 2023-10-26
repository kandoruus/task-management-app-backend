const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, required: true },
  priority: { type: String, required: true },
  startDate: Date,
  dueDate: { type: Date, required: true },
  completionDate: Date,
  estTime: { type: Number, required: true },
  actTime: Number,
});

const Task = mongoose.model("Task", taskSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/pages/index.html");
});

const createNewTask = async (inputs) => {
  let { name, description, status, priority, startDate, dueDate, estTime } = inputs;
  startDate = startDate === "" ? Date.now() : startDate;
  status = status === "" ? "Not Started" : status;
  priority = priority === "" ? "Low" : priority;
  estTime = estTime === "" ? 40 : estTime;

  return (
    await Task.create({
      name: name,
      description: description,
      status: status,
      priority: priority,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      completionDate: null,
      estTime: Number(estTime),
      actTime: 0,
    })
  )._id;
};

app.post("/api/task", async (req, res) => {
  try {
    res.json({
      message: req.body.name + " saved successfully! id: " + (await createNewTask(req.body)),
    });
  } catch (e) {
    res.json({ message: "Error saving the task named '" + req.body.name + "': " + e.toString() });
  }
});

app.get("/api/removetask/:id", async (req, res) => {
  try {
    if (await Task.findByIdAndRemove(req.params.id)) {
      res.json({ message: req.params.id + " deleted successfully!" });
    } else {
      res.json({ message: req.params.id + " was not found." });
    }
  } catch (e) {
    res.json({ message: "Error delete the task with id '" + req.params.id + "': " + e.toString() });
  }
});

app.get("/api/task/:id", async (req, res) => {
  try {
    let taskObj = await Task.findById(req.params.id);
    if (taskObj) {
      res.json(taskObj);
    } else {
      res.json({ message: "No task found match id: '" + req.params.id + "'" });
    }
  } catch (e) {
    res.json({ message: "Error fetching task '" + req.params.id + "': " + e.toString() });
  }
});

const listener = app.listen(process.env.PORT || 3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
