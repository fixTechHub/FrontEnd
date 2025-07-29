export const BOOKING_STATUS = {
    PENDING: 'PENDING',
    QUOTED: 'QUOTED',
    // WAITING_CONFIRM: 'WAITING_CONFIRM',
    AWAITING_CONFIRM: 'AWAITING_CONFIRM',
    AWAITING_DONE:'AWAITING_DONE',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED',
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
    [BOOKING_STATUS.AWAITING_CONFIRM]: {
        text: 'Chờ Kỹ Thuật Viên Xác Nhận',
        className: 'status-confirmed'
    },
    [BOOKING_STATUS.AWAITING_DONE]: {
        text: 'Chờ Xác Nhận Và Thanh Toán',
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

export const BOOKING_WARRANTY_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    RESOLVED: 'RESOLVED',
    DENIED: 'DENIED',
    EXPIRED: 'EXPIRED',
    DONE:'DONE'
};

export const BOOKING_WARRANTY_STATUS_CONFIG = {
    [BOOKING_WARRANTY_STATUS.PENDING]: {
        text: 'Đang Xử Lý',
        className: 'status-pending'
    },
    [BOOKING_WARRANTY_STATUS.CONFIRMED]: {
        text: 'Đã Nhận Bảo Hành',
        className: 'status-quoted'
    },
    [BOOKING_WARRANTY_STATUS.RESOLVED]: {
        text: 'Đã Bảo Hành',
        className: 'status-confirmed'
    },
    [BOOKING_WARRANTY_STATUS.DENIED]: {
        text: 'Đã Bị Từ Chối',
        className: 'status-cancelled'
    },
  
    [BOOKING_WARRANTY_STATUS.EXPIRED]: {
        text: 'Đã Hết Hạn',
        className: 'status-cancelled'
    },
    [BOOKING_WARRANTY_STATUS.DONE]: {
        text: 'Đã Xác Nhận Bảo Hành',
        className: 'status-confirmed'
    },
    default: {
        text: 'Không xác định',
        className: 'status-unknown'
    }
};