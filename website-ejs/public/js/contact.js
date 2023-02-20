const submitBtn = document.getElementById("btnContact")

// submitBtn.addEventListener("click", ()=>{
// })

const sendMail = async () => {
    var username = document.getElementById("username")?.value;
    
    var email = document.getElementById("email")?.value;
    var name = document.getElementById("name")?.value;
    var message = document.getElementById("message")?.value;
  
    console.log({
        username,
      name, email, message
    });
    console.log("here");
    await fetch("/contact-us", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        message
      }),
  
    }).then(res => {
      console.log({ res });
      return res.json();
    }).then(d => {
      console.log({ d })
    document.getElementById("contact-response").style.display = "block"

      //window.location.href = "/plans"
    })
      .catch(err => console.log(err));
}

submitBtn.addEventListener("click", sendMail)