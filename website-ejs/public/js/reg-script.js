console.log("hello babe");
var submitBtn = document.getElementsByName("signup")[0];
var fields = {
    firstname: null,
    lastname: null,
    username: null,
    email: null,
    password: null,
    cpassword: null,
    consent: null
}

function getVal(field) {
    return document.getElementsByName(field)[0].value;
}

function getFieldsObj(fields) {
    for (let field in fields) {
        fields[field] = getVal(field)
    }
    return fields
}

function toggleSubmitRegBtn() {
    let isBtnEnabled = submitBtn.attributes.disabled;
    let updatedFieldsObj = getFieldsObj(fields);
    let allFieldsFilled = !Object.values(updatedFieldsObj).includes("");

    console.log("updatedFieldsObj.password", updatedFieldsObj);
    let arePasswordsEqual = updatedFieldsObj.password === updatedFieldsObj.cpassword

    if (allFieldsFilled && arePasswordsEqual) {
        submitBtn.removeAttribute("disabled");
    } else {

        let unfilledFields = []
        for (let field in updatedFieldsObj) {

            if (!updatedFieldsObj[field]) {
                unfilledFields.push(field)
                //   document.getElementsByName(`${field}-e`)[0].textContent = field + " is required.";
            } else {
                unfilledFields.pop(field)
                document.getElementsByName(`${field}-e`)[0].textContent = ""
            }

        }
        //console.log(unfilledFields);

        if (unfilledFields.length) {
            document.getElementsByName(`${unfilledFields[0]}-e`)[0].textContent = unfilledFields[0] + " is required.";

        }
        //console.log({arePasswordsEqual});
        submitBtn.setAttribute("disabled", true);
    }

    if (!arePasswordsEqual) {
        document.getElementsByName("cpassword-e")[0].textContent = "Passwords do not match!";
    } else {
        document.getElementsByName("cpassword-e")[0].textContent = ""
    }
}

for (let field in fields) {
    //console.log("hello");
    document.getElementsByName(field)[0].addEventListener("keyup", toggleSubmitRegBtn);
}

