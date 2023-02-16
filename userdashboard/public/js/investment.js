var investmentBtn = document.getElementById("btn-invest");
var acc_bal = JSON.parse(document.getElementById("balance").value);
var input = document.getElementById('inv-amount');
var min = JSON.parse(document.getElementById("min_deposit").value.split("$")[1])
var max = JSON.parse(document.getElementById("max_deposit").value.split("$")[1])

const confirmInvestment = async () => {
  var amount = document.getElementById("inv-amount")?.value;
var currency = document.getElementById("currency")?.value;
var user_id = document.getElementById("user-id")?.value;
var plan_id = document.getElementById("plan-id")?.value;
    console.log({
        amount, currency, user_id, plan_id
    });
    console.log("here");
    await fetch("/invest", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            type: "investment", 
            created_by: {id: user_id}, 
            status: "active",
            plan_id,
            amount: parseInt(amount),
            currency, 
            user_id, 
         }),
       
      }).then(res => {
        console.log({res});
        return res.json();
      }).then(d => {
        console.log({d})
      })
      .catch(err => console.log(err));
}

input.addEventListener('keyup', () => {
  let err
  let value
  console.log("hello");
  try {
    value = JSON.parse(input.value)
    /*if(value > acc_bal && (min > value < max)){
      err = "Insufficient account balance"
    } 
    
    if ( value > acc_bal && value < min){
      err = "Minimum investment amount is " + min + " BTC"
    } 
    if (value > max){
      err = "Maximum investment amount is " + max + " BTC"
    } */

    if (value > acc_bal ){
      if (value > max) {
        err = "Maximum investment amount is " + max + " BTC"
      } else {
        err = "Insufficient account balance"
      }
    } else {
      if (value < min) {
        err = "Minimum investment amount is " + min + " BTC"
      } else if (value > max) {
        err = "Maximum investment amount is " + max + " BTC"
      } else if (value === acc_bal){
        if (value < min) {
          err = "Minimum investment amount is " + min + " BTC"
        } else {
          err = "Maximum investment amount is " + max + " BTC"
        }
      } else {
        err = ""
        investmentBtn.removeAttribute("disabled")
      }
    }

  } catch (err){
    err = "Enter numbers only"
    
    console.log(err);
  }
  console.log({value, min,max, acc_bal});
  document.getElementById("input-err").innerHTML = err
 // if(JSON.parse(input.value))
})

investmentBtn.addEventListener("click", confirmInvestment)