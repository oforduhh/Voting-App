const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  isVoted: false,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  date: {
    type: Date,
    default: Date.now,
  },
});
const User = mongoose.model("userModels", userSchema);
module.exports = User;
