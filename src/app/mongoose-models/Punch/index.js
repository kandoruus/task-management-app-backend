//reference: https://stackoverflow.com/questions/8737082/mongoose-schema-within-schema
const mongoose = require("mongoose");

const isDateString = [(string) => !isNaN(Date.parse(string)), '"{VALUE}" is not a valid date.'];

const punchSchema = new mongoose.Schema({
  punchIn: {
    type: String,
    required: true,
    validate: isDateString,
  },
  punchOut: {
    type: String,
    validate: isDateString,
  },
  taskId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Task" },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

const Punch = (module.exports = mongoose.model("Punch", punchSchema));
