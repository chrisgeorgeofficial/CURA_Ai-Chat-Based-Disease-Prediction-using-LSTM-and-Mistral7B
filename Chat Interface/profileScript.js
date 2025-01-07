document
  .getElementById("save-profile-btn")
  .addEventListener("click", saveProfile);

function saveProfile() {
  const name = document.getElementById("profile-name").value;
  const email = document.getElementById("profile-email").value;
  const password = document.getElementById("profile-password").value;

  // Save values locally
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
  if (password) {
    localStorage.setItem("userPassword", password); // Example: Not recommended for actual passwords
  }

  alert("Profile updated successfully!");
  goBack();
}

function goBack() {
  window.history.back();
}
