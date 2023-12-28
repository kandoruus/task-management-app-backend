//reference: https://stackoverflow.com/questions/8737082/mongoose-schema-within-schema
const mongoose = require("mongoose");

const isValidDate = [
  (input) => new Date(input).toString() !== "Invalid Date",
  '"{VALUE}" is not a valid date.',
];
const punchSchema = new mongoose.Schema({
  punchIn: {
    type: Number,
    required: true,
    validate: isValidDate,
  },
  punchOut: {
    type: Number,
    validate: isValidDate,
  },
  taskId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Task" },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

const Punch = (module.exports = mongoose.model("Punch", punchSchema));
