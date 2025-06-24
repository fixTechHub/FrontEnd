export function validatePhone(phone) {
    const regex = /^\+?\d{10,15}$/; // Cho phép + và từ 10-15 số
    return regex.test(phone);
}
