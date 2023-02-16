var loginFields = {"login-email": null, 'login-password': null}
var signInBtn = document.getElementsByName("signin")[0];

function getVal(field) {
    return document.getElementsByName(field)[0].value;
}

function toggleSignInBtn() {
    console.log("hiya");
  if (!getVal("login-email") || !getVal("login-password") ){
    signInBtn.setAttribute("disabled", true);
    document.getElementsByClassName("client-err")[0].style.display = "block";
  } else {
    signInBtn.removeAttribute("disabled");
    document.getElementsByClassName("client-err")[0].style.display = "none";

  }
}

for (let field in loginFields) {
    document.getElementsByName(field)[0].addEventListener("change", toggleSignInBtn);
}

console.log({redirect_url});

const getToken = async () => {
  let email = getVal("login-email");
  let password = getVal("login-password")
  let data = {email, password}

  let formdata = new FormData();
console.log({data});
  await fetch("/auth", {
    method: "POST",
    headers: {'Accept': 'application/json','Content-Type': 'application/json'}, 
    body: JSON.stringify({ "login-email": email, "login-password": password}),
   
  }).then(res => {
    return res.json();
    //console.log("Request complete! response:", res.json());
  }).then(d => {
   // console.log(JSON.stringify(d))
   
    //window.location.href = "http://localhost:3001/authorize" + "?t=" + d.token  ;
    //console.log("d.token", d.token);
    window.localStorage.setItem("access_token", d.token)
  })
  .catch(err => console.log(err));

 // ;
}

document.getElementById("btnLogin").addEventListener("click", getToken)
