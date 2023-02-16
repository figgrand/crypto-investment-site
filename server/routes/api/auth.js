const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

const User = require("../../models/User");

router.post("/", (req, res) => {
  //console.log("req");
  //console.log(req);
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({
      success: false,
      msg: "Please enter all fields",
    });
  }

  User.findOne({ email }).then((user) => {
    if (!user)
      return res.status(400).json({
        success: false,
        msg: "User does not exist",
      });

    //Validate password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid login credentials" });

      jwt.sign(
        { id: user.id },

        process.env.jwtSecret,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user//: {
              // id: user.id,
              // username: user.username,
              // firstname: user.firstname,
              // lastname: user.lastname,
              // email: user.email,
              // role: user.role
            //},
          });
        }
      );
    });
  });
});

//GET user details
router.get("/user", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then((user) => res.json(user));
});

module.exports = router;
