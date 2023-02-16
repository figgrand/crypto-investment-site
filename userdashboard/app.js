var express = require("express");
const dotenv = require("dotenv");
var axios = require("axios");
var app = express();

var path = __dirname + "/views";
dotenv.config({ path: "../.env" });
var port = process.env.PORT || 3001;
var isProd = process.env.NODE_ENV === "prod"
var website_url = isProd
    ? process.env["WEBSITE_PROD_URL"]
    : process.env["WEBSITE_URL"];

var user_board_url = isProd
    ? process.env["USER_BOARD_PROD_URL"]
    : process.env["USER_BOARD_URL"];

var server_base_url = isProd
    ? process.env["SERVER_BASE_PROD_URL"]
    : process.env["SERVER_BASE_URL"];

console.log({
    website_url, user_board_url, server_base_url
});

var session = require("express-session");
var flash = require("connect-flash");
const redis = require('redis');
var redisClient;
const connectRedis = require('connect-redis');

const functions = require("./functions");
const options = require("./options");

var cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

let referral_bonus = 0.1 //process.env["REFERRAL_BONUS"];
//console.log({referral_bonus});
let current_btc_price = 23372.94
// enable this if you run behind a proxy (e.g. nginx)
app.set('trust proxy', 1);
const RedisStore = connectRedis(session);//Configure redis client
//https://stackoverflow.com/a/70989016
(async () => {
    redisClient = redis.createClient({
        /*url: "redis://localhost:6379",*/
        legacyMode: true,
        password: 'zIEusbGtKZdpKVBD8IkHOf5ltUhuvN0p',
        socket: {
            host: 'redis-14926.c100.us-east-1-4.ec2.cloud.redislabs.com',
            port: 14926
        }
    })
    redisClient.on('error', function (err) {
        console.log('Could not establish a connection with redis. ' + err);
    });
    await redisClient.connect();
    await redisClient.set("key", "value");
    console.log('Connected to redis successfully');
})();

const getBTCPrice = () => {
    axios.get("https://www.blockchain.com/explorer/_next/data/ae6d6d85-prod/prices.json").then(res => {

        current_btc_price = res.data.pageProps.marketData.btcPrice
        console.log("price", current_btc_price);
    }).catch(err => console.log(err))
}

setTimeout(getBTCPrice, 1000 * 60 * 60 * 5)

//https://medium.com/swlh/session-management-in-nodejs-using-redis-as-session-store-64186112aa9


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Configure session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 60 // session max age in miliseconds
    }
}))

app.use(express.static("public"));

setTimeout(async () => {
    var isProd = process.env.NODE_ENV === "prod"

    await functions.generateToken(
        isProd
            ? process.env["SERVER_BASE_PROD_URL"]
            : process.env["SERVER_BASE_URL"],
        process.env["ADMIN_EMAIL"],
        process.env["ADMIN_PASSWORD"]
    )
    cron.schedule('*/5 * * * *', () => {
        console.log('running depositROIs every minute');
        functions.depositROIs()
    });


}, 20000)

app.set("view engine", "ejs");

app.get("/authorize", (req, res) => {
    res.render(path + "/index", {
        page_name: "index",
        token: req.query.t
    });
    //res.send({token: req.query.t, redirect: "/"})

});

app.get("/", async (req, res) => {
    const sess = req.session;
    //const data = {};

    if (sess.email && sess.password && sess.data) {
        /*const transactions = await functions.getTransactions(JSON.parse(sess.user)._id);
        const accounts = await functions.getAccounts(JSON.parse(sess.user)._id);
        const investments = await functions.getTotalInvestment(transactions, accounts);

        const downlines = await functions.getDownlines(JSON.parse(sess.user).referral_code);
        const upline_details = await functions.getUplineDetails(JSON.parse(sess.user).upline);
        const ref_profits = functions.getRefProfits(transactions);
        const notifications = await functions.getNotifications(JSON.parse(sess.user)._id);

        data["available_balance"] = accounts && accounts.length ? accounts[0].balance : 0
        data["total_invested"] = investments.total;
        data["total_profits"] = investments.investment_profit + investments.referral_bonus;
        data["account_balance"] = (accounts && accounts.length ? accounts[0].balance : 0) //+ investments.total;
        data["this_month"] = {
            profits: investments.this_month.profit,
            referrals: investments.this_month.referral_bonus,
            total: investments.this_month.profit,
            investment_profit: investments.this_month.investment_profit
        }
        data["investments"] = {
            total: investments.total,
            count: investments.investments.length,
            items: investments.investments,

        }
        data["accounts"] = accounts[0];
        data["user"] = {
            ...JSON.parse(sess.user),
            upline: upline_details,
            notifications,
            downlines,
            ref_profits,
            ref_link: process.env["USER_BOARD_URL"] + "/register?code=" + JSON.parse(sess.user).referral_code,
        }
        data["currency"] = accounts && accounts.length ? accounts[0].currency : "BTC"

        data["website"] = process.env["WEBSITE_URL"]
   
        req.session["data"] = data*/
        //console.log("data.accounts.investments:",JSON.stringify(data.accounts.investments));

        res.render(path + "/index", {
            page_name: "index",
            data: sess.data
        });
    } else {
        req.session["page"] = "overview"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/"
        });
    }
});

