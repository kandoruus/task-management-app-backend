const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  data: { name: String, description: String, status: String, priority: String },
});
const Task = (module.exports = mongoose.model("Task", taskSchema));
