var depositBtn = document.getElementById("btn-deposit");
var depositBtn1 = document.getElementById("btnDeposit1");
var depositBtn2 = document.getElementById("btnDeposit2");
var amount = document.getElementById("deposit-amount")
var password = document.getElementById("deposit-password")

const confirmDeposit = async () => {
  var deposit_amount = document.getElementById("deposit-amount")?.value;
var deposit_currency = document.getElementById("deposit-currency")?.value;
var user_id = document.getElementById("user-id")?.value;
var upline = document.getElementById("upline")?.value;
  console.log({deposit_amount});
    await fetch("/deposit", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            type: "deposit", 
            created_by: {id: user_id}, 
            upline, 
            //amount:
             deposit_amount: parseInt(deposit_amount),
           // currency:
             deposit_currency, 
            user_id, 
            upline
         }),
       
      }).then(res => {
        //console.log({res});
        return res.json();
      }).then(d => {
        console.log({d})
        window.location.href= "/"
      })
      .catch(err => console.log(err));
}

password.addEventListener("keyup", () => {
  if(password.value === document.getElementById("venom").value){
    depositBtn.removeAttribute("disabled")
  }
})

amount.addEventListener("keyup", () => {
  let val
  try {
    val = JSON.parse(amount.value)
    depositBtn2.style.display="none"
    depositBtn1.style.display="block"//removeAttribute("disabled")
  } catch (error) {
    console.log(error);
  }
   
  
})

depositBtn.addEventListener("click", confirmDeposit)