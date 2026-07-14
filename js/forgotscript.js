function forgot(event) {
  event?.preventDefault();

  const email = document.getElementById('email').value.trim();
  const newPassword = document.getElementById('npassword').value;
  const confirmPassword = document.getElementById('cpassword').value;

  if (email === '' || newPassword === '' || confirmPassword === '') {
    alert('All fields are mandatory');
    return false;
  }

  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return false;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const foundUser = users.find(user =>
    String(user.email).toLowerCase() === email.toLowerCase()
  );

  if (!foundUser) {
    alert('Email not found');
    return false;
  }

  foundUser.password = newPassword;
  localStorage.setItem('users', JSON.stringify(users));
  alert('Password changed successfully');
  window.location.href = '../index.html';
  return true;
}
