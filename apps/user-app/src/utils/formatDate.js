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
