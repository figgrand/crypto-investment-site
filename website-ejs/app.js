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

app.use(express.static("public"));

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
        subject: body.mail_type === mail_types[1] ? "New signup" : "Welcome to Figgrand Trade", // Subject line
        text: body.mail_type === mail_types[1] ? "A new user just signed up on Figgrand Trade" : "From all of us at Figgrand.", // plain text body
        html: data.body, // html body
        attachments: [
            {
                filename: "logo.jpeg",
                path: __dirname + "/logo.jpeg",
                cid: "uniq-logo.jpeg"
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
const sendMail = async (data) => {
    const { firstname, lastname, email, mail_type } = data;
    let body = "";
    if (mail_type === "client-welcome") {
        body = `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
            <!-- Web Font / @font-face : BEGIN -->
            <!--[if mso]>
                <style>
                    * {
                        font-family: 'Roboto', sans-serif !important;
                    }
                </style>
            <![endif]-->
        
            <!--[if !mso]>
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
            <![endif]-->
        
            <!-- Web Font / @font-face : END -->
        
            <!-- CSS Reset : BEGIN -->
            
            
            <style>
                /* What it does: Remove spaces around the email design added by some email clients. */
                /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                html,
                body {
                    margin: 0 auto !important;
                    padding: 0 !important;
                    height: 100% !important;
                    width: 100% !important;
                    font-family: 'Roboto', sans-serif !important;
                    font-size: 14px;
                    margin-bottom: 10px;
                    line-height: 24px;
                    color:#8094ae;
                    font-weight: 400;
                }
                * {
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                    margin: 0;
                    padding: 0;
                }
                table,
                td {
                    mso-table-lspace: 0pt !important;
                    mso-table-rspace: 0pt !important;
                }
                table {
                    border-spacing: 0 !important;
                    border-collapse: collapse !important;
                    table-layout: fixed !important;
                    margin: 0 auto !important;
                }
                table table table {
                    table-layout: auto;
                }
                a {
                    text-decoration: none;
                }
                img {
                    -ms-interpolation-mode:bicubic;
                }
            </style>
        
        </head>
        
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
            <center style="width: 100%; background-color: #f5f6fa;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                    <tr>
                       <td style="padding: 40px 0;">
                            <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding-bottom:25px">
                                            <a href="#"><img style="height: 40px" src="cid:uniq-logo.jpeg" alt="logo"></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 30px 30px 20px">
                                            <p style="margin-bottom: 10px;">Hi ${firstname},</p>
                                            <p style="margin-bottom: 10px;">We are pleased to have you as a member of TokenWiz Family.</p>
                                            <p style="margin-bottom: 10px;">Your account is now verified and you can purchase tokens for the ICO. Also you can submit your documents for the KYC from my Account page.</p>
                                            <p style="margin-bottom: 15px;">Hope you'll enjoy the experience, we're here if you have any questions, drop us a line at <a style="color: #6576ff; text-decoration:none;" href="mailto:info@yourwebsite.com">info@yourwebsite.com</a> anytime. </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding:25px 20px 0;">
                                            <p style="font-size: 13px;">Copyright © 2020 DashLite. All rights reserved. <br> Template Made By <a style="color: #6576ff; text-decoration:none;" href="https://themeforest.net/user/softnio/portfolio">Softnio</a>.</p>
                                           <!-- <ul style="margin: 10px -4px 0;padding: 0;">
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-b.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-e.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-d.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-c.png" alt="brand"></a></li>
                                            </ul>-->
                                            <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://softnio.com">softnio.com</a>. To update your emails preferences <a style="color: #6576ff; text-decoration:none;" href="#">click here</a>.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                       </td>
                    </tr>
                </table>
            </center>
        </body>
        </html>`
        //send welcome mail to client
    } else {
        body = `<!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="x-apple-disable-message-reformatting">
            <title></title>
            
            <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
            <!-- Web Font / @font-face : BEGIN -->
            <!--[if mso]>
                <style>
                    * {
                        font-family: 'Roboto', sans-serif !important;
                    }
                </style>
            <![endif]-->
        
            <!--[if !mso]>
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,600" rel="stylesheet" type="text/css">
            <![endif]-->
        
            <!-- Web Font / @font-face : END -->
        
            <!-- CSS Reset : BEGIN -->
            
            
            <style>
                /* What it does: Remove spaces around the email design added by some email clients. */
                /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                html,
                body {
                    margin: 0 auto !important;
                    padding: 0 !important;
                    height: 100% !important;
                    width: 100% !important;
                    font-family: 'Roboto', sans-serif !important;
                    font-size: 14px;
                    margin-bottom: 10px;
                    line-height: 24px;
                    color:#8094ae;
                    font-weight: 400;
                }
                * {
                    -ms-text-size-adjust: 100%;
                    -webkit-text-size-adjust: 100%;
                    margin: 0;
                    padding: 0;
                }
                table,
                td {
                    mso-table-lspace: 0pt !important;
                    mso-table-rspace: 0pt !important;
                }
                table {
                    border-spacing: 0 !important;
                    border-collapse: collapse !important;
                    table-layout: fixed !important;
                    margin: 0 auto !important;
                }
                table table table {
                    table-layout: auto;
                }
                a {
                    text-decoration: none;
                }
                img {
                    -ms-interpolation-mode:bicubic;
                }
            </style>
        
        </head>
        
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
            <center style="width: 100%; background-color: #f5f6fa;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
                    <tr>
                       <td style="padding: 40px 0;">
                            <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding-bottom:25px">
                                            <a href="#"><img style="height: 40px" src="cid:uniq-logo.jpeg" alt="logo"></a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                                <tbody>
                                    <tr>
                                        <td style="padding: 30px 30px 20px">
                                            <p style="margin-bottom: 10px;">Hi Figgrand Support,</p>
                                            <p style="margin-bottom: 10px;">A new account has just been registered.</p>
                                            <p style="margin-bottom: 10px;">Name: ${firstname} ${lastname}.</p>
                                            <p style="margin-bottom: 15px;">Email: ${email} </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table style="width:100%;max-width:620px;margin:0 auto;">
                                <tbody>
                                    <tr>
                                        <td style="text-align: center; padding:25px 20px 0;">
                                            <p style="font-size: 13px;">Copyright © 2020 DashLite. All rights reserved. <br> Template Made By <a style="color: #6576ff; text-decoration:none;" href="https://themeforest.net/user/softnio/portfolio">Softnio</a>.</p>
                                           <!-- <ul style="margin: 10px -4px 0;padding: 0;">
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-b.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-e.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-d.png" alt="brand"></a></li>
                                                <li style="display: inline-block; list-style: none; padding: 4px;"><a style="display: inline-block; height: 30px; width:30px;border-radius: 50%; background-color: #ffffff" href="#"><img style="width: 30px" src="images/brand-c.png" alt="brand"></a></li>
                                            </ul>-->
                                            <p style="padding-top: 15px; font-size: 12px;">This email was sent to you as a registered user of <a style="color: #6576ff; text-decoration:none;" href="https://softnio.com">softnio.com</a>. To update your emails preferences <a style="color: #6576ff; text-decoration:none;" href="#">click here</a>.</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                       </td>
                    </tr>
                </table>
            </center>
        </body>
        </html>`
        //send new account creation mail to admin
    }

    data.body = body;
    mailer(data)
}

//sendMail(data)

app.post("/send-mail", (req, res) => {

})

app.listen(port, function () {
    console.log("website server listening at ", port);
});
