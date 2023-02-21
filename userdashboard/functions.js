const axios = require("axios");
const moment = require("moment");
const investment_plans = require("./options").inv_plans

const can_log = false;
let admin_token = ""

const logMessage = (msg) => {
    can_log && console.log(msg)
}

const getTransactions = async (user_id) => {
    //console.log("get transactions");
    let transactions = []
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/transactions").then(res => {
        if (res.data.length) {
            if (user_id) {
                transactions = res.data.filter(d => d.created_by.id === user_id)

            } else {
                transactions = res.data
            }
        }

    }).catch((err) => console.log("Get transactions error", err))
    return transactions
}

const getAllTransactions = async (status) => {
    //console.log("get transactions");
    let transactions = []
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/transactions").then(async res => {
        if (res.data.length) {
            if (status === "others") {
                transactions = res.data.filter(d => d.status !== "pending")
            } else if (status === "pending" || status === "approved" ) {
                transactions = res.data.filter(d => d.status === status)
            }/* else if (status === "approved") {
                transactions = res.data.filter(d => d.status === status)
            }*/ else {
                transactions = res.data
            }

            await transactions.sort((a,b) => new Date(b.date_created) - new Date(a.date_created))
        }

    }).catch((err) => console.log("Get transactions error", err))
    return transactions
}

const getAccounts = async (user_id) => {
    //console.log("get accounts");
    let accounts = []
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/accounts").then(res => {
        logMessage("accounts", user_id);
        //
        if (res.data.length) {
            logMessage(res.data);
            accounts = user_id ? res.data.filter(d => d.created_by.id === user_id && d.status === "active"
            ) : res.data.filter(d => d.status === "active")
        }
    }).catch((err) => console.log("Get accounts error", err))
    //console.log("accounts.length", accounts.length);
    return accounts
    /*
        BTC: [investments]
        USDT: [investments] 
    */
}

// const getAccountsBalance = (accounts) => {
//    let accArr = [];
//    let currencies = accounts ? accounts.map(a => a.currency) : []
//    currencies = [...new Set(currencies)];

//     for (let i = 0; i < currencies.length; i++) {
//         let currency = currencies[i]
//         let item = {};
//         item["currency"] = currency;
//         item["accounts"] = accounts.filter(a => a.currency === currency)
//         let currency_acc_balances = item.accounts.filter(a => a.balance).map(a => a.balance);
//         let currency_acc_bal = currency_acc_balances.reduce((a,b) => a + b, 0);
//         item["balance"] = currency_acc_bal
//         accArr.push(item)
//     }
//     return accArr
// }

const filterInvestmentByMonth = (data) => {
    //Get the currentYear and the currentMonth
    let current_month = new Date().getMonth() + 1;
    let current_year = new Date().getFullYear();

    //Get the year and month from the iterated date
    //var [year, month] = e.date.split('-');

    //Then filter the dates
    let final = data.filter(e => {
        var [year, month] = e.date_created ? e.date_created.split('-') : e.start_date.split('-'); // Or, var month = e.date.split('-')[1];
        //console.log({ current_month, current_year, year, month });

        return (current_month === parseInt(month)) && (current_year == parseInt(year));
    });
    //console.log("data", data);
    //console.log("final", final);

    return final
}