app.get("/plans", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
        const data = sess.data;
        res.render(path + "/plans", {
            page_name: "plans",
            data
        });
    } else {
        req.session["page"] = "plans"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/"
        });
    }
});

app.get("/plan-details", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
        const data = sess.data;
        let investment_id = req.query.id;
        let plan;

        if (investment_id) {
            plan = data.accounts.investments.find(i => i._id === investment_id);
            let details = options.inv_plans.find(p => p.id === plan.plan_id)
            //console.log({plan_rois: plan.profit.rois});
            //console.log("options.inv_plans.find(p => p.id === selected_plan)", 
            //options.inv_plans.find(p => p.id === plan.plan_id));
            plan["name"] = details.name;
            plan["roi"] = details.roi;
            plan["duration"] = details.duration;
        }
        res.render(path + "/plan-details", {
            page_name: "plan-details",
            data,
            plan
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications*/
        });
    } else {
        req.session["page"] = "plan-details"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/"
        });
    }
});

app.get("/invest", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        const data = sess.data;
        res.render(path + "/invest", {
            page_name: "invest",
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications,*/
            data,
            inv_plans: options.inv_plans
        });
    } else {
        req.session["page"] = "invest"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/"
        });
    }

});

app.get("/login", (req, res) => {
    res.render(path + "/auth-signin", {
        page_name: "auth-signin",
        error: req.query.auth ? "Invalid login credentials" : null,
        login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
        redirect_url: user_board_url + "/"
    });
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/login")
    });
})

app.get("/register", (req, res) => {
    res.render(path + "/auth-signup", {
        page_name: "auth-signup",
        error: null,
        redirect_url: user_board_url + "/"

    });
});

app.post("/submit-registration", async (req, res) => {
    console.log("submit registration");
    // generate referral code
    const { username,
        email,
        password,
        firstname,
        lastname,
        referral_code,
        upline
    } = req.body;
    console.log(req.body);
    let response = {
        success: false,
        error: undefined
    };
    await axios.post(server_base_url + "/api/users", {
        username,
        email,
        password,
        firstname,
        lastname,
        referral_code,
        upline
    }).then(async resp => {
        response.success = true
        console.log("success");
        // await sendMail({
        //     firstname, lastname, email, mail_type: mail_types[0]
        // });

        // await sendMail({
        //     firstname, lastname, email, mail_type: mail_types[1]
        // })
        console.log(resp)
    }).catch(err => {
        //console.log(err) 
        console.log("error");
        response.error = err.response && err.response.data ? err.response.data.msg : "Something went wrong. Please try again."
    })

    console.log({ response });
    if (response.success) {
        console.log('reg success');
        res.redirect("/login");
    } else {
        res.render(path + "/auth-signup", {
            page_name: "auth-signup",
            error: response.error
        });
    }
})

