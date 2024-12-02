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