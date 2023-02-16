const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  plan_id:  {
    type: String,
  },
  currency: {
    type: String,
  },
  amount: {
    type: Number,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
  },
  btc_wallet: {
    type: String
  },
  status: {
    type: String,
  },
  created_by: {
    type: Object,
    required: true,
  },

  modifier: {
    type: Object,
    required: true,
  },

  date_created: {
    type: Date,
    default: Date.now,
    required: true,
  },

  date_modified: {
    type: Date,
    default: Date.now,
    required: true,
  }
});

module.exports = Transaction = mongoose.model("transaction", TransactionSchema);