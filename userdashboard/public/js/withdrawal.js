var withdrawalBtn = document.getElementById("btn-withdraw");
var amount = document.getElementById("withdraw-amount");
var wallet = document.getElementById("btc-wallet");
const confirmWithdrawal = async () => {
    var amount = document.getElementById("withdraw-amount")?.value;
    var btc_wallet = document.getElementById("btc-wallet")?.value;
    var currency = document.getElementById("currency")?.value;
    var user_id = document.getElementById("user-id")?.value;
    var plan_id = document.getElementById("plan-id")?.value;
    /*console.log({
        btc_wallet, currency, user_id, plan_id, amount
    });*/
    //console.log("here");
    await fetch("/withdraw", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: "withdrawal",
            created_by: { id: user_id },
            status: "pending",
            plan_id,
            amount: parseInt(amount),
            currency,
            user_id,
            btc_wallet
        }),

    }).then(res => {
        // console.log({res});
        return res.json();
    }).then(d => {
        // console.log({d})
    })
        .catch(err => console.log(err));
}

const togglebtn = () => {
    try {
        let amount_val = JSON.parse(amount.value)
        if (amount_val && wallet.value) {
            withdrawalBtn.removeAttribute('disabled')
        }
    } catch (error) {

    }

}

amount.addEventListener("keyup", togglebtn)
wallet.addEventListener("keyup", togglebtn)
withdrawalBtn.addEventListener("click", confirmWithdrawal)