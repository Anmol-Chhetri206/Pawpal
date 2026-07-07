function forgot()
{
    let email = document.getElementById("email").value;
    let npassword = document.getElementById("npassword").value;
    let cpassword = document.getElementById("cpassword").value;
    if(email === "" || npassword === "" || cpassword === "")
    {
        alert("All fields are mandatory");
        return;
    }
    if(npassword !== cpassword)
    {
        alert("Passwords do not match");
        return;
    }
    let users = JSON.parse(localStorage.getItem("users"));
    let foundUser = users.find(user =>
        user.email === email
    );
    if(foundUser)
    {
        foundUser.password = npassword;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Password Changed Successfully");
        window.location.href = "../index.html";
    }
    else
    {
        alert("Email not found");
    }
}