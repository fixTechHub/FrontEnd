export const BOOKING_STATUS = {
    PENDING: 'PENDING',
    QUOTED: 'QUOTED',
    CONFIRMED: 'CONFIRMED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED',
};

export const BOOKING_STATUS_CONFIG = {
    [BOOKING_STATUS.PENDING]: {
        text: 'Đang Xử Lý',
        className: 'status-pending'
    },
    [BOOKING_STATUS.QUOTED]: {
        text: 'Đã Nhận Báo Giá',
        className: 'status-quoted'
    },
    [BOOKING_STATUS.WAITING_CONFIRM]: {
        text: 'Chờ Khách Hàng Xác Nhận',
        className: 'status-confirmed'
    },
    [BOOKING_STATUS.IN_PROGRESS]: {
        text: 'Đang Thực Hiện',
        className: 'status-in-progress'
    },
    [BOOKING_STATUS.DONE]: {
        text: 'Đã Hoàn Thành',
        className: 'status-completed'
    },
    [BOOKING_STATUS.CANCELLED]: {
        text: 'Đã Hủy',
        className: 'status-cancelled'
    },
    default: {
        text: 'Không xác định',
        className: 'status-unknown'
    }
};
