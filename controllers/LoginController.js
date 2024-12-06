$(document).ready(function () {
    $("#toSignupForm").click(function () {
        $("#loginForm").hide();
        $("#signupForm").fadeIn();
    });

    $("#toLoginForm").click(function () {
        $("#signupForm").hide();
        $("#loginForm").fadeIn();
    });
});

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

document.getElementById("btnSignup").addEventListener("click", () => {
    const signupEmail = document.getElementById("signupEmail").value;
    const signupPassword = document.getElementById("signupPassword").value;
    const role = document.getElementById("role").value.toUpperCase();
  
    if (!signupEmail || !signupPassword) {
      alert("Please fill in all fields.");
      return;
    }
  
    const data = {
      email: signupEmail,
      password: signupPassword,
      userRole: role,
      status: true,
    };
  
    $.ajax({
      url: "http://localhost:8080/api/v1/auth/signup",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: (response) => {
        console.log("User added successfully:", response);
        alert("Signup successful! Please log in.");
  
        $("#signupForm").hide();
        $("#loginForm").fadeIn();
      },
      error: (error) => {
        console.error("Error adding user:", error);
        alert(
          error.responseJSON?.message || "Failed to sign up. Please try again."
        );
      },
    });
});


  document.getElementById("btnLogin").addEventListener("click", () => {
    const loginEmail = document.getElementById("email").value;
    const loginPassword = document.getElementById("password").value;
  
    if (!loginEmail || !loginPassword) {
      alert("Please enter both email and password.");
      return;
    }
  
    const data = {
      email: loginEmail,
      password: loginPassword,
    };
  
    $.ajax({
      url: "http://localhost:8080/api/v1/auth/signin",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: (response) => {
        console.log("User logged in successfully:", response);
        if (response && response.token) {
          localStorage.setItem("token", response.token);
          console.log(localStorage.getItem("token"))
          window.location.href = "dashboard.html";
        } else {
          alert("Invalid email or password. Please try again.");
        }
      },
      error: (error) => {
        console.error("Error logging in:", error);
        alert(
          error.responseJSON?.message || "Failed to log in. Please try again."
        );
      },
    });
  });
