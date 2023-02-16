const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    name: {
        type: String,
    },
    currency: {
        type: String
    },
    balance: {
        type: Number
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
    },
    investments:{
        type: Array,
        default: []
    }
})


module.exports = Transaction = mongoose.model("account", AccountSchema);