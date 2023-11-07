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
  name: String,
  description: String,
  status: String,
  priority: String,
});

const Task = mongoose.model("Task", taskSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/pages/index.html");
});

const createNewTask = async (inputs) => {
  let { name, description, status, priority } = inputs;
  status = status === "" ? "Not Started" : status;
  priority = priority === "" ? "Low" : priority;

  return (
    await Task.create({
      name: name,
      description: description,
      status: status,
      priority: priority,
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
