function login()
{
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let foundUser = users.find(user =>
        user.email === email && user.password === password
    );
    if(foundUser)
    {
        localStorage.setItem("pawpalLoggedIn", "true");
        alert("Login SuccessFull");
        window.location.href = "pages/home.html";
    }
    else{
        alert("Invalid Email or Password");
    }
    return false;
}