const getTotalInvestment = async (transactions, accounts) => {
    //console.log("transactions", transactions);
    // accounts[0] && console.log("accounts[0].investments", accounts[0].investments);

    let total = 0,
        investment_profit = 0,
        referral_bonus = 0,
        investments = [],
        this_month = { investments: [], profit: 0, referrals: [] },
        active_investments = [];
    pending_profits = {};
    if (transactions.length && accounts.length) {
        investments = accounts[0].investments.filter(i => i.status === "active") //transactions.filter(t => t.type === "investment");
        let referrals = transactions.filter(t => t.type === "referral_bonus")
        //console.log("referrals", referrals);
        total = investments.length === 1 ? investments[0].amount : investments.length > 1 ? investments.reduce((a, b) => parseInt(a/*.amount*/) + parseInt(b.amount), 0) : 0;
        //console.log(JSON.stringify(accounts[0].investments));
        investment_profit = accounts[0].investments.length === 1 ?
            accounts[0].investments[0].profit.total : accounts[0].investments.length > 1 ?
                accounts[0].investments.reduce((a, b) => a + (b.profit ? b.profit.total : 0), 0) : 0;
        console.log("investment_profit", investment_profit);
        referral_bonus = referrals.length === 1
            ? referrals[0].amount : referrals.length > 1
                ? referrals.reduce((a, b) => a + b.amount, 0) : 0;

        //console.log({referral_bonus});
        this_month = {
            investments: accounts[0] && accounts[0].investments ? filterInvestmentByMonth(/*investments*/  accounts[0].investments) : [],
            referrals: referrals.length ? filterInvestmentByMonth(referrals) : []
        }

        this_month["investment_profit"] = this_month.investments.length === 1
            ? this_month.investments[0].profit.total : this_month.investments.length > 1
                ? this_month.investments.reduce((a, b) => a/*.amount profit*/ + (b.profit ? b.profit.total : 0), 0) : 0

        this_month["referral_bonus"] = this_month.referrals.length === 1
            ? this_month.referrals[0].amount/*profit*/ : this_month.referrals.length > 1
                ? this_month.referrals.reduce((a, b) => a + b.amount, 0) : 0;

        this_month["profit"] = this_month.investment_profit /*( 
            this_month.investments.length === 1 
            ? this_month.investments[0].profit.total : this_month.investments.length > 1
            ? this_month.investments.reduce((a,b) => a + (b.profit.total || 0), 0) : 0 )
        */
            + this_month.referral_bonus /*( 
            this_month.referrals.length === 1
            ? this_month.referrals[0].amount : this_month.referrals.length > 1
            ? this_month.referrals.reduce((a,b) => a + b.amount, 0): 0);*/
    }

    return { total, investment_profit, investments, this_month, referral_bonus };
}

const getTotalProfits = ({ investments }) => {
    return investments.length === 1 ? investments[0].profit : investments.length > 1 ? investments.reduce((a, b) => a + (b.profit || 0), 0) : 0
    //investments ? investments.reduce((a,b) => a.profit + b.profit, 0):0;
}

const getActiveInvestments = ({ investments }) => {
    let final = [], total = 0, total_profits = 0;
    final = investments.filter(i => i.status === "active");
    // console.log({final});
    total = final.reduce((a, b) => a + b.amount, 0);
    total_profits = final.reduce((a, b) => a + (b.profit ? b.profit.total : 0), 0);

    return {
        data: final,
        total,
        profit: total_profits
    }
}

const addReferralBenefits = async (upline, amount) => {
    let percentage = referral_bonus;
    let benefit = amount * percentage;

    await axios.put(process.env["SERVER_BASE_URL"] + "/api/accounts", {
        id: upline.id,
        balance: upline.balance + benefit
    }).then(res => {
        logMessage(res);
    }).catch(err => console.log(err))
}

const requestDepositConfirmation = () => {

}

const getDownlines = async (ref_code) => {
    let users = []
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/users?upline=" + ref_code).then(res => {

        users = res.data;
    }).catch((err) => console.log("Get downlines error", err))
    return users
}

const getRefProfits = (transactions) => {
    let referrals = transactions.filter(t => t.type === "ref_profit");
    let total = referrals ? referrals.reduce((a, b) => a.amount + b.amount, 0) : 0;
    return {
        referrals, total
    }
}

const getNotifications = async (user_id) => {
    let notifications = { data: [], unread_count: 0 }
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/notifications?user=" + user_id).then(res => {
        if (res.data.length) {
            notifications["unread_count"] = res.data.filter(n => n.status === "pending").length
            notifications["data"] = res.data//.filter(n => n.status === "pending")
            notifications.data.map(n => n.time_diff = timeDiff(n.date_created))
        }

    }).catch((err) => console.log("Get notifications error", err))
    return notifications
}

const timeDiff = (date, return_type) => {
    let time_diff = null;
    let day_diff = moment(new Date().toISOString()).diff(moment(date), 'days');
    let hour_diff = moment(new Date().toISOString()).diff(moment(date), 'hours');
    let minute_diff = moment(new Date().toISOString()).diff(moment(date), 'minutes');
    time_diff = day_diff > 0 ? day_diff.toString() + " days ago" : hour_diff > 0 ? hour_diff.toString() + " hours ago" : minute_diff.toString() + " minutes ago";
    //console.log({time_diff, day_diff, hour_diff, minute_diff});
    return return_type ? { time_diff, day_diff, hour_diff, minute_diff } : time_diff
}

const getUplineDetails = async (code) => {
    let upline_details;
    await axios.get(
        `${process.env["SERVER_BASE_URL"]}/api/users?code=${code}`,
        // {headers}
    ).then(async res => {
        upline_details = res.data.length && res.data[0] || {}
        //console.log("res.data", res.data);
        if (res.data.length) {
            upline_details["accounts"] = await getAccounts(upline_details._id)

        }
    })
        .catch(err => console.log("get upline_details err", err));

    return upline_details;
}

