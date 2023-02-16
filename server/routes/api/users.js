const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");

const jwt = require("jsonwebtoken");

const User = require("../../models/User");

const referralCodes = require("referral-codes")

router.get("/", (req, res) => {
  const { code, upline } = req.query
  if (code){
    User.find({ referral_code: code }).then((user) => res.json(user))
  } else if (upline){
    User.find({ upline }).then((users) => res.json(users))
  } 
  else {
    User.find()
    .sort({
      date: -1
    }).then((users) => res.json(users))
  }

});

router.get("/:id", (req, res) => {

  User.findById(req.params.id)
    .then((user) => {
      
      return res.json(user);
    })
})

router.post("/", async (req, res) => {
  const { username, email, password, role, firstname, lastname, upline } = req.body;
  let upline_data = null;
   await User.find({ referral_code: upline }).then((user) => upline_data = user)
  console.log("upline_data");
  console.log(upline_data);
  let upline_exists = Array.isArray(upline_data) && upline_data.length
  console.log({upline_exists});

  if (upline && !upline_exists){
    return res.status(400).json({
      msg: "Referral code is invalid",
    });
  } else {
    const referral_code = referralCodes.generate({
      length: 8,
      count: 1,
    })[0];
  
    console.log({referral_code});
    //console.log(username, email, password, role);
    if (!username || !email || !password) {
      return res.status(400).json({
        msg: "Please enter all fields",
      });
    }
  
    User.findOne({ email }).then((user) => {
      if (user)
        return res.status(400).json({
          msg: "User already exists",
        });
      // console.log("user", user);
      User.findOne({ email }).then((acc) => {
        if (acc)
          return res.status(400).json({
            msg: "This Email already exists",
          });
        // console.log("acc", acc);
      })
  
  
      const newUser = new User({
        username,
        email,
        password,
        role: role || "user",
        firstname,
        lastname,
        upline,
        referral_code
          });
  
      //Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then((user) => {
            jwt.sign(
              { id: user.id },
              process.env.jwtSecret,
              { expiresIn: 3600 },
              (err, token) => {
                if (err) throw err;
                res.json({
                  id: user.id,
                  username: user.username,
                  email: user.email,
                  role: user.role
                });
              });
          });
        });
      });
    });
  }
//send mail to admin
//send welcome mail to new user
 
});

router.put("/:id", async (req, res) => {

  try {
    var user = await User.findById(req.params.id).exec();
    user.set(req.body);

    var response = await user.save();
    res.send(response);
  } catch (error) {
    res.status(500).send(error)
  }

});


router.delete("/:id", auth, (req, res) => {
  User.findById(req.params.id)
    .then((user) =>
      user.remove().then(() => res.json({
        success: true
      }))
    ).catch((err) => res.status(400).json({
      success: false,
      err
    }))
})

module.exports = router;
