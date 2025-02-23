document.addEventListener("DOMContentLoaded", function () {
    // Function to show the form and scroll to it
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

    const bankChurnBtn = document.getElementById("bankChurnBtn");
    const telecomChurnBtn = document.getElementById("telecomChurnBtn");

    if (bankChurnBtn) {
        bankChurnBtn.addEventListener("click", function () {
            showForm("form1");
        });
    }

    if (telecomChurnBtn) {
        telecomChurnBtn.addEventListener("click", function () {
            showForm("form2");
        });
    }

    const bankChurnLink = document.getElementById("bankChurnLink");
    if (bankChurnLink) {
        bankChurnLink.addEventListener("click", function (event) {
            event.preventDefault();
            showForm("form1");
        });
    }

    const telecomChurnLink = document.getElementById("telecomChurnLink");
    if (telecomChurnLink) {
        telecomChurnLink.addEventListener("click", function (event) {
            event.preventDefault();
            showForm("form2");
        });
    }

    function changeValue(inputId, step) {
        const input = document.getElementById(inputId);
        if (input) {
            const min = parseInt(input.getAttribute("min")) || -Infinity;
            const max = parseInt(input.getAttribute("max")) || Infinity;
            const currentValue = parseInt(input.value) || 0;
            const newValue = currentValue + step;
            if (newValue >= min && newValue <= max) {
                input.value = newValue;
            }
        }
    }

    function updateSliderValue() {
        const slider = document.getElementById("satisfactionScore");
        const display = document.getElementById("satisfactionValue");

        if (slider && display) {
            display.textContent = slider.value;
            slider.addEventListener("input", function () {
                display.textContent = slider.value;
            });
        }
    }

    updateSliderValue();

    // Validate Bank Customer Information Form (Form 1)
    async function validateForm1(event) {
        event.preventDefault();

        const form = document.getElementById("form1");
        const formData = new FormData(form);
        const formObject = {};

        // Convert FormData to an object
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        try {
            const response = await fetch('/api/bank-churn-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Tell the server the body is JSON
                },
                body: JSON.stringify(formObject) // Send the form data as a JSON object
            });

            if (response.ok) {
                const result = await response.json();
                alert("Prediction result: " + result.prediction);
                // You can also handle success response, like redirecting or displaying additional info
            } else {
                alert(`Error: ${response.statusText}. Unable to submit form. Please try again.`);
            }
        } catch (error) {
            console.error("Error with request:", error);
            alert("Error: Unable to submit form. Please check your network connection or try again later.");
        }
    }

    // Validate Telecom Customer Information Form (Form 2)
    async function validateForm2(event) {
        event.preventDefault();

        const form = document.getElementById("form2");
        const formData = new FormData(form);
        const formObject = {};

        // Convert FormData to an object
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        try {
            const response = await fetch('/api/telecom-churn-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Tell the server the body is JSON
                },
                body: JSON.stringify(formObject) // Send the form data as a JSON object
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

    const submitBtn1 = document.getElementById("submitBtn1");
    if (submitBtn1) {
        submitBtn1.addEventListener("click", validateForm1);
    }

    const submitBtn2 = document.getElementById("submitBtn2");
    if (submitBtn2) {
        submitBtn2.addEventListener("click", validateForm2);
    }
});
