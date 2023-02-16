const User = require("../../models/User");
const Token = require("../../models/Token");
const bcrypt = require("bcryptjs");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const Joi = require("joi");

router.post("/", async (req, res) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required()
        })

        const { error } = schema.validate(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({
            email: req.body.email
        });

        //console.log({user});

        if(!user) {
            return res.status(400).json({
                success: false,
                msg: "User does not exist",
              });
        }
         
        let token = await Token.findOne({ user_id: user._id})
        if (!token) {
            token = await new Token({
                user_id: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.USER_BOARD_URL}/password_reset?user_id=${user._id}&token=${token.token}`
        const data = { 
            firstname: user.firstname, 
            lastname: user.lastname, 
            email: user.email, 
            mail_type: "password_reset", 
            link 
        }
        console.log({data});
        await sendEmail(data)
        res.status(200).json({
            success: true,
            msg: "Password reset link sent to your email account",
          });
        
    } catch(err){
        res.status(500).send("An error occured");
        console.log(err);
    }
})

router.post("/:user_id/:token", async (req, res) => {
    console.log("helo bae");
    console.log("req.params.token", req.params.token, "req.params.user_id", req.params.user_id, "req.body.password", req.body.password);
    let response = {
        success: false,
        msg: ""
    }
    try {
        const schema = Joi.object({ password: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.params.user_id);
        if (!user){
            return res.status(400).json({
                success: false,
                msg: "Invalid user ID",
              });
        }
        const token = await Token.findOne({
            user_id: user._id,
            token: req.params.token,
        });

        console.log({token});

        if (!token){
            return res.status(400).json({
                success: false,
                msg: "Invalid or expired link",
              });
        }

        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hashSync(req.body.password, salt)

        if (hash){
        user.password = hash;
        await user.save();
        await token.delete();
        response.success = true
        response.msg = "password reset sucessfully."
        } else {
            console.log("couldnt hash password");
            response.msg = "couldnt hash password";
        }
        res.send(response)

    } catch(err){
        response.msg = err
        console.log("error", err);
        res.send(response)
    }

})
module.exports = router;