app.post("/auth", async (req, res) => {
    console.log("req.session.page", req.session.page);

    let response = {
        success: false,
        error: undefined
    };

    await axios.post(`${server_base_url}/api/auth`, {
        email: req.body["email"],
        password: req.body["password"],
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(async resp => {
        const sess = req.session;
        const data = {};

        const { email, password } = req.body
        sess.email = email
        sess.password = password
        sess.token = resp.data.token;
        sess.user = JSON.stringify(resp.data.user)
        response.success = true
        response.data = resp.data
        const is_admin = sess.user && JSON.parse(sess.user).role.includes("admin")

        const transactions = await functions.getTransactions(JSON.parse(sess.user)._id);
        const accounts = await functions.getAccounts(JSON.parse(sess.user)._id);
        const investments = await functions.getTotalInvestment(transactions, accounts);

        const downlines = await functions.getDownlines(JSON.parse(sess.user).referral_code);
        const upline_details = await functions.getUplineDetails(JSON.parse(sess.user).upline);
        const ref_profits = functions.getRefProfits(transactions);
        const notifications = await functions.getNotifications(JSON.parse(sess.user)._id);
        const user_has_account = accounts && accounts.length ? true : false;

        console.log({ user_has_account, is_admin });

        if (is_admin) {
            const approved_transactions = await functions.getAllTransactions("approved");
            const pending_transactions = await (await functions.getAllTransactions("pending")).filter(i => i.type !== "referral_bonus")
            const total_deposit = await functions.calcTotalTransByType(approved_transactions, "deposit");
            const total_withdrawn = await functions.calcTotalTransByType(approved_transactions, "withdrawal");
            const total_invested = await functions.calcTotalTransByType(approved_transactions, "investment");
            data["admin"] = {
                total_deposit, total_withdrawn, total_invested, pending_transactions
            }
        }

        data["available_balance"] = accounts && accounts.length ? accounts[0].balance : 0
        data["total_invested"] = investments.total;
        data["total_profits"] = investments.investment_profit + investments.referral_bonus;
        data["account_balance"] = (accounts && accounts.length ? accounts[0].balance : 0) //+ investments.total;
        data["this_month"] = {
            profits: investments.this_month.profit,
            referrals: investments.this_month.referral_bonus,
            total: investments.this_month.profit,
            investment_profit: investments.this_month.investment_profit
        }
        data["investments"] = {
            total: investments.total,
            count: investments.investments.length,
            items: investments.investments,

        }
        data["accounts"] = accounts[0];
        data["user"] = {
            has_account: user_has_account,
            ...JSON.parse(sess.user),
            upline: upline_details,
            notifications,
            downlines,
            ref_profits,
            password,
            ref_link: user_board_url + "/register?code=" + JSON.parse(sess.user).referral_code,
        }
        data["currency"] = accounts && accounts.length ? accounts[0].currency : "BTC"

        data["website"] = website_url//process.env["WEBSITE_URL"]
        console.log("data.user.has_account", data.user.has_account);
        req.session["data"] = data;


    }).catch(err => {
        //console.log(err) 
        console.log("error", err);
        response.error = err.response && err.response.data ? err.response.data.msg : "We couln't authenticate you. Please try again."
    })

    if (response.success) {
        res.send({ token: response.data.token, redirect: `${user_board_url}${req.session.page && req.session.page !== "overview" ? "/" + req.session.page : ""}`, user: JSON.stringify(response.data.user) })
    } else {
        res.send({ ...response })
    }
})

app.get("/admin", async (req, res) => {
    const sess = req.session;
    //console.log("user role", sess.user.role, "parsed role", JSON.parse(sess.user).role);
    if (sess.email && sess.password && (sess.user && JSON.parse(sess.user).role.includes("admin"))) {
        const data = sess.data;
        const { total_deposit, total_withdrawn, total_invested, pending_transactions } = data.admin
        console.log("show data.admin");
        console.log(data.admin);
        res.render(path + "/admin", {
            data,
            page_name: "admin",
            user: JSON.parse(sess.user),
            total_deposit,
            total_withdrawn,
            total_invested,
            pending_transactions
            // notifications
        });
    } else {
        req.session["page"] = "admin"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: sess.user && (!JSON.parse(sess.user).role.includes("admin"))
                ? "You need an admin account to access this page"
                : req.query.auth ? "Invalid login credentials"
                    : null,
            login_endpoint: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/auth",
            redirect_url: user_board_url /*process.env["USER_BOARD_URL"]*/ + "/"
        });
    }
});

