document.addEventListener("DOMContentLoaded", function () {
    // =======================
    // SCROLL ANIMATION EFFECT
    // =======================
    window.addEventListener("scroll", function () {
        let elements = document.querySelectorAll("#services, #contact");
        elements.forEach((el) => {
            let position = el.getBoundingClientRect().top;
            let screenPosition = window.innerHeight / 1.3;
            if (position < screenPosition) {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }
        });
    });

    // =======================
    // FORM VALIDATION
    // =======================
    const form = document.getElementById("quoteForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");
    const successModal = document.getElementById("successModal");
    const closeModal = document.querySelector(".close");

    if (!form) {
        console.error("Error: Form not found. Check if #quoteForm exists in your HTML.");
        return;
    }

    // Helper function to validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Helper function to validate phone number
    function isValidPhone(phone) {
        return /^\d{7,15}$/.test(phone);
    }

    // Function to show validation feedback
    function validateInput(input, isValid) {
        if (isValid) {
            input.classList.add("valid");
            input.classList.remove("invalid");
        } else {
            input.classList.add("invalid");
            input.classList.remove("valid");
        }
    }

    // Real-time input validation
    nameInput.addEventListener("input", () => validateInput(nameInput, nameInput.value.trim().length > 2));
    emailInput.addEventListener("input", () => validateInput(emailInput, isValidEmail(emailInput.value)));
    phoneInput.addEventListener("input", () => validateInput(phoneInput, isValidPhone(phoneInput.value)));
    messageInput.addEventListener("input", () => validateInput(messageInput, messageInput.value.trim().length > 10));

    // =======================
    // FORM SUBMISSION & API REQUEST
    // =======================
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            message: messageInput.value.trim(),
        };

        console.log("Submitting Form Data:", formData); // Debugging

        fetch("http://localhost:5000/api/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    console.log("Success:", data);
                    successModal.style.display = "block"; // Show success modal
                    form.reset(); // Reset form after submission
                }
            })
            .catch((error) => {
                console.error("Error submitting form:", error);
                alert("An error occurred while submitting. Please try again.");
            });
    });

    // =======================
    // MODAL HANDLING
    // =======================
    if (closeModal) {
        closeModal.addEventListener("click", function () {
            successModal.style.display = "none";
        });
    }

    window.addEventListener("click", function (event) {
        if (event.target === successModal) {
            successModal.style.display = "none";
        }
    });
});
