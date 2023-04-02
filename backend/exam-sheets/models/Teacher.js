const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teachers = new Schema({
  name: { type: String }
});

exports.teachersModel = mongoose.model("teachers", teachers);
