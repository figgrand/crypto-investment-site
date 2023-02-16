var resetBtn = document.getElementById("btnReset")

function getVal(field) {
    console.log("get field");
    return document.getElementsByName(field)[0].value;
}

function toggleResetBtn() {
    console.log("toggle reset btn", getVal("email"));
  if (!getVal("email") || !getVal("email").includes("@") || !getVal("email").includes(".")){
    resetBtn.setAttribute("disabled", true);
    document.getElementsByClassName("client-err")[0].style.display = "block";
  } else {
    resetBtn.removeAttribute("disabled");
    document.getElementsByClassName("client-err")[0].style.display = "none";
  }
}

document.getElementById("email").addEventListener("change", toggleResetBtn);

const sendMail = async () => {
  console.log("sendmail");
  resetBtn.setAttribute("disabled", true);
  resetBtn.textContent = "Please wait...";
  let email = getVal("email");
  let data = {email}

  await fetch("/forgot-password", {
    method: "POST",
    headers: {'Accept': 'application/json','Content-Type': 'application/json'}, 
    body: JSON.stringify({  email }),
   
  }).then(res => {
    console.log({res});
    return res.json();
  }).then(d => {
    console.log({d})
    if (d.success){
        document.getElementById("server-success").style.display = "block";
        document.getElementById("server-success").innerHTML = d.msg
    } else {
      document.getElementById("server-err").style.display = "block";
      document.getElementById("server-err").innerHTML = d.error
    }
  })
  .catch(err => console.log(err));
  resetBtn.setAttribute("disabled", false);
  resetBtn.textContent = "Reset Password";
}

resetBtn.addEventListener("click", sendMail) 