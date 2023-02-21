var express = require("express");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var axios = require("axios");
var app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

var path = __dirname + "/views";
var port = process.env.PORT || 3000;

var session = require("express-session");
var flash = require("connect-flash");
const sendMail = require("../sendEmail")

const mail_types = ["client-welcome", "new-user-notification"]

var isProd = process.env.NODE_ENV === "prod"
var website_url = isProd
    ? process.env["WEBSITE_PROD_URL"]
    : process.env["WEBSITE_URL"];

var user_board_url = isProd
    ? process.env["USER_BOARD_PROD_URL"]
    : process.env["USER_BOARD_URL"];

app.use(
    session({
        secret: "secret",
        cookie: {
            maxAge: 20000,
        },
        saveUninitialized: true,
        resave: true,
    })
);

app.use(flash());

app.use(express.static("public", {maxAge: 1000 * 60 * 60 * 24 * 31 } ));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
console.log(website_url);

app.get("/", (req, res) => {
    console.log({ user_board_url });
    res.render(path + "/index", {
        page_name: "index",
        user_dashboard_url: user_board_url,
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/about", (req, res) => {
    res.render(path + "/about-us", {
        page_name: "about-us",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/contact", (req, res) => {
    res.render(path + "/contact", {
        page_name: "contact",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.post("/contact-us", async (req, res) => {
    const { name, email, message } = req.body
    console.log({name, email, message});
   await sendMail({
        firstname: name,
        lastname: "",
        email,
        message,
        mail_type: "contact"
    })
    res.send({
        success: true
    })
})

app.get("/services", (req, res) => {
    res.render(path + "/our-services", {
        page_name: "services",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});

app.get("/privacy", (req, res) => {
    res.render(path + "/privacy", {
        page_name: "privacy",
        user_dashboard_login: user_board_url + "/login",
        user_register: user_board_url + "/register",
    });
});


const mailer = (body) => {
    let transporter = nodemailer.createTransport({
        host: "dsedelivery.com",
        port: 465,
        secureConnection: true,
        // true for 465, false for other ports
        requiresAuth: true,
        domains: ["dsedelivery.com"],
        auth: {
            user: "support@dsedelivery.com", // generated ethereal user
            pass: "fL({Rrbfm49J", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let mailOptions = {
        from: `support@dsedelivery.com`, // sender address
        to: body.mail_type === mail_types[1] ? "figgrand01@gmail.com" : data.email, // list of receivers
        subject: body.mail_type === mail_types[1] ? "New signup" : "Welcome to PayfoxTrade", // Subject line
        text: body.mail_type === mail_types[1] ? "A new user just signed up on PayfoxTrade" : "From all of us at Payfox.", // plain text body
        html: data.body, // html body
        attachments: [
            {
                filename: "payfoxtrade.jpg",
                path: __dirname + "/payfoxtrade.jpg",
                cid: "uniq-payfoxtrade.jpg"
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        req.flash("message", "Your request has been submitted successfully");
        res.redirect("/");
    });
}

//const data = { firstname: "Aminu", lastname: "Sadiq", email: "kelzvictoria@gmail.com", mail_type: mail_types[0] }


//sendMail(data)

app.post("/send-mail", (req, res) => {

})

app.listen(port, function () {
    console.log("website server listening at ", port);
});
