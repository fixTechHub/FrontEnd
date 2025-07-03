// Chỉ định dạng ngày
export const formatDateOnly = (isoDateString) => {
    if (!isoDateString) return '';

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

// Chỉ định dạng giờ:phút
export const formatTimeOnly = (isoDateString) => {
    if (!isoDateString) return '';

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'Giờ không hợp lệ';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

export const formatDate = (isoDateString) => {
    // Trả về chuỗi rỗng nếu không có dữ liệu đầu vào
    if (!isoDateString) {
        return '';
    }

    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
        console.error("Invalid date string provided:", isoDateString);
        return 'Ngày không hợp lệ';
    }

    try {
        const dateOptions = {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        const datePart = new Intl.DateTimeFormat('vi-VN', dateOptions).format(date);

        const timeOptions = {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, // Sử dụng định dạng 24 giờ
        };
        const timePart = new Intl.DateTimeFormat('vi-VN', timeOptions).format(date);

        return `${datePart} - ${timePart}`;

    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Lỗi định dạng';
    }
};
