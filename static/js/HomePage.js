document.addEventListener("DOMContentLoaded", function () {
    // Original display message function
    function showValidationMessage(inputElement, message, isError = true) {
        const existingMessage = inputElement.parentElement.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${isError ? 'text-red-500' : 'text-green-500'} text-sm mt-1`;
        messageDiv.textContent = message;
        inputElement.parentElement.appendChild(messageDiv);
    }

    // Form field definitions for validation
    const BANK_FORM_FIELDS = {
        tenure: { type: 'number', required: true, min: 0 },
        monthly_charges: { type: 'number', required: true, min: 0 },
        total_charges: { type: 'number', required: true, min: 0 },
        paperless_billing: { type: 'boolean', required: true },
        senior_citizen: { type: 'boolean', required: true },
        streaming_tv: { type: 'boolean', required: true },
        streaming_movies: { type: 'boolean', required: true },
        multiple_lines: { type: 'boolean', required: true },
        phone_service: { type: 'boolean', required: true },
        device_protection: { type: 'boolean', required: true },
        online_backup: { type: 'boolean', required: true },
        partner: { type: 'boolean', required: true },
        dependents: { type: 'boolean', required: true },
        tech_support: { type: 'boolean', required: true },
        online_security: { type: 'boolean', required: true },
        gender: { type: 'select', required: true, options: ['Male', 'Female'] },
        contract: { type: 'select', required: true, options: ['Month-to-month', 'One year', 'Two year'] },
        internet_service: { type: 'select', required: true, options: ['Fiber optic', 'DSL', 'No'] },
        payment_method: { 
            type: 'select', 
            required: true, 
            options: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'] 
        }
    };

    const TELECOM_FORM_FIELDS = {
        credit_score: { type: 'number', required: true, min: 300, max: 850 },
        age: { type: 'number', required: true, min: 18, max: 120 },
        tenure: { type: 'number', required: true, min: 0 },
        balance: { type: 'number', required: true, min: 0 },
        num_of_products: { type: 'number', required: true, min: 1 },
        has_cr_card: { type: 'boolean', required: true },
        is_active_member: { type: 'boolean', required: true },
        estimated_salary: { type: 'number', required: true, min: 0 },
        satisfaction_score: { type: 'number', required: true, min: 1, max: 5 },
        point_earned: { type: 'number', required: true, min: 0 },
        geography: { type: 'select', required: true, options: ['France', 'Germany', 'Spain'] },
        gender: { type: 'select', required: true, options: ['Male', 'Female'] },
        card_type: { type: 'select', required: true, options: ['DIAMOND', 'GOLD', 'SILVER', 'PLATINUM'] }
    };

    // Function to validate a single field
    function validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        const min = input.getAttribute('min');
        const max = input.getAttribute('max');
        const pattern = input.getAttribute('pattern');

        if (required && !value) {
            showValidationMessage(input, 'This field is required');
            return false;
        }

        if (type === 'number' && value) {
            const numValue = Number(value);
            if (isNaN(numValue)) {
                showValidationMessage(input, 'Please enter a valid number');
                return false;
            }
            if (min && numValue < Number(min)) {
                showValidationMessage(input, `Value must be at least ${min}`);
                return false;
            }
            if (max && numValue > Number(max)) {
                showValidationMessage(input, `Value must be no more than ${max}`);
                return false;
            }
        }

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

    // The changeValue function for radio buttons and dropdowns
    window.changeValue = function(inputId, value) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = value;
            validateField(input);
        }
    };

    // Transform and validate form data before submission
    function prepareFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const formObject = {};
        const fields = formId === 'form1' ? BANK_FORM_FIELDS : TELECOM_FORM_FIELDS;
        
        for (const [key, value] of formData.entries()) {
            const fieldDef = fields[key];
            if (!fieldDef) {
                console.warn(`Unknown field: ${key}`);
                continue;
            }

            if (fieldDef.required && !value) {
                throw new Error(`${key} is required`);
            }

            switch (fieldDef.type) {
                case 'number':
                    const num = Number(value);
                    if (isNaN(num)) {
                        throw new Error(`${key} must be a number`);
                    }
                    if (fieldDef.min !== undefined && num < fieldDef.min) {
                        throw new Error(`${key} must be at least ${fieldDef.min}`);
                    }
                    if (fieldDef.max !== undefined && num > fieldDef.max) {
                        throw new Error(`${key} must be no more than ${fieldDef.max}`);
                    }
                    formObject[key] = num;
                    break;

                case 'boolean':
                    formObject[key] = value === 'true' || value === '1' ? 1 : 0;
                    break;

                case 'select':
                    if (!fieldDef.options.includes(value)) {
                        throw new Error(`Invalid option for ${key}: ${value}`);
                    }
                    formObject[key] = value;
                    break;

                default:
                    formObject[key] = value;
            }
        }

        return formObject;
    }

    // Enhanced form submission function
    async function validateAndSubmitForm(formId, endpoint) {
        try {
            console.log(`Validating form ${formId}`);
            
            if (!validateForm(formId)) {
                console.log('Form validation failed');
                return;
            }

            const formData = prepareFormData(formId);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            const result = await response.json();
            
            // Show result in a more user-friendly way
            const resultDiv = document.createElement('div');
            resultDiv.className = 'mt-4 p-4 rounded-lg ' + 
                (result.prediction === 'Churned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700');
            resultDiv.textContent = `Prediction: ${result.prediction}`;
            
            const form = document.getElementById(formId);
            const existingResult = form.querySelector('.prediction-result');
            if (existingResult) {
                existingResult.remove();
            }
            resultDiv.className += ' prediction-result';
            form.appendChild(resultDiv);

        } catch (error) {
            alert(error.message);
            console.error('Submission error:', error);
        }
    }

    // Function to show/hide forms
    function showForm(formId) {
        const forms = document.querySelectorAll('#form1, #form2');
        forms.forEach(form => form.style.display = 'none');

        const selectedForm = document.getElementById(formId);
        if (selectedForm) {
            selectedForm.style.display = 'block';
            selectedForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Initialize form event listeners
    const forms = document.querySelectorAll('#form1, #form2');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => validateField(input));
        });
    });

    // Form submission handlers
    ['form1', 'form2'].forEach(formId => {
        const form = document.getElementById(formId);
        const submitBtn = document.getElementById(`submitBtn${formId.slice(-1)}`);
        const endpoint = formId === 'form1' ? '/api/bank-churn-prediction' : '/api/telecom-churn-prediction';

        if (form) {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                validateAndSubmitForm(formId, endpoint);
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener("click", (event) => {
                event.preventDefault();
                validateAndSubmitForm(formId, endpoint);
            });
        }
    });

    // Initialize navigation button listeners
    ['bank', 'telecom'].forEach(type => {
        const btn = document.getElementById(`${type}ChurnBtn`);
        const link = document.getElementById(`${type}ChurnLink`);
        const formId = type === 'bank' ? 'form1' : 'form2';

        if (btn) {
            btn.addEventListener("click", () => showForm(formId));
        }

        if (link) {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                showForm(formId);
            });
        }
    });
});