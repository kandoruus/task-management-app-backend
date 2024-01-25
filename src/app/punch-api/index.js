const express = require("express");
const app = (module.exports = express());
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const Punch = require("mongoose-models/Punch");
const updateOpts = { new: true, runValidators: true };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.post("/punch-api/create-punch", async (req, res) => {
  try {
    const { punchIn, punchOut, taskId, userId } = req.body;
    let punchData = { taskId, userId, punchIn: parseInt(punchIn) };
    if (punchOut != undefined) {
      punchData = { ...punchData, punchOut: parseInt(punchOut) };
    }
    return res.status(201).send({
      message: "Punched created successfully.",
      id: (await Punch.create(punchData))._id,
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/punch-in", async (req, res) => {
  try {
    const { punchIn, taskId, userId } = req.body;
    return res.status(201).send({
      message: "Punched in successfully.",
      id: (await Punch.create({ punchIn: parseInt(punchIn), userId, taskId }))._id,
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/punch-out", async (req, res) => {
  try {
    const { id, punchOut } = req.body;
    if ((await Punch.findByIdAndUpdate(id, { punchOut: punchOut }, updateOpts)) === null) {
      throw new Error('No punch with id: "' + id + '" found.');
    } else {
      return res.status(201).send({ message: "Punched out successfully." });
    }
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/user-punchlist", async (req, res) => {
  try {
    const { userId } = req.body;
    return res.status(201).json({
      message: "Punchlist successfully fetched.",
      punchlist: await Punch.find({ userId: userId }),
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/update-punch", async (req, res) => {
  try {
    const { id, punchIn, punchOut, taskId } = req.body;
    let updatedData = { punchIn: parseInt(punchIn), taskId };
    if (punchOut !== undefined) {
      updatedData.punchOut = parseInt(punchOut);
    }
    if ((await Punch.findByIdAndUpdate(id, updatedData, updateOpts)) === null) {
      throw new Error('No punch with id: "' + id + '" found.');
    } else {
      return res.status(201).send({ message: "Punch updated successfully." });
    }
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/delete-punch", async (req, res) => {
  try {
    const { id } = req.body;
    if ((await Punch.findByIdAndDelete(id)) === null) {
      throw new Error('No punch with id: "' + id + '" found.');
    } else {
      return res.status(201).send({ message: "Punch deleted successfully." });
    }
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/delete-punches-by-user", async (req, res) => {
  try {
    const { userId } = req.body;
    return res.status(201).send({
      message: (await Punch.deleteMany({ userId: userId })).n + " punch(es) deleted successfully.",
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});

app.post("/punch-api/delete-punches-by-task", async (req, res) => {
  try {
    const { userId, taskId } = req.body;
    return res.status(201).send({
      message:
        (await Punch.deleteMany({ userId: userId, taskId: taskId })).n +
        " punch(es) deleted successfully.",
    });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
});
