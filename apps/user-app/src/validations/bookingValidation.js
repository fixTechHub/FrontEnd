export const validateBookingData = (bookingData, addressInput, geoJson, type) => {
    const newErrors = {};
    if (!addressInput || addressInput.trim().length < 5) {
        newErrors.addressInput = "Vui lòng nhập địa chỉ hợp lệ của bạn.";
    }
    if (!geoJson) {
        newErrors.geoJson = "Vui lòng chọn vị trí trên bản đồ.";
    }
    if (!bookingData.service || !bookingData.service._id) {
        newErrors.service = "Vui lòng chọn dịch vụ.";
    }
    if (!bookingData.description || bookingData.description.trim().length < 10) {
        newErrors.description = "Vui lòng nhập mô tả chi tiết (tối thiểu 10 ký tự).";
    }
    // if (bookingData.images) {
    //     const count = bookingData.images.length;
    //     if (count === 2) {
    //         newErrors.images = "Cần tải lên ít nhất 1 ảnh.";
    //     } else if (count > 5) {
    //         newErrors.images = "Chỉ được tải lên tối đa 5 ảnh.";
    //     }
    // }
    if (type === 'scheduled') {
        if (!bookingData.scheduleDate) {
            newErrors.scheduleDate = "Vui lòng chọn ngày đặt lịch.";
        } else {
            const selectedDate = new Date(bookingData.scheduleDate);
            if (isNaN(selectedDate)) {
                newErrors.scheduleDate = "Định dạng ngày không hợp lệ.";
            } else {
                // So sánh **theo ngày**, bỏ qua giờ
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    newErrors.scheduleDate = "Vui lòng chọn ngày hôm nay hoặc tương lai.";
                }
            }
        }
        if (!bookingData.startTime) {
            newErrors.startTime = "Vui lòng chọn giờ bắt đầu.";
        }
        if (!bookingData.endTime) {
            newErrors.endTime = "Vui lòng chọn giờ kết thúc.";
        }
        if (
            bookingData.scheduleDate &&
            bookingData.startTime &&
            bookingData.endTime &&
            !newErrors.scheduleDate
        ) {
            const start = new Date(`${bookingData.scheduleDate}T${bookingData.startTime}`);
            const end = new Date(`${bookingData.scheduleDate}T${bookingData.endTime}`);

            if (isNaN(start) || isNaN(end)) {
                newErrors.startTime = "Giờ không hợp lệ.";
            } else if (end <= start) {
                newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu.";
            } else {
                // Kiểm tra thời gian bắt đầu phải cách thời điểm hiện tại ít nhất 2 tiếng
                const now = new Date();
                const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 tiếng
                
                if (start <= twoHoursLater) {
                    newErrors.startTime = "Thời gian bắt đầu cần được thiết lập cách thời điểm hiện tại tối thiểu 2 giờ.";
                }
            }
        }
    }

    return newErrors;
};