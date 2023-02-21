var changeBtn = document.getElementById("btnChangePassword")

function getVal(field) {
    console.log("get field");
    return document.getElementsByName(field)[0].value;
}

function toggleChangeBtn() {
    console.log("toggle change btn", getVal("password"));
  if (!getVal("password")){
    changeBtn.setAttribute("disabled", true);
    document.getElementsByClassName("client-err")[0].style.display = "block";
  } else {
    changeBtn.removeAttribute("disabled");
    document.getElementsByClassName("client-err")[0].style.display = "none";
  }
}

document.getElementById("password").addEventListener("change", toggleChangeBtn);
document.getElementById("password").addEventListener("keyup", toggleChangeBtn);
const changePassword = async () => {
  //console.log("changePassword");
  changeBtn.setAttribute("disabled", true);
  changeBtn.textContent = "Please wait...";
  let password = getVal("password");
  let user_id = getVal("user_id");
  let token = getVal("token");
  let data = {password}

  await fetch("/reset-password", {
    method: "POST",
    headers: {'Accept': 'application/json','Content-Type': 'application/json'}, 
    body: JSON.stringify({  password, user_id, token }),
   
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
  changeBtn.setAttribute("disabled", false);
  changeBtn.textContent = "Change Password";
}

changeBtn.addEventListener("click", changePassword) 