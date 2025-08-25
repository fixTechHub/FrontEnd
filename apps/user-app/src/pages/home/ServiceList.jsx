import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Spinner, Button, Modal } from "react-bootstrap";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import { createNewBooking } from '../../features/bookings/bookingSlice';
import ImageUploader from '../booking/common/ImageUploader';
import { validateBookingData } from '../../validations/bookingValidation';
import Footer from "../../components/common/Footer";

// Hook lấy gợi ý địa chỉ từ HERE Maps
function useHereAddressAutocomplete(query) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const controllerRef = useRef();

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setSuggestions([]);
            setError(null);
            return;
        }
        setLoading(true);
        setError(null);
        if (controllerRef.current) controllerRef.current.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        const fetchSuggestions = async () => {
            try {
                const apiKey = import.meta.env.VITE_HERE_API_KEY;
                // Đà Nẵng: lat=16.0544, lng=108.2022
                const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?at=16.0544,108.2022&limit=5&q=${encodeURIComponent(query)}&lang=vi-VN&apiKey=${apiKey}`;
                const res = await fetch(url, { signal: controller.signal });
                const data = await res.json();
                // Lọc chỉ lấy kết quả là đường phố hoặc địa chỉ
                const streets = (data.items || []).filter(
                    item => item.resultType === 'street' || item.resultType === 'houseNumber' || item.resultType === 'address'
                );
                setSuggestions(streets);
            } catch (err) {
                if (err.name !== 'AbortError') setError('Lỗi khi lấy gợi ý địa chỉ');
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
        return () => controller.abort();
    }, [query]);
    return { suggestions, loading, error };
}

function ServiceList() {
    const { categories, status: categoryStatus } = useSelector((state) => state.categories);
    const { services, status: serviceStatus } = useSelector((state) => state.services);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);

    // State cho booking modal
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingType, setBookingType] = useState('urgent');
    const [bookingLocation, setBookingLocation] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingEndTime, setBookingEndTime] = useState("");
    const [bookingImages, setBookingImages] = useState([]);
    const [bookingDescription, setBookingDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState({});
    const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
    const [step, setStep] = useState(1); 

    const locationInputRef = useRef();
    const { suggestions: addressSuggestions, loading: addressLoading, error: addressError } = useHereAddressAutocomplete(bookingLocation);

    const filteredServices = services.filter(service => {
        const matchCategory =
            selectedCategories.length === 0 || selectedCategories.includes(service.categoryId);

        const matchSearch =
            !searchTerm || service.serviceName.toLowerCase().includes(searchTerm);

        return matchCategory && matchSearch;
    });

    const itemsPerPage = 6;

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentServices = filteredServices.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, searchTerm]);

    // Xử lý mở modal booking
    const handleOpenBookingModal = (service, type) => {
        setSelectedService(service);
        setBookingType(type);
        setBookingDescription("");
        setShowBookingModal(true);
        setFormError("");
        setErrors({});
        setBookingLocation("");
        setBookingDate("");
        setBookingTime("");
        setBookingEndTime("");
        setBookingImages([]);
        setStep(1); // Reset step to 1 when opening modal
    };

    // Xử lý đóng modal
    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
        setSelectedService(null);
        setBookingType('urgent');
        setBookingDescription("");
        setFormError("");
        setErrors({});
        setBookingLocation("");
        setBookingDate("");
        setBookingTime("");
        setBookingEndTime("");
        setBookingImages([]);
        setStep(1); // Reset step to 1 when closing modal
    };

    // Xử lý upload ảnh
    const handleBookingImages = (files) => {
        setBookingImages(files);
    };

    // Xử lý submit booking
    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        setFormError("");
        setErrors({});

        if (!selectedService) {
            setFormError('Vui lòng chọn dịch vụ!');
            return;
        }

        // Validate sử dụng validateBookingData như SearchComponent
        const bookingData = {
            service: selectedService,
            description: bookingDescription,
            scheduleDate: bookingDate,
            startTime: bookingTime,
            endTime: bookingEndTime,
            images: bookingImages
        };

        const newErrors = validateBookingData(
            bookingData,
            bookingLocation,
            bookingType === 'scheduled',
            bookingType
        );

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setFormError('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        // Chuyển sang step 2 để xác nhận thông tin
        setStep(2);
    };

    // Xử lý xác nhận đặt lịch
    const handleConfirmBooking = async () => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', bookingType);
            formData.append('serviceId', selectedService._id);
            formData.append('description', bookingDescription);
            formData.append('address', bookingLocation);

            if (bookingType === 'scheduled') {
                const startDateTime = new Date(`${bookingDate}T${bookingTime}`);
                const endDateTime = new Date(`${bookingDate}T${bookingEndTime}`);
                formData.append('scheduleDate', bookingDate);
                formData.append('startTime', startDateTime.toISOString());
                formData.append('endTime', endDateTime.toISOString());
            }

            if (bookingImages && bookingImages.length > 0) {
                bookingImages.forEach(file => {
                    formData.append('images', file);
                });
            }

            const actionResult = await dispatch(createNewBooking(formData));
            const bookingResult = actionResult.payload;

            if (bookingResult?.booking?._id) {
                handleCloseBookingModal();
                navigate(`/booking/choose-technician?bookingId=${bookingResult.booking._id}`);
            } else {
                setFormError('Đặt lịch thành công nhưng không thể chuyển sang trang chọn kỹ thuật viên!');
            }
        } catch (error) {
            setFormError('Đặt lịch thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    if (categoryStatus === 'loading' || serviceStatus === 'loading')
        return (
            <div className="service-list-loading-container">
                <Spinner animation="border" variant="primary" />
                <div className="service-list-loading-text">Đang tải dữ liệu</div>
            </div>
        );

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Danh Sách Dịch Vụ'} subtitle={'Services List'} />

            <div className="main-wrapper listing-page mt-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-3 col-lg-4 col-sm-12 col-12 theiaStickySidebar">
                            <div className="service-list-filter-section">
                                <div className="service-list-search-box">
                                    <input
                                        type="text"
                                        className="service-list-search-input"
                                        placeholder="Tìm kiếm dịch vụ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                    />
                                    <i className="bx bx-search service-list-search-icon"></i>
                                </div>

                                <div className="service-list-category-section">
                                    <div className="service-list-category-title">
                                        <i className="bx bx-category me-2"></i>
                                        Danh mục dịch vụ
                                    </div>
                                    {categories.map((category) => (
                                        <div key={category._id} className="service-list-category-item">
                                            <input
                                                type="checkbox"
                                                className="service-list-category-checkbox"
                                                id={`category-${category._id}`}
                                                value={category._id}
                                                checked={selectedCategories.includes(category._id)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSelectedCategories((prev) =>
                                                        prev.includes(value)
                                                            ? prev.filter((id) => id !== value)
                                                            : [...prev, value]
                                                    );
                                                }}
                                            />
                                            <label htmlFor={`category-${category._id}`} style={{ cursor: 'pointer', margin: 0, flex: 1 }}>
                                                {category.categoryName}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-9">
                            {currentServices.length === 0 ? (
                                <div className="service-list-empty-state">
                                    <i className="bx bx-search service-list-empty-icon"></i>
                                    <div className="service-list-empty-title">Không tìm thấy dịch vụ phù hợp</div>
                                    <div className="service-list-empty-subtitle">
                                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    {currentServices.map((service) => (
                                        <div key={service._id} className="col-xxl-4 col-lg-6 col-md-6 col-12 mb-4">
                                            <div className="service-list-card">
                                                <div className="service-list-card-image">
                                                    <img
                                                        src={service.icon}
                                                        alt={service.serviceName}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="service-list-card-fallback" style={{ display: 'none' }}>
                                                        <i className="bx bx-cog" style={{ fontSize: '60px', color: '#6c757d' }}></i>
                                                    </div>
                                                    {/* <div className="service-list-card-badge">
                                                        <i className="bx bx-star"></i>
                                                        Phổ biến
                                                    </div> */}
                                                </div>

                                                <div className="service-list-card-content">
                                                    <h3 className="service-list-card-title">
                                                        {service.serviceName}
                                                    </h3>

                                                    <p className="service-list-card-description">
                                                        {service.description}
                                                    </p>

                                                    {service.price && (
                                                        <div className="service-list-card-price">
                                                            {service.price.toLocaleString()} VNĐ
                                                        </div>
                                                    )}

                                                    <div className="service-list-card-buttons">
                                                        <button
                                                            className="service-list-card-btn service-list-card-btn-primary"
                                                            onClick={() => handleOpenBookingModal(service, 'scheduled')}
                                                        >
                                                            <i className="bx bx-calendar"></i>
                                                            Đặt Lịch
                                                        </button>
                                                        <button
                                                            className="service-list-card-btn service-list-card-btn-secondary"
                                                            onClick={() => handleOpenBookingModal(service, 'urgent')}
                                                        >
                                                            <i className="bx bx-bolt"></i>
                                                            Đặt Ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="service-list-pagination">
                                    <nav>
                                        <ul className="pagination justify-content-center">
                                            <li className={`service-list-page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <a
                                                    className={`service-list-page-link ${currentPage === 1 ? 'disabled' : ''}`}
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <i className="bx bx-chevron-left"></i>
                                                </a>
                                            </li>

                                            {[...Array(totalPages)].map((_, index) => (
                                                <li key={index} className="service-list-page-item">
                                                    <a
                                                        className={`service-list-page-link ${currentPage === index + 1 ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(index + 1)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {index + 1}
                                                    </a>
                                                </li>
                                            ))}

                                            <li className={`service-list-page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <a
                                                    className={`service-list-page-link ${currentPage === totalPages ? 'disabled' : ''}`}
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                                >
                                                    <i className="bx bx-chevron-right"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal đặt lịch */}
            <Modal show={showBookingModal} onHide={handleCloseBookingModal} size="lg">
                <Modal.Header closeButton className="service-list-modal-header">
                    <Modal.Title className="service-list-modal-title">
                        {step === 1 ? `Đặt lịch dịch vụ - ${selectedService?.serviceName}` : 'Xác nhận thông tin đặt lịch'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="service-list-modal-body">
                    {step === 1 && (
                        <div>
                            {/* Hiển thị dịch vụ đã chọn */}
                            <div className="service-list-selected-service">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <i className="bx bx-check-circle" style={{ fontSize: '18px' }}></i>
                                    <div className="service-list-selected-service-title">
                                        Dịch vụ đã chọn
                                    </div>
                                </div>
                                <div className="service-list-selected-service-info">
                                    {selectedService?.serviceName}
                                    {selectedService?.price && (
                                        <span> - {selectedService.price.toLocaleString()} VNĐ</span>
                                    )}
                                </div>
                            </div>

                            {/* Loại đặt lịch */}
                            <div className="service-list-info-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <i className="bx bx-calendar service-list-info-header-icon"></i>
                                    <div className="service-list-info-header-title">
                                        Chọn loại đặt lịch
                                    </div>
                                </div>
                                <div className="service-list-info-header-subtitle">
                                    Bạn muốn đặt lịch ngay hay lên lịch trước?
                                </div>
                            </div>

                            <div className="service-list-booking-cards">
                                <div
                                    className={`service-list-booking-card ${bookingType === 'urgent' ? 'selected' : ''}`}
                                    onClick={() => setBookingType('urgent')}
                                >
                                    <div className="service-list-booking-content">
                                        <div className="service-list-booking-icon service-list-booking-icon-urgent">
                                            <i className="bx bxs-bolt"></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="service-list-booking-title">
                                                Đặt ngay
                                            </div>
                                            <div className="service-list-booking-subtitle">
                                                Kỹ thuật viên sẽ đến trong 20-40 phút
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`service-list-booking-card ${bookingType === 'scheduled' ? 'selected' : ''}`}
                                    onClick={() => setBookingType('scheduled')}
                                >
                                    <div className="service-list-booking-content">
                                        <div className="service-list-booking-icon service-list-booking-icon-scheduled">
                                            <i className="bx bx-calendar"></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="service-list-booking-title">
                                                Đặt lịch
                                            </div>
                                            <div className="service-list-booking-subtitle">
                                                Chọn thời gian linh hoạt theo lịch của bạn
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Địa chỉ */}
                            <div className="mb-3" style={{ position: 'relative' }}>
                                <label className="form-label service-list-form-label">
                                    Địa chỉ <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control service-list-form-input ${errors.addressInput ? 'error' : ''}`}
                                    value={bookingLocation}
                                    onChange={e => {
                                        setBookingLocation(e.target.value);
                                        if (e.target.value.trim().length >= 3) {
                                            setShowAddressSuggestions(true);
                                        } else {
                                            setShowAddressSuggestions(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (bookingLocation.trim().length >= 3) {
                                            setShowAddressSuggestions(true);
                                        }
                                    }}
                                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                                    ref={locationInputRef}
                                    required
                                    autoComplete="off"
                                    placeholder="Nhập địa chỉ của bạn ( ví dụ: 105 Lê Duẩn, TP. Đà Nẵng )"
                                />
                                {addressLoading && <div className="service-list-form-loading">Đang tìm gợi ý...</div>}
                                {addressError && <div className="service-list-form-error">{addressError}</div>}
                                {showAddressSuggestions && addressSuggestions.length > 0 && (
                                    <ul className="service-list-address-suggestions">
                                        {addressSuggestions.map((s, idx) => (
                                            <li
                                                key={s.id || s.title + idx}
                                                className="service-list-address-item"
                                                onMouseDown={() => {
                                                    setBookingLocation(s.address?.label || s.title);
                                                    setShowAddressSuggestions(false);
                                                    setTimeout(() => locationInputRef.current?.blur(), 0);
                                                }}
                                            >
                                                {s.address?.label || s.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.addressInput && <div className="service-list-form-error">{errors.addressInput}</div>}
                            </div>

                            {/* Mô tả */}
                            <div className="mb-3">
                                <label className="form-label service-list-form-label">
                                    Mô tả tình trạng <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className={`form-control service-list-form-textarea ${errors.description ? 'error' : ''}`}
                                    value={bookingDescription}
                                    onChange={e => setBookingDescription(e.target.value)}
                                    required
                                    placeholder="Mô tả chi tiết tình trạng bạn gặp phải..."
                                />
                                {errors.description && <div className="service-list-form-error">{errors.description}</div>}
                            </div>

                            {/* Nếu là scheduled thì nhập ngày, giờ bắt đầu, giờ kết thúc */}
                            {bookingType === 'scheduled' && (
                                <div className="service-list-schedule-section">
                                    <div className="service-list-schedule-header">
                                        <i className="bx bx-time service-list-info-header-icon"></i>
                                        <span className="service-list-schedule-title">Thông tin lịch hẹn</span>
                                    </div>

                                    <div className="service-list-schedule-inputs">
                                        <div className="service-list-schedule-input-group">
                                            <label className="form-label service-list-form-label">
                                                Ngày đặt lịch <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                className={`form-control service-list-form-input ${errors.scheduleDate ? 'error' : ''}`}
                                                value={bookingDate}
                                                onChange={e => setBookingDate(e.target.value)}
                                                required
                                            />
                                            {errors.scheduleDate && <div className="service-list-form-error">{errors.scheduleDate}</div>}
                                        </div>
                                    </div>

                                    <div className="service-list-schedule-time-inputs">
                                        <div className="service-list-schedule-time-label">
                                            <label className="form-label service-list-form-label">
                                                Thời gian <span className="text-danger">*</span>
                                            </label>
                                        </div>
                                        <div className="service-list-schedule-time-inputs-row">
                                            <div className="service-list-schedule-input-group">
                                                <input
                                                    type="time"
                                                    className={`form-control service-list-form-input ${errors.startTime ? 'error' : ''}`}
                                                    value={bookingTime}
                                                    onChange={e => setBookingTime(e.target.value)}
                                                    required
                                                    placeholder="Từ"
                                                />
                                                {errors.startTime && <div className="service-list-form-error">{errors.startTime}</div>}
                                            </div>
                                            <div className="service-list-schedule-input-separator">
                                                <span>đến</span>
                                            </div>
                                            <div className="service-list-schedule-input-group">
                                                <input
                                                    type="time"
                                                    className={`form-control service-list-form-input ${errors.endTime ? 'error' : ''}`}
                                                    value={bookingEndTime}
                                                    onChange={e => setBookingEndTime(e.target.value)}
                                                    required
                                                    placeholder="Đến"
                                                />
                                                {errors.endTime && <div className="service-list-form-error">{errors.endTime}</div>}
                                            </div>
                                        </div>
                                        <div className="banner-info-box">
                                            <i className="bx bx-info-circle banner-info-icon"></i>
                                            <span>
                                                Lưu ý: Đây là khoảng thời gian bạn mong muốn thợ đến, không phải thời gian sửa chữa chính xác.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Upload ảnh */}
                            <div className="mb-3">
                                {/* <label className="form-label service-list-form-label">
                                    Hình ảnh (tùy chọn)
                                </label> */}
                                <ImageUploader onFilesSelect={handleBookingImages} />
                                {errors.images && <div className="service-list-form-error">{errors.images}</div>}
                            </div>

                            {/* Hiển thị hình ảnh đã upload */}
                            {bookingImages && bookingImages.length > 0 && (
                                <div className="banner-uploaded-images">
                                    <div className="banner-uploaded-images-title">
                                        <i className="bx bx-image" style={{ fontSize: '16px', marginRight: '8px' }}></i>
                                        Hình ảnh đã chọn ({bookingImages.length})
                                    </div>
                                    <div className="banner-uploaded-images-grid">
                                        {bookingImages.map((file, index) => (
                                            <div key={index} className="banner-uploaded-image-item">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Hình ảnh ${index + 1}`}
                                                    className="banner-uploaded-image"
                                                />
                                                <button
                                                    type="button"
                                                    className="banner-remove-image-btn"
                                                    onClick={() => {
                                                        const newImages = bookingImages.filter((_, i) => i !== index);
                                                        setBookingImages(newImages);
                                                    }}
                                                    title="Xóa hình ảnh"
                                                >
                                                    <i className="bx bx-x"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formError && (
                                <div className="alert alert-danger service-list-alert-danger">
                                    <i className="bx bx-error-circle"></i>
                                    {formError}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="banner-confirm-container">
                            <div className="banner-info-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <i className="bx bx-check-circle banner-info-header-icon"></i>
                                    <div className="banner-info-header-title">
                                        Xác nhận thông tin đặt lịch
                                    </div>
                                </div>
                                <div className="banner-info-header-subtitle">
                                    Vui lòng kiểm tra lại trước khi xác nhận.
                                </div>
                            </div>

                            <div className="banner-confirm-summary">
                                <div className="alert alert-light" role="alert">
                                    <div><strong>Dịch vụ:</strong> <span>{selectedService?.serviceName}</span></div>
                                    <div><strong>Loại đặt:</strong> <span>{bookingType === 'urgent' ? 'Đặt ngay' : 'Đặt lịch'}</span></div>
                                    {bookingType === 'scheduled' && (
                                        <>
                                            <div><strong>Ngày:</strong> <span>{bookingDate ? new Date(bookingDate).toLocaleDateString('vi-VN') : ''}</span></div>
                                            <div><strong>Thời gian:</strong> <span>{bookingTime} - {bookingEndTime}</span></div>
                                        </>
                                    )}
                                    <div><strong>Địa chỉ:</strong> <span>{bookingLocation}</span></div>
                                    <div><strong>Mô tả:</strong> <span>{bookingDescription}</span></div>
                                    {bookingImages && bookingImages.length > 0 && (
                                        <div><strong>Hình ảnh:</strong>
                                            <div className="banner-confirm-images">
                                                {bookingImages.map((file, index) => (
                                                    <div key={index} className="banner-confirm-image-item">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Hình ảnh ${index + 1}`}
                                                            className="banner-confirm-image"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="banner-confirm-note">
                                <i className="bx bx-info-circle banner-info-icon"></i>
                                <span>Nhấn "Đặt lịch & chọn kỹ thuật viên" để tạo yêu cầu và chuyển sang bước chọn kỹ thuật viên.</span>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="service-list-modal-footer">
                    {step === 1 && (
                        <div className="service-list-modal-footer-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    // Validate sử dụng validateBookingData từ file validation
                                    const bookingData = {
                                        service: selectedService,
                                        description: bookingDescription,
                                        scheduleDate: bookingDate,
                                        startTime: bookingTime,
                                        endTime: bookingEndTime,
                                        images: bookingImages
                                    };

                                    const newErrors = validateBookingData(
                                        bookingData,
                                        bookingLocation,
                                        true, // geoJson - tạm thời để true
                                        bookingType
                                    );

                                    // Hiển thị tất cả lỗi cùng lúc
                                    setErrors(newErrors);

                                    // Chỉ chuyển step khi không có lỗi
                                    if (Object.keys(newErrors).length === 0) {
                                        setStep(2);
                                    }
                                }}
                                className="service-list-btn-primary"
                                style={{ marginRight: 10, marginBottom: 10 }}
                            >
                                Tiếp tục
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{marginBottom: 10}} className="service-list-modal-footer-actions">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="service-list-btn-secondary"
                                style={{ marginRight: 10 }}
                            >
                                Trở lại
                            </button>
                            <button
                                type="submit"
                                onClick={handleConfirmBooking}
                                disabled={submitting}
                                className="service-list-btn-primary"
                                style={{ marginRight: 10 }}
                            >
                                {submitting ? 'Đang xử lý...' : 'Đặt lịch & chọn kỹ thuật viên'}
                            </button>
                        </div>
                    )}
                </Modal.Footer>
            </Modal>

            <div style={{ marginTop: 25 }} className="footer-enhanced">
                <Footer />
            </div>
        </>
    );
}

export default ServiceList;