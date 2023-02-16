const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  register_date: {
    type: Date,
    default: Date.now,
    // required: true,
  },

  role: {
    type: Array,
    required: true
  },

  referral_code: {
    type: String,
    required: true
  },
  upline: {
    type: String,
    required: false
  }

});

module.exports = User = mongoose.model("user", UserSchema);
