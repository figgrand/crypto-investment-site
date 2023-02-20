var loginFields = { "login-email": null, 'login-password': null }
var signInBtn = document.getElementsByName("signin")[0];

//console.log({redirect_url});
function getVal(field) {
  return document.getElementsByName(field)[0].value;
}

function toggleSignInBtn() {
  document.getElementById("server-err").style.display = "none";
  document.getElementById("server-err").innerHTML = ""
  console.log("hiya");
  let err = ""
  if (!getVal("login-email") || !getVal("login-password")) {
    signInBtn.setAttribute("disabled", true);
    // if(!getVal("login-email")){
    //   err = "Please enter your email"
    // }
    // if(!getVal("login-password")){
    //   err = "Please enter your password"
    // }
    document.getElementsByClassName("client-err")[0].style.display = "block";
  }
  if (getVal("login-email") && getVal("login-password").length > 1) {
    // err = ""
    signInBtn.removeAttribute("disabled");
    document.getElementsByClassName("client-err")[0].style.display = "none";

  }
  document.getElementById("client-err-p").innerHTML = err
}

//for (let field in loginFields) {
//    document.getElementsByName(field)[0].addEventListener("change", toggleSignInBtn);
//}

const getToken = async () => {
  signInBtn.setAttribute("disabled", true);
  signInBtn.textContent = "Please wait...";
  let email = getVal("login-email");
  let password = getVal("login-password")
  let data = { email, password }

  await fetch("/auth", {
    method: "POST",
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),

  }).then(res => {
    console.log({ res });
    return res.json();
  }).then(d => {
    //console.log({ d })
    if (/*d.success*/d.token) {
      //window.localStorage.setItem("access_token", d.token);
      window.location.href = d.redirect;
      //window.localStorage.setItem("user", d.user);
    } else {
      document.getElementById("server-err").style.display = "block";
      document.getElementById("server-err").innerHTML = d.error
    }

  })
    .catch(err => {
      //signInBtn.removeAttribute("disabled");
      console.log(err)
    })
  signInBtn.removeAttribute("disabled");
  signInBtn.textContent = "Signin";
}

document.getElementById("email").addEventListener("change", toggleSignInBtn)
document.getElementById("email").addEventListener("keyup", toggleSignInBtn)
document.getElementById("password").addEventListener("change", toggleSignInBtn)
document.getElementById("password").addEventListener("keyup", toggleSignInBtn)
document.getElementById("btnLogin").addEventListener("click", getToken) 
