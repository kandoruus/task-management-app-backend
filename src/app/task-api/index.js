const express = require("express");
const app = (module.exports = express());
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Task = require("mongoose-models/Task");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const getDataFromInputs = (inputs) => {
  let { name, description, status, priority } = JSON.parse(inputs.data);
  status = status === "" ? "Not Started" : status;
  priority = priority === "" ? "Low" : priority;
  return {
    name: name,
    description: description,
    status: status,
    priority: priority,
  };
};

const createNewTask = async (inputs) => {
  return (await Task.create({ data: getDataFromInputs(inputs) }))._id;
};

const updateTask = async (inputs) => {
  let id = inputs._id;
  if (
    (await Task.findByIdAndUpdate(id, {
      data: getDataFromInputs(inputs),
    })) === null
  ) {
    throw new Error(id + " is not a valid id");
  }
};

const updateManyTasks = async (tasksToSave) => {
  let idList = tasksToSave.map((task) => task._id);
  let taskDocsToUpdate = (await Task.find({}))
    .map((taskDoc) => {
      return { oldDoc: taskDoc, idx: idList.indexOf(String(taskDoc._id)) };
    })
    .filter((taskDoc) => taskDoc.idx != -1)
    .map((taskDoc) => {
      return Object.assign(taskDoc.oldDoc, { data: { ...tasksToSave[taskDoc.idx].data } });
    });
  return await Task.bulkSave(taskDocsToUpdate);
};

app.post("/task-api/task", async (req, res) => {
  try {
    res.json({
      message: JSON.parse(req.body.data).name + " saved successfully!",
      id: await createNewTask(req.body),
    });
  } catch (e) {
    res.json({ message: "Error saving the task named '" + req.body.name + "': " + e.toString() });
  }
});

app.post("/task-api/updatetask", async (req, res) => {
  try {
    await updateTask(req.body);
    res.json({
      message: "Task " + req.body._id + " updated successfully!",
    });
  } catch (e) {
    res.json({ error: "Error updating the task with id '" + req.body._id + "': " + e.toString() });
  }
});

app.post("/task-api/updatemanytasks", async (req, res) => {
  try {
    res.json(await updateManyTasks(JSON.parse(req.body.tasklist)));
  } catch (e) {
    res.json({ message: "Error saving tasks': " + e.toString() });
  }
});

app.get("/task-api/removetask/:id", async (req, res) => {
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

app.get("/task-api/task/:id", async (req, res) => {
  try {
    let taskDoc = await Task.findById(req.params.id);
    if (taskDoc) {
      res.json(taskDoc);
    } else {
      res.json({ message: "No task found match id: '" + req.params.id + "'" });
    }
  } catch (e) {
    res.json({ message: "Error fetching task '" + req.params.id + "': " + e.toString() });
  }
});

app.get("/task-api/tasklist", async (req, res) => {
  try {
    res.json(await Task.find({}));
  } catch (e) {
    res.json({ message: "Error fetching tasklist: " + e.toString() });
  }
});

app.get("/task-api/cleartasks", async (req, res) => {
  try {
    res.json({ message: (await Task.deleteMany({})).n + " task(s) removed." });
  } catch (e) {
    res.json({ message: "Error clearing tasklist: " + e.toString() });
  }
});