const getAllActiveInvestments = async () => {
    const transactions = await getTransactions();
    return transactions.filter(t => t.type === "investment" && t.status === "active");
}

const generateToken = async (base_url, email, password) => {
    console.log({ base_url, email, password });
    let token = "";
    await axios.post(`${base_url}/api/auth`, {
        email, password,
    }, {
        headers: {
            "Content-type": "application/json",
        },
    }).then(res => {
        token = res.data.token;
        admin_token = token
    })
        .catch(err => console.log("generate token error", err));
    return token;
}

const depositROIs = async () => {
    let accounts = await getAccounts();

    for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];
        // console.log("account.investments b4", account.investments);

        let is_account_updated = false;

        for (let j = 0; j < account.investments.length; j++) {
            let investment = account.investments[j];
            // console.log({investment});
            if (investment && investment.status === "active") {
                let time_diff = timeDiff(investment.last_updated || investment.start_date);
                let roi_interval = investment.plan_id === "starter" ? 24 : investment.plan_id === "super" ? 48 : 72;
                let t = //0 
                    roi_interval - time_diff.hour_diff;
                let roi_percent = investment.plan_id === "starter" ? 0.1 : investment.plan_id === "super" ? 0.2 : 0.3;

                //add timer that will be cleared after profit is added
                if (t <= 0) {
                    let profit = {
                        date_created: new Date().toISOString(),
                        amount: investment.amount * roi_percent,
                        status: "pending"
                    }

                    let investment_profits = investment.profit && investment.profit.rois ? investment.profit.rois : []
                    investment_profits.push(profit);
                    investment["profit"] = {
                        total: (investment.profit ? investment.profit.total : 0) + (investment.amount * roi_percent),
                        rois: investment_profits
                    };
                    investment["last_updated"] = new Date().toISOString();
                    is_account_updated = true;
                }
            }
        }

        if (is_account_updated) {
            await axios.put(process.env["SERVER_BASE_URL"] + "/api/accounts/" + account._id, {
                id: account._id,
                investments: account.investments
            }, {
                "Content-type": "application/json",
                "x-auth-token": admin_token
            }).then(() => {
                //create transaction for ROI
                //create notification for ROI
                // let post_transactions_data = {
                //     type: "roi",
                //     created_by: account.created_by ,
                //     //upline: upline_details.upline,
                //     amount: investment.amount * roi_percent,
                //     currency: account.currency
                // }
                /*axios.post(
                    `${process.env["SERVER_BASE_URL"]}/api/transactions`, 
                    post_transactions_data,
                    {
                        "Content-type": "application/json",
                        "x-auth-token": admin_token
                    
                    }
                ).then(async resp => {
                    response.success = true;
                    response.data = resp.data
                    await axios.post(
                        `${process.env["SERVER_BASE_URL"]}/api/notifications`, 
                        {
                            user: account.created_by,
                            title: `ROI profit deposited.`,
                            description: `You have received ${} ROI on your ${} investment.`
                        },
                        {
                            headers
                        }
                    )//.then(respnse => ))
                    .catch(err => console.log("Notifications err", err))
                }).catch(err=> console.log("Depost err", err))*/
                console.log("added roi for " + account._id/*, JSON.stringify(account)*/)
            })
                .catch(err => console.log("Update acc balance err", err))
        } else {
            console.log("No investment to credit for", account._id);
        }
    }
}

const dollarToBTC = (dollar_amt, current_btc_price) => {
    return dollar_amt / current_btc_price
}

const calcTotalTransByType = (transactions, type) => {
    let filter = transactions.filter(t => t.type === type)
    return filter.length === 1 ? filter[0].amount : filter.length > 1 ? filter.reduce((a, b) => a + (b.amount || 0), 0) : 0
}

const updateSessionData = (prev, item) => {
    let updated_data = {};

    return updated_data
}

const getUsers = async () => {
    let users = []
    await axios.get(process.env["SERVER_BASE_URL"] + "/api/users").then(res => {
        users = res.data
    }).catch((err) => console.log("Get users error", err))
    return users
}

module.exports = {
    can_log,
    logMessage,
    getTransactions,
    getAccounts,
    getTotalInvestment,
    getTotalProfits,
    getActiveInvestments,
    //getAccountsBalance,
    addReferralBenefits,
    getDownlines,
    getRefProfits,
    getNotifications,
    timeDiff,
    getUplineDetails,
    depositROIs,
    generateToken,
    dollarToBTC,
    getAllTransactions,
    calcTotalTransByType,
    updateSessionData,
    getUsers
}