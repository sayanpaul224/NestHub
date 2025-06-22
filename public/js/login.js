document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("dataForm");
    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const sendOtpButton = document.querySelector("button.btn-primary.btn-sm");
    const otpInputs = document.querySelectorAll("input[pattern='[0-9]']");
    const submitButton = document.getElementById("submitBtn");
    const buttonText = submitButton.querySelector(".button-text");
    const spinner = submitButton.querySelector(".spinner-border");

    // Utility: Get OTP from the 4 inputs
    function getOtpValue() {
        return Array.from(otpInputs).map(input => input.value.trim()).join("");
    }

    // Utility: Enable/disable spinner on submit button
    function toggleLoading(isLoading) {
        if (isLoading) {
            buttonText.classList.add("d-none");
            spinner.classList.remove("d-none");
            submitButton.disabled = true;
        } else {
            buttonText.classList.remove("d-none");
            spinner.classList.add("d-none");
            submitButton.disabled = false;
        }
    }

    // Handle OTP Send
    sendOtpButton.addEventListener("click", function () {
        const email = emailInput.value.trim();
        if (!email) {
            alert("Please enter your email.");
            return;
        }

        fetch("https://nesthub-e20x.onrender.com/api/v1/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        })
        .then(res => res.json())
        .then(data => {
            console.log("OTP send response:", data);
            
            if (data.success) {
                alert("OTP sent to your email.");
            } else {
                alert("Failed to send OTP. Try again.");
            }
        })
        .catch(error => {
            console.error("OTP send error:", error);
            alert("Something went wrong while sending OTP.");
        });
    });

    // Handle Form Submit
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const otp = getOtpValue();

        if (!name || !email || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
            alert("Please fill out all fields correctly.");
            
            return;
        }

        toggleLoading(true);

        fetch("https://nesthub-e20x.onrender.com/api/v1/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, otp }),
        })
        .then(res => res.json())
        .then(data => {
            toggleLoading(false);
            if (data.success === true) {
                localStorage.setItem("login", "true");
                localStorage.setItem("email", email);
                localStorage.setItem("id", data.user.id);
                localStorage.setItem("name", data.user.name);
                window.location.href = "index.html";
            } else {
                alert("Invalid OTP or login failed.");
            }
        })
        .catch(error => {
            toggleLoading(false);
            console.error("Login error:", error);
            alert("Something went wrong during login.");
        });
    });

    // Auto-focus next OTP input
    otpInputs.forEach((input, idx) => {
        input.addEventListener("input", () => {
            if (input.value && idx < otpInputs.length - 1) {
                otpInputs[idx + 1].focus();
            }
        });
    });
});
