function register()
{
	var fname=document.getElementById('fname').value;
	var lname=document.getElementById('lname').value;
	var contact=document.getElementById('contact').value;
	var email = document.getElementById('email').value;
	var pw=document.getElementById('pw').value;
	var cpw=document.getElementById('cpw').value;

	if(fname== "" || lname == "" || contact == "" || email =="" || pw == "" || cpw == "")
	{
	alert("All Fields are Mandatory...");
	return false;
	}
	else if(pw!=cpw)
	{
		alert("Incorrect Password");
		return false;
	}
	let user =
	{
		fname: fname,
		lname: lname,
		contact: contact,
		email: email,
		password: pw
	};
	let users = JSON.parse(localStorage.getItem("users")) || [];
	users.push(user);
	localStorage.setItem("users", JSON.stringify(users));
	alert("Registration Successful");
	window.location.href = "../index.html";
	return false;
}