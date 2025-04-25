import { useState } from 'react';

const useFormValidation = (initialState) => {
    const [errors, setErrors] = useState({});

    const validateField = (name, value) => {
        let error = '';

        if (name === 'Vendor_name' && !value.trim()) {
            error = 'Vendor name is required';
        }

        if (name === 'GSTN' && value.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(value.trim())) {
            error = 'Please enter a valid GSTN';
        }

        if (name === 'BASE_AMOUNT' && value && (isNaN(value) || parseFloat(value) <= 0)) {
            error = 'Please enter a valid amount';
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: error
        }));
    };

    const validateForm = (formData) => {
        const newErrors = {};
        let isValid = true;

        Object.entries(formData).forEach(([name, value]) => {
            const error = validateField(name, value);
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    return { errors, handleChange, validateForm };
};

export default useFormValidation; 