
var cancelBtn = document.getElementById("btnCancel")


const cancelInvestment = async() => {
  console.log("holla 2");
  let planId = document.getElementById("planID").value;
  console.log({planId});
  await fetch("/cancel-investment", {
    method: "POST",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
        id: planId
     }),
   
  }).then(res => {
    console.log({res});
    return res.json();
  }).then(d => {
    console.log({d})
  })
  .catch(err => console.log(err));

}

cancelBtn.addEventListener('click', cancelInvestment)