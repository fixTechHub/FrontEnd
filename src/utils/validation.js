export const validateFullName = (fullName) => {
    if (!fullName) return 'Vui lòng nhập họ tên';
    if (fullName.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    if (fullName.length > 50) return 'Họ tên không được quá 50 ký tự';
    return '';
};

export const validateEmailOrPhone = (emailOrPhone) => {
    if (!emailOrPhone) return 'Vui lòng nhập email hoặc số điện thoại';
    
    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Kiểm tra định dạng số điện thoại (10 số)
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
        return 'Email hoặc số điện thoại không hợp lệ';
    }

    return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Vui lòng xác nhận mật khẩu';
    if (password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return '';
};

export const validatePassword = (password) => {
    if (!password) return 'Vui lòng nhập mật khẩu';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!validatePasswordStrength(password)) {
        return 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';
    }
    return '';
};

export const validateRegistrationForm = (formData) => {
    const errors = {};
    
    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) errors.fullName = fullNameError;

    const emailOrPhoneError = validateEmailOrPhone(formData.emailOrPhone);
    if (emailOrPhoneError) errors.emailOrPhone = emailOrPhoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
};

// Validate email format
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate Vietnamese phone number format (10 digits, starts with 0)
export const validatePhone = (phone) => {
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
    // Ít nhất 8 ký tự
    if (password.length < 8) return false;

    // Phải chứa ít nhất:
    // - 1 chữ hoa
    // - 1 chữ thường
    // - 1 số
    // - 1 ký tự đặc biệt
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Validate required field
export const validateRequired = (value) => {
    return value && value.trim().length > 0;
};

// Validate minimum length
export const validateMinLength = (value, minLength) => {
    return value && value.trim().length >= minLength;
};

// Validate maximum length
export const validateMaxLength = (value, maxLength) => {
    return value && value.trim().length <= maxLength;
};

// Validate name (only letters and spaces)
export const validateName = (name) => {
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    return nameRegex.test(name);
};

// Validate date format (YYYY-MM-DD)
export const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
};

// Validate file size (in bytes)
export const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
};

// Validate file type
export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

// Validate URL format
export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Validate login form
export const validateLoginForm = (formData) => {
    const errors = {};
    
    const emailError = validateLoginEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateLoginPassword(formData.password);
    if (passwordError) errors.password = passwordError;

    return errors;
};

// Validate email for login
export const validateLoginEmail = (email) => {
    if (!email) return 'Vui lòng nhập địa chỉ email';
    if (!validateEmail(email)) return 'Địa chỉ email không hợp lệ';
    return '';
};

// Validate password for login
export const validateLoginPassword = (password) => {
    if (!password) return 'Vui lòng nhập mật khẩu';
    return '';
};

// Test cases for validation functions (for development only)
export const testValidation = () => {
    console.log('Testing validation functions...');
    
    // Test email validation
    console.log('Email validation:');
    console.log('test@example.com:', validateEmail('test@example.com')); // true
    console.log('invalid-email:', validateEmail('invalid-email')); // false
    console.log('empty:', validateEmail('')); // false
    
    // Test phone validation
    console.log('Phone validation:');
    console.log('0123456789:', validatePhone('0123456789')); // true
    console.log('1234567890:', validatePhone('1234567890')); // false (no leading 0)
    console.log('012345678:', validatePhone('012345678')); // false (9 digits)
    
    // Test password validation
    console.log('Password validation:');
    console.log('StrongPass1!:', validatePasswordStrength('StrongPass1!')); // true
    console.log('weak:', validatePasswordStrength('weak')); // false
    console.log('NoSpecial1:', validatePasswordStrength('NoSpecial1')); // false
    
    // Test login validation
    console.log('Login validation:');
    const loginData = {
        email: 'test@example.com',
        password: 'password123'
    };
    console.log('Valid login:', validateLoginForm(loginData)); // {}
    
    const invalidLoginData = {
        email: 'invalid-email',
        password: ''
    };
    console.log('Invalid login:', validateLoginForm(invalidLoginData)); // {email: '...', password: '...'}
}; 