app.post("/invest", async (req, res) => {
    const response = { success: false }
    if (req.session.data && req.session.data.user) {
        const user = req.session.data.user
        const { firstname, lastname, email } = user
        let post_data = req.body
        post_data["created_by"].firstname = firstname;
        post_data["created_by"].lastname = lastname;
        post_data["created_by"].email = email;
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
        await axios.post(
            `${server_base_url}/api/transactions`,
            post_data,
            {
                headers
            }
        ).then(async resp => {
            response.success = true;
            response.data = resp.data;
            if (response.data.type === "investment") {
                // response.data["_id"] = uuidv4();//here
                response.data["start_date"] = new Date().toISOString();
                response.data["last_updated"] = null;
                response.data["profit"] = { total: 0, rois: [] } //here
            }
            // response.data._id = 
            response.data.type = response.data.date_created = response.data.date_modified = undefined;

            //  console.log("req.session.data.accounts", req.session.data.accounts);
            // console.log("post_data.amount", post_data.amount);
            let prev_inv = req.session.data.accounts && req.session.data.accounts.investments.length ? req.session.data.accounts.investments : []
            //console.log("prev_inv", prev_inv);
            await axios.put(server_base_url
                + "/api/accounts/" + req.session.data.accounts._id, {
                id: req.session.data.accounts._id,
                balance: req.session.data.accounts.balance - post_data.amount,
                investments: prev_inv.length ? [...prev_inv, response.data] : [response.data] //here
            }, { headers })
                .catch(err => console.log("Update acc balance err", err))
            await axios.post(
                `${server_base_url}/api/notifications`,
                {
                    user: user._id/*{
                        id: user._id, 
                        firstname: user.firstname, 
                        lastname: user.lastname, 
                        email: user.email 
                    }*/,
                    title: "New Investment plan created",
                    description: "Your investment plan has been created."
                },
                {
                    headers
                }
            )//.then(respnse => /*console.log(respnse*/))
                .catch(err => console.log("Notifications err", err))
        }).catch(err => console.log("Depost err", err))
    }
    res.send(response)
})

app.get("/invest-form", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        //console.log("sess.accounts", sess.accounts);
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        const selected_plan = req.query["plan-iv"];
        const data = sess.data;
        //console.log({selected_plan});
        res.render(path + "/invest-form", {
            page_name: "invest-form",
            data,
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications,*/
            selected_plan: options.inv_plans.find(p => p.id === selected_plan)
        });
    } else {

        req.session["page"] = "invest-form?plan-iv=" + req.query["plan-iv"]
        console.log(req.query, req.session);
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }

});

app.get("/deposit", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const notifications = sess.notifications// await functions.getNotifications(JSON.parse(sess.user).id);
        const data = sess.data;
        res.render(path + "/deposit", {
            page_name: "deposit",
            data
            /* user: JSON.parse(sess.user),
             website: process.env["WEBSITE_URL"],
             notifications*/
            // use
        });
    } else {
        req.session["page"] = "deposit"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }

});

app.post("/deposit", async (req, res) => {
    console.log("hit post deposit route");
    const {
        deposit_amount,
        deposit_currency,
    } = req.body;

    console.log({ deposit_amount, deposit_currency });
    const response = { success: false }

    if (req.session.data && req.session.data.user) {
        const user = //JSON.parse(
            req.session.data.user
        //);
        const { firstname, lastname, email, upline } = user;
        const has_account = req.session.data.accounts && req.session.data.accounts._id;
        console.log("has_account", has_account);

        let post_data = {
            type: "deposit",
            created_by: { id: user._id, firstname, lastname, email },
            upline,
            amount: deposit_amount,
            currency: deposit_currency
        };

        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        };

        let upline_details = req.session.data.user["upline"];

        let upline_account = upline_details["accounts"]

        let xyz = deposit_amount * referral_bonus;

        let post_upline_data = {
            type: "referral_bonus",
            created_by: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
            upline: upline_details.upline,
            amount: xyz,
            currency: deposit_currency
        };

        let update_acc_body = {
            id: req.session.data.accounts && req.session.data.accounts._id || undefined,
            balance: req.session.data.accounts && parseInt(req.session.data.accounts.balance) + parseInt(deposit_amount || 0),
            created_by: { id: user._id, firstname, lastname, email },
            modifier: { id: user._id, firstname, lastname, email },
        };

        let update_upline_acc_body = {
            id: upline_account[0] && upline_account[0]._id || undefined,
            balance: upline_account[0] && parseInt(upline_account[0].balance) + (parseInt(deposit_amount) * referral_bonus),
            created_by: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
            modifier: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
        };

        let post_acc_body = {
            created_by: { id: user._id, firstname, lastname, email },
            currency: deposit_currency,
            balance: deposit_amount,
            modifier: { id: user._id, firstname, lastname, email },
        };

        let post_upline_acc_body = {
            created_by: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
            currency: deposit_currency,
            balance: deposit_amount * referral_bonus,
            modifier: { id: upline_details._id, firstname: upline_details.firstname, lastname: upline_details.lastname, email: upline_details.email },
        };

        /*console.log(JSON.stringify({
            has_account,
            update_acc_body,
            post_acc_body,
            upline_account,
            update_acc_body,
            post_upline_acc_body,
            post_data,
            post_upline_data
        })); */
        axios.all([
            axios({
                method: has_account ? "PUT" : "POST",
                url: has_account
                    ? `${server_base_url}/api/accounts/${req.session.data.accounts._id}`
                    : `${server_base_url}/api/accounts`,
                data: has_account ? update_acc_body : post_acc_body,
                headers
            }),
            axios({
                method: upline_account.length ? "PUT" : "POST",
                url: upline_account.length
                    ? `${server_base_url}/api/accounts/${upline_account[0]._id}`
                    : `${server_base_url}/api/accounts`,
                data: upline_account.length ? update_upline_acc_body : post_upline_acc_body,
                headers
            }),
            axios.post(
                `${server_base_url}/api/transactions`,
                post_data,
                {
                    headers
                }
            ).then(async resp => {
                response.success = true;
                response.data = resp.data
                await axios.post(
                    `${server_base_url}/api/notifications`,
                    {
                        user: user._id,
                        title: "Your Deposit Order is placed",
                        description: "Your deposit has been sent for approval. You will be notified when this has been done."
                    },
                    {
                        headers
                    }
                )//.then(respnse => ))
                    .catch(err => console.log("Notifications err", err))
            }).catch(err => console.log("Depost err", err)),

            axios.post(
                `${server_base_url}/api/transactions`,
                post_upline_data,
                {
                    headers
                }
            ).then(async resp => {
                response.success = true;
                response.data = resp.data
                await axios.post(
                    `${server_base_url}/api/notifications`,
                    {
                        user: upline_details._id,
                        title: `Referral bonus deposited.`,
                        description: `Your downline: ${user.firstname} ${user.lastname} has deposited ${deposit_amount} and you have received ${deposit_amount * referral_bonus} referral bonus.`
                    },
                    {
                        headers
                    }
                )//.then(respnse => ))
                    .catch(err => console.log("Notifications err", err))
            }).catch(err => console.log("Depost err", err))
        ])
        res.send(response)
    }
})

