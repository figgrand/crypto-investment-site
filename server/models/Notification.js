const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
    },
    date_created: {
        type: Date,
        default: Date.now,
        required: true,
    },
})


module.exports = Transaction = mongoose.model("notification", NotificationSchema);