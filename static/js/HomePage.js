document.addEventListener("DOMContentLoaded", function () {
    // Function to display validation messages
    function showValidationMessage(inputElement, message, isError = true) {
        // Remove any existing validation message
        const existingMessage = inputElement.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create and insert new validation message
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${isError ? 'text-red-500' : 'text-green-500'} text-sm mt-1`;
        messageDiv.textContent = message;
        inputElement.parentElement.appendChild(messageDiv);
    }

    // Function to validate a single field
    function validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');

        if (required && !value) {
            showValidationMessage(input, 'This field is required');
            return false;
        }

        if (type === 'number' && value) {
            const numValue = Number(value);
            if (min && numValue < Number(min)) {
                showValidationMessage(input, `Value must be at least ${min}`);
                return false;
            }
            if (max && numValue > Number(max)) {
                showValidationMessage(input, `Value must be no more than ${max}`);
                return false;
            }
        }

        // Clear validation message if validation passes
        showValidationMessage(input, 'Valid', false);
        return true;
    }

    // Function to validate entire form
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form ${formId} not found`);
            return false;
        }

        let isValid = true;
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Enhanced form submission function with validation
    async function validateAndSubmitForm(formId, endpoint) {
        console.log(`Validating form ${formId}`);
        
        // Validate form before submission
        if (!validateForm(formId)) {
            console.log('Form validation failed');
            return;
        }

        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const formObject = {};
        
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formObject)
            });

            if (response.ok) {
                const result = await response.json();
                alert("Prediction result: " + result.prediction);
            } else {
                alert(`Error: ${response.statusText}. Unable to submit form. Please try again.`);
            }
        } catch (error) {
            console.error("Error with request:", error);
            alert("Error: Unable to submit form. Please check your network connection or try again later.");
        }
    }

    // Add real-time validation on input
    const forms = document.querySelectorAll('#form1, #form2');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => validateField(input));
        });
    });

    // Form submission handlers
    const form1 = document.getElementById("form1");
    const form2 = document.getElementById("form2");

    if (form1) {
        form1.addEventListener("submit", (event) => {
            event.preventDefault();
            validateAndSubmitForm("form1", '/api/bank-churn-prediction');
        });
    }

    if (form2) {
        form2.addEventListener("submit", (event) => {
            event.preventDefault();
            validateAndSubmitForm("form2", '/api/telecom-churn-prediction');
        });
    }

    // Submit button handlers
    const submitBtn1 = document.getElementById("submitBtn1");
    const submitBtn2 = document.getElementById("submitBtn2");

    if (submitBtn1) {
        submitBtn1.addEventListener("click", (event) => {
            event.preventDefault();
            validateAndSubmitForm("form1", '/api/bank-churn-prediction');
        });
    }

    if (submitBtn2) {
        submitBtn2.addEventListener("click", (event) => {
            event.preventDefault();
            validateAndSubmitForm("form2", '/api/telecom-churn-prediction');
        });
    }

    // Rest of your existing code for showing forms and handling other interactions
    function showForm(formId) {
        const form1 = document.getElementById("form1");
        const form2 = document.getElementById("form2");

        form1.style.display = "none";
        form2.style.display = "none";

        if (formId === "form1") {
            form1.style.display = "block";
            form1.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (formId === "form2") {
            form2.style.display = "block";
            form2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Initialize other button listeners
    const bankChurnBtn = document.getElementById("bankChurnBtn");
    const telecomChurnBtn = document.getElementById("telecomChurnBtn");
    const bankChurnLink = document.getElementById("bankChurnLink");
    const telecomChurnLink = document.getElementById("telecomChurnLink");

    if (bankChurnBtn) {
        bankChurnBtn.addEventListener("click", () => showForm("form1"));
    }

    if (telecomChurnBtn) {
        telecomChurnBtn.addEventListener("click", () => showForm("form2"));
    }

    if (bankChurnLink) {
        bankChurnLink.addEventListener("click", (event) => {
            event.preventDefault();
            showForm("form1");
        });
    }

    if (telecomChurnLink) {
        telecomChurnLink.addEventListener("click", (event) => {
            event.preventDefault();
            showForm("form2");
        });
    }
});