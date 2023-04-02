const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sheets = new Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teachers"
  },
  title: {type: String},
  questions: { type: Array, default: [] },
  status: { type: String, default: "saved" },
  created_at: { type: Date }
});

exports.sheetsModel = mongoose.model("sheets", sheets);
