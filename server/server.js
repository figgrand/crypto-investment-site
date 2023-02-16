const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const transactions = require("./routes/api/transactions");
const accounts = require("./routes/api/accounts");
const notifications = require("./routes/api/notifications")
const password_reset = require("./routes/api/password_reset");

const app = express();
app.use(cors());
app.use(express.json());

const dotenv = require("dotenv");
//dotenv.config()
dotenv.config({ path: "../.env" });

const db = process.env.mongoURI;
const PORT = process.env.PORT || 3002;

mongoose
    .connect(db, {
        useNewUrlParser: true,
        //useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => console.log(err));

app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/transactions", transactions);
app.use("/api/accounts", accounts);
app.use("/api/notifications", notifications)
app.use("/api/password_reset", password_reset)

app.listen(PORT, () => console.log(`Backend server started on port ${PORT}`));