app.get("/withdraw", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const notifications = await functions.getNotifications(JSON.parse(sess.user).id);
        const data = sess.data
        res.render(path + "/withdraw", {
            page_name: "withdraw",
            data
            /* user: JSON.parse(sess.user),
             website: process.env["WEBSITE_URL"],
             notifications*/
            // use
        });
    } else {
        req.session["page"] = "withdraw"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }

});

app.post("/withdraw", async (req, res) => {
    const response = { success: false }
    if (req.session.data.user) {
        const user = //JSON.parse(
            req.session.data.user//);
        const { firstname, lastname, email } = user
        let post_data = req.body
        post_data["created_by"].firstname = firstname;
        post_data["created_by"].lastname = lastname;
        post_data["created_by"].email = email;
        console.log({ post_data });
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
        await axios.put(server_base_url
            + "/api/accounts/" + req.session.data.accounts._id, {
            id: req.session.data.accounts._id,
            balance: req.session.data.accounts.balance - post_data.amount,
        }, { headers })
            .catch(err => console.log("Update acc balance err", err))
        await axios.post(
            `${server_base_url}/api/transactions`,
            post_data,
            {
                headers
            }
        ).then(async resp => {
            response.success = true;
            response.data = resp.data;
            response.data._id = response.data.type = response.data.date_created = response.data.date_modified = undefined;

            await axios.post(
                `${server_base_url}/api/notifications`,
                {
                    user: user._id,
                    title: "New withdrawal request",
                    description: "Your withdrawal request has been recorded."
                },
                {
                    headers
                }
            )
                .catch(err => console.log("Notifications err", err))
        }).catch(err => console.log("Depost err", err))
    }
    res.send(response)
})

app.get("/profile", async (req, res) => {
    const sess = req.session;

    if (sess.email && sess.password) {
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        const data = sess.data
        res.render(path + "/profile", {
            page_name: "profile",
            data
            /* user: JSON.parse(sess.user),
             website: process.env["WEBSITE_URL"],
             notifications*/
        });
    } else {
        req.session["page"] = "profile"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }

});

app.get("/profile-setting", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
        const notifications = sess.notifications//await functions.getNotifications(JSON.parse(sess.user).id);
        const data = sess.data
        res.render(path + "/profile-setting", {
            page_name: "profile-setting",
            data
            /*user: JSON.parse(sess.user),
            website: process.env["WEBSITE_URL"],
            notifications*/
        });
    } else {
        req.session["page"] = "profile-setting"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }

});

//https://dev.to/cyberwolves/how-to-implement-password-reset-via-email-in-node-js-132m

app.get("/forgot-password", async (req, res) => {
    res.render(path + "/forgot-password", {
        page_name: "forgot-password",
    })
})

app.get("/password_reset", async (req, res) => {
    //console.log("req.query.user_id", req.query.user_id, "req.query.token", req.query.token );
    res.render(path + "/reset-password", {
        page_name: "reset-password",
        user_id: req.query.user_id,
        token: req.query.token
    })
})

app.post("/reset-password", async (req, res) => {
    let response = {
        success: false,
        msg: ""
    }
    const { user_id, token, password } = req.body
    // console.log({ user_id, token, password });
    await axios.post(`${server_base_url}/api/password_reset/${user_id}/${token}`, {
        password
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(resp => {
        response.success = true
        response.msg = resp.data.msg;
    }).catch(err => {
        console.log("error", err);
        response.msg = err.response && err.response.data
            ? err.response.data.msg : "An error occured. Please try again."
    })
    res.send(response)
})

app.post("/forgot-password", async (req, res) => {
    let response = {
        success: false,
        error: undefined
    };

    await axios.post(`${server_base_url}/api/password_reset`, {
        email: req.body["email"]
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(resp => {
        response = resp.data
    }).catch(err => {
        console.log("error", err);
        response.error = err.response && err.response.data ? err.response.data.msg : "We couln't authenticate you. Please try again."
    })
    res.send(response)
})

app.get("/notifications", async (req, res) => {

    const id = req.query.id;
    console.log("id", id);
    const sess = req.session;
    if (sess.email && sess.password) {
        const notifications = sess.data.user.notifications.data
        const data = sess.data

        if (id) {

            const notification = notifications ? notifications.find(n => n._id === id) : {}

            if (notification.status == "pending") {
                await axios.put(`${server_base_url}/api/notifications/${id}`, {
                    status: "read"
                }, {
                    headers: {
                        "Content-type": "application/json",
                    },
                }).then(resp => {
                    console.log("success", resp);
                }).catch(err => {
                    console.log("error", err);
                    response.msg = err.response && err.response.data
                        ? err.response.data.msg : "An error occured. Please try again."
                })
            }

            res.render(path + '/notification-details', {
                page_name: "notification-details",
                notification,
                data
            })
        } else {
            res.render(path + "/notifications", {
                page_name: "notifications",
                data
            })
        }
    } else {
        req.session["page"] = "notifications"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }
});

app.get("/notifications/:id", async (req, res) => {
    const sess = req.session;
    if (sess.email && sess.password) {
        const data = sess.data
        const notifications = sess.data.user.notifications.data
        //console.log({ notifications });
        let id = req.params.id;
        // console.log({id});
        const notification = notifications ? notifications.find(n => n._id === id) : {}
        res.render(path + '/notification-details', {
            page_name: "notification-details",
            notification,
            data
        })
    } else {
        req.session["page"] = "notification-details"
        res.render(path + "/auth-signin", {
            page_name: "auth-signin",
            error: req.query.auth ? "Invalid login credentials" : null,
            login_endpoint: user_board_url + "/auth",
            redirect_url: user_board_url + "/"
        });
    }
})

app.post("/cancel-investment", async (req, res) => {
    console.log("in cancel inv");
    if (req.session.data.user) {
        const { id } = req.body
        console.log({ id });
        let prev_inv = req.session.data.accounts && req.session.data.accounts.investments.length
            ? req.session.data.accounts.investments : [];
        let inv = prev_inv.find(i => i._id === id);
        console.log("prev_inv.length b4", prev_inv.length);
        inv["status"] = "cancelled";
        prev_inv = prev_inv.filter(i => i._id !== id)
        console.log("prev_inv.length after", prev_inv.length);

        const final = prev_inv.length ? [...prev_inv, inv] : [response.data] //here
        // console.log(JSON.stringify({final}));
        let headers = {
            "Content-type": "application/json",
            "x-auth-token": req.session.token
        }
        //console.log("prev_inv", prev_inv);
        await axios.put(server_base_url
            + "/api/accounts/" + req.session.data.accounts._id, {
            id: req.session.data.accounts._id,
            balance: req.session.data.accounts.balance + inv.amount + inv.profit.total,
            investments: final
        }, { headers })
            .catch(err => console.log("Update acc balance err", err))
    }
})

app.listen(port, function () {
    console.log("userdashboard server listening at ", port);
});
