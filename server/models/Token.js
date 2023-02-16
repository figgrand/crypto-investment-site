const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    token: {
        type: String,
        required: true,
    },
    date_created: {
        type: Date,
        default: Date.now,
        expires: 60000 * 5
    }
});

module.exports = Token = mongoose.model("token", TokenSchema)