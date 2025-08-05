import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestServices } from '../../features/services/serviceSlice';
import { createNewBooking } from '../../features/bookings/bookingSlice';
import { fetchPopularDescriptions, searchDescriptions, clearSearchResults } from '../../features/suggestions/suggestionSlice';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Spinner } from 'react-bootstrap';
import ImageUploader from '../../pages/booking/common/ImageUploader';
import { validateBookingData } from '../../validations/bookingValidation';

// Hook lấy gợi ý địa chỉ từ HERE Maps
function useHereAddressAutocomplete(query) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const controllerRef = useRef();

    React.useEffect(() => {
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

function Banner() {
    const [searchValue, setSearchValue] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [step, setStep] = useState(0); // 0: chọn dịch vụ, 1: chọn loại đặt, 2: form booking
    const [bookingLocation, setBookingLocation] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [bookingImages, setBookingImages] = useState([]);
    const [bookingDescription, setBookingDescription] = useState("");
    const [bookingType, setBookingType] = useState('urgent');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState({});
    // Thêm state cho endTime nếu đặt lịch
    const [bookingEndTime, setBookingEndTime] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    // Thêm state cho search loading
    const [searchLoading, setSearchLoading] = useState(false);
    // Tách riêng state cho gợi ý vị trí
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { searchResults, searchStatus, searchError } = useSelector(state => state.services);
    const {
        popularDescriptions,
        searchResults: suggestionSearchResults,
        popularLoading,
        searchLoading: suggestionSearchLoading
    } = useSelector(state => state.suggestions);

    const locationInputRef = useRef();
    const searchInputRef = useRef();
    const { suggestions: addressSuggestions, loading: addressLoading, error: addressError } = useHereAddressAutocomplete(bookingLocation);

    // Load gợi ý phổ biến khi component mount
    useEffect(() => {
        dispatch(fetchPopularDescriptions(5));
    }, [dispatch]);

    // Tìm kiếm gợi ý khi user nhập
    useEffect(() => {
        if (!searchValue || searchValue.trim().length < 2) {
            dispatch(clearSearchResults());
            return;
        }

        const timeoutId = setTimeout(() => {
            dispatch(searchDescriptions({ query: searchValue.trim(), limit: 5 }));
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [searchValue, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchValue.trim() || searchLoading) return;

        setSearchLoading(true);
        dispatch(fetchSuggestServices(searchValue)).then(() => {
            setShowSearchModal(true);
            setSelectedServiceIdx(0);
            setShowBookingForm(false);
            setBookingDescription(searchValue);
            setStep(0);
            setSearchLoading(false);
        }).catch(() => {
            setSearchLoading(false);
        });
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchValue(suggestion.description);
        setShowSuggestions(false);
        searchInputRef.current?.blur();
    };

    const handleContinueService = () => {
        setStep(1);
    };

    const handleContinueType = () => {
        setStep(2);
    };

    const handleBookingImages = (files) => {
        setBookingImages(files);
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        setFormError("");
        setErrors({});
        const selectedService = searchResults[selectedServiceIdx];
        // Chuẩn bị dữ liệu booking giống BookingPage
        const bookingData = {
            service: selectedService,
            description: bookingDescription,
            scheduleDate: bookingDate,
            startTime: bookingTime,
            endTime: bookingType === 'scheduled' ? bookingEndTime : bookingTime,
            images: bookingImages
        };
        // Validate
        let newErrors = {};
        if (bookingType === 'scheduled') {
            newErrors = validateBookingData(
                bookingData,
                bookingLocation,
                true, // Không dùng geoJson ở đây
                bookingType
            );
        } else {
            if (!bookingLocation || bookingLocation.trim().length < 5) newErrors.addressInput = 'Vui lòng nhập địa chỉ hợp lệ của bạn.';
            if (!selectedService) newErrors.service = 'Vui lòng chọn dịch vụ.';
            if (!bookingDescription || bookingDescription.trim().length < 10) newErrors.description = 'Vui lòng nhập mô tả chi tiết (tối thiểu 10 ký tự).';
            if (bookingImages && bookingImages.length > 5) newErrors.images = 'Chỉ được tải lên tối đa 5 ảnh.';
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setFormError('Vui lòng kiểm tra lại thông tin!');
            return;
        }
        if (!selectedService) {
            setFormError('Vui lòng chọn dịch vụ!');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', bookingType);
            formData.append('serviceId', selectedService._id);
            formData.append('description', bookingDescription);
            formData.append('address', bookingLocation);
            if (bookingType === 'scheduled') {
                // Đảm bảo gửi đúng định dạng ISO
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
            // Log toàn bộ formData gửi backend
            for (let [key, value] of formData.entries()) {
                if (key === 'images') {
                    console.log('images:', value.name);
                } else {
                    console.log(key, value);
                }
            }
            const actionResult = await dispatch(createNewBooking(formData));
            const bookingResult = actionResult.payload;
            if (bookingResult?.booking?._id) {
                setShowSearchModal(false);
                setShowBookingForm(false);
                setStep(0);
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

    return (
        <>
            <section className="banner-section-four">
                <div className="container">
                    <div className="home-banner">
                        <div className="row align-items-center">
                            <div className="col-lg-5" data-aos="fade-down">
                                <div className="banner-content">
                                    <h1>
                                        Explore our <span>Verified & Professional</span> Cars
                                    </h1>
                                    <p>
                                        Modern design sports cruisers for those who crave adventure & grandeur Cars for relaxing
                                        with your loved ones.
                                    </p>

                                </div>
                            </div>

                            {/* <div className="col-lg-7">
                                <div className="banner-image">
                                    <div className="banner-img" data-aos="fade-down">
                                        <div className="amount-icon">
                                            <span className="day-amt">
                                                <p>Starts From</p>
                                                <h6>$650 <span> /day</span></h6>
                                            </span>
                                        </div>
                                        <span className="rent-tag"><i className="bx bxs-circle"></i> Available for Rent</span>
                                        <img src="/img/banner/banner.png" className="img-fluid" alt="Banner Car" />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    <div className="banner-search">
                        <form className="form-block d-flex align-items-center" onSubmit={handleSearch}>
                            <div className="search-input">
                                <div className="input-block">
                                    <div className="input-wrap" style={{ position: 'relative' }}>
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            name="descriptionSearch"
                                            style={{ color: '#000' }}
                                            className="form-control"
                                            placeholder="Bạn đang cần giúp gì? Hãy nhập mô tả tình trạng bạn gặp phải tại đây !!!"
                                            value={searchValue}
                                            onChange={e => {
                                                setSearchValue(e.target.value);
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        />

                                        {/* Gợi ý mô tả */}
                                        {showSuggestions && (
                                            <div className="banner-search-suggestions">
                                                {/* Gợi ý tìm kiếm */}
                                                {searchValue && searchValue.trim().length >= 2 && (
                                                    <>
                                                        {suggestionSearchLoading && (
                                                            <div className="banner-loading-container">
                                                                <div className="spinner-border text-primary" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                Đang tìm kiếm...
                                                            </div>
                                                        )}
                                                        {suggestionSearchResults.length > 0 && (
                                                            <div>
                                                                <div className="banner-search-header banner-search-header-blue">
                                                                    <i className="bx bx-search-alt" style={{ fontSize: '14px' }}></i>
                                                                    Kết quả tìm kiếm
                                                                </div>
                                                                {suggestionSearchResults.map((suggestion, idx) => (
                                                                    <div
                                                                        key={`search-${idx}`}
                                                                        className="banner-search-item"
                                                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                                                    >
                                                                        <div className="banner-search-avatar banner-search-avatar-blue">
                                                                            <i className="bx bx-search-alt"></i>
                                                                        </div>
                                                                        <div className="banner-search-content">
                                                                            <div className="banner-search-title">
                                                                                {suggestion.description}
                                                                            </div>
                                                                            <div className="banner-search-meta">
                                                                                <i className="bx bx-time" style={{ fontSize: '10px' }}></i>
                                                                                {suggestion.count || 0} lần sử dụng
                                                                            </div>
                                                                        </div>
                                                                        <i className="bx bx-chevron-right banner-search-arrow"></i>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Gợi ý phổ biến */}
                                                {(!searchValue || searchValue.trim().length < 2) && popularDescriptions.length > 0 && (
                                                    <div>
                                                        <div className="banner-search-header banner-search-header-pink">
                                                            <i className="bx bx-star" style={{ fontSize: '14px' }}></i>
                                                            Mô tả phổ biến
                                                        </div>
                                                        {popularDescriptions.map((suggestion, idx) => (
                                                            <div
                                                                key={`popular-${idx}`}
                                                                className="banner-search-item"
                                                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                                            >
                                                                <div className="banner-search-avatar banner-search-avatar-pink">
                                                                    <i className="bx bx-star"></i>
                                                                </div>
                                                                <div className="banner-search-content">
                                                                    <div className="banner-search-title">
                                                                        {suggestion.description}
                                                                    </div>
                                                                    <div className="banner-search-meta">
                                                                        <i className="bx bx-trending-up" style={{ fontSize: '10px' }}></i>
                                                                        {suggestion.count || 0} lần sử dụng
                                                                    </div>
                                                                </div>
                                                                <i className="bx bx-chevron-right banner-search-arrow"></i>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Thông báo không có kết quả */}
                                                {searchValue && searchValue.trim().length >= 2 && !suggestionSearchLoading && suggestionSearchResults.length === 0 && (
                                                    <div className="banner-search-empty">
                                                        <i className="bx bx-search banner-search-empty-icon"></i>
                                                        <div>Không tìm thấy gợi ý phù hợp</div>
                                                        <div className="banner-search-empty-title">
                                                            Thử nhập từ khóa khác
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="search-btn">
                                <button
                                    className={`btn ${searchLoading ? 'btn-secondary' : 'btn-primary'} banner-search-btn`}
                                    type="submit"
                                    disabled={searchLoading}
                                >
                                    {searchLoading ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span>Tìm...</span>
                                        </>
                                    ) : (
                                        <i className="bx bx-search-alt"></i>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="banner-bgs">
                    <img src="/img/bg/banner-bg-01.png" className="bg-01 img-fluid" alt="Decorative background" />
                </div>
            </section>

            {/* Modal kết quả tìm kiếm dịch vụ và đặt lịch */}
            <Modal
                show={showSearchModal}
                onHide={() => { setShowSearchModal(false); setShowBookingForm(false); setStep(0); }}
            >
                <Modal.Header
                    closeButton
                    className="banner-modal-header"
                >
                    <Modal.Title className="banner-modal-title">
                        {step === 0 && 'Kết quả dịch vụ phù hợp'}
                        {step === 1 && 'Chọn loại đặt lịch'}
                        {step === 2 && 'Đặt lịch dịch vụ'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="banner-modal-body">
                    {/* Bước 1: Chọn dịch vụ */}
                    {step === 0 && (
                        <>
                            {searchStatus === 'loading' && (
                                <div className="banner-loading-container">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <div className="banner-loading-text">
                                        <div className="banner-loading-title">Đang tìm kiếm dịch vụ phù hợp...</div>
                                        <div className="banner-loading-subtitle">Dựa trên mô tả: "{searchValue}"</div>
                                    </div>
                                </div>
                            )}
                            {searchError && (
                                <div className="alert alert-danger banner-alert-danger">
                                    <i className="bx bx-error-circle me-2"></i>
                                    {searchError}
                                </div>
                            )}
                            {searchStatus === 'succeeded' && searchResults.length === 0 && (
                                <div className="banner-empty-container">
                                    <i className="bx bx-search banner-empty-icon"></i>
                                    <div className="banner-empty-title">Không tìm thấy dịch vụ phù hợp</div>
                                    <div className="banner-empty-subtitle">Thử nhập mô tả khác hoặc liên hệ hỗ trợ</div>
                                </div>
                            )}
                            {searchStatus === 'succeeded' && searchResults.length > 0 && (
                                <div>
                                    {/* Header thông tin tìm kiếm */}
                                    <div className="banner-info-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <i className="bx bx-search-alt banner-info-header-icon"></i>
                                            <div className="banner-info-header-title">
                                                Dịch vụ phù hợp với mô tả của bạn
                                            </div>
                                        </div>
                                        <div className="banner-info-header-subtitle">
                                            Tìm thấy {searchResults.length} dịch vụ dựa trên: "{searchValue}"
                                        </div>
                                    </div>

                                    {/* Danh sách dịch vụ */}
                                    <div className="banner-service-list">
                                        {searchResults.map((service, idx) => (
                                            <div
                                                key={service._id || idx}
                                                className={`banner-service-card ${selectedServiceIdx === idx ? 'selected' : ''}`}
                                                onClick={() => setSelectedServiceIdx(idx)}
                                            >
                                                {/* Badge mức độ phù hợp */}
                                                {idx === 0 && (
                                                    <div className="banner-service-badge-best">
                                                        <i className="bx bx-star" style={{ fontSize: '10px' }}></i>
                                                        Phù hợp nhất
                                                    </div>
                                                )}
                                                {idx === 1 && (
                                                    <div className="banner-service-badge-good">
                                                        <i className="bx bx-star" style={{ fontSize: '10px' }}></i>
                                                        Phù hợp tốt
                                                    </div>
                                                )}

                                                {/* Radio button */}
                                                <div className={`banner-service-radio ${selectedServiceIdx === idx ? 'selected' : ''}`}>
                                                    {selectedServiceIdx === idx && (
                                                        <div className="banner-service-radio-dot"></div>
                                                    )}
                                                </div>

                                                {/* Nội dung dịch vụ */}
                                                <div className="banner-service-content">
                                                    <div className="banner-service-header">
                                                        <div style={{ flex: 1 }}>
                                                            <div className="banner-service-title">
                                                                {service.serviceName}
                                                            </div>
                                                            <div className="banner-service-description">
                                                                {service.description}
                                                            </div>
                                                        </div>
                                                        {service.price && (
                                                            <div className="banner-service-price">
                                                                {service.price.toLocaleString()} VNĐ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Thông tin thêm */}
                                    <div className="banner-info-box">
                                        <i className="bx bx-info-circle banner-info-icon"></i>
                                        <span>
                                            Dịch vụ được sắp xếp theo mức độ phù hợp với mô tả của bạn.
                                            Dịch vụ đầu tiên là phù hợp nhất.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Bước 2: Chọn loại đặt lịch */}
                    {step === 1 && (
                        <div>
                            <div className="banner-info-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <i className="bx bx-calendar banner-info-header-icon"></i>
                                    <div className="banner-info-header-title">
                                        Chọn loại đặt lịch
                                    </div>
                                </div>
                                <div className="banner-info-header-subtitle">
                                    Bạn muốn đặt lịch ngay hay lên lịch trước?
                                </div>
                            </div>

                            <div className="banner-booking-cards">
                                <div
                                    className={`banner-booking-card ${bookingType === 'urgent' ? 'selected' : ''}`}
                                    onClick={() => setBookingType('urgent')}
                                >
                                    {/* Radio button */}
                                    <div className={`banner-service-radio ${bookingType === 'urgent' ? 'selected' : ''}`} style={{ top: '16px', right: '16px', left: 'auto' }}>
                                        {bookingType === 'urgent' && (
                                            <div className="banner-service-radio-dot"></div>
                                        )}
                                    </div>

                                    <div className="banner-booking-content">
                                        <div className="banner-booking-icon banner-booking-icon-urgent">
                                            <i className="bx bxs-bolt"></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="banner-booking-title">
                                                Đặt ngay
                                            </div>
                                            <div className="banner-booking-subtitle">
                                                Kỹ thuật viên sẽ đến trong 20-40 phút
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`banner-booking-card ${bookingType === 'scheduled' ? 'selected' : ''}`}
                                    onClick={() => setBookingType('scheduled')}
                                >
                                    {/* Radio button */}
                                    <div className={`banner-service-radio ${bookingType === 'scheduled' ? 'selected' : ''}`} style={{ top: '16px', right: '16px', left: 'auto' }}>
                                        {bookingType === 'scheduled' && (
                                            <div className="banner-service-radio-dot"></div>
                                        )}
                                    </div>

                                    <div className="banner-booking-content">
                                        <div className="banner-booking-icon banner-booking-icon-scheduled">
                                            <i className="bx bx-calendar"></i>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="banner-booking-title">
                                                Đặt lịch
                                            </div>
                                            <div className="banner-booking-subtitle">
                                                Chọn thời gian linh hoạt theo lịch của bạn
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bước 3: Form booking */}
                    {step === 2 && (
                        <div>
                            <div className="banner-info-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <i className="bx bx-edit banner-info-header-icon"></i>
                                    <div className="banner-info-header-title">
                                        Thông tin đặt lịch
                                    </div>
                                </div>
                                <div className="banner-info-header-subtitle">
                                    Vui lòng điền đầy đủ thông tin để đặt lịch dịch vụ
                                </div>
                            </div>

                            <form onSubmit={handleSubmitBooking}>
                                {/* Hiển thị dịch vụ đã chọn */}
                                <div className="banner-selected-service">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <i className="bx bx-check-circle" style={{ fontSize: '18px' }}></i>
                                        <div className="banner-selected-service-title">
                                            Dịch vụ đã chọn
                                        </div>
                                    </div>
                                    <div className="banner-selected-service-info">
                                        {searchResults[selectedServiceIdx]?.serviceName}
                                        {searchResults[selectedServiceIdx]?.price && (
                                            <span> - {searchResults[selectedServiceIdx].price.toLocaleString()} VNĐ</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3" style={{ position: 'relative' }}>
                                    <label className="form-label banner-form-label">
                                        Vị trí <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control banner-form-input ${errors.addressInput ? 'error' : ''}`}
                                        value={bookingLocation}
                                        onChange={e => {
                                            setBookingLocation(e.target.value);
                                            if (e.target.value.trim().length >= 3) {
                                                setShowLocationSuggestions(true);
                                            } else {
                                                setShowLocationSuggestions(false);
                                            }
                                        }}
                                        onFocus={() => {
                                            if (bookingLocation.trim().length >= 3) {
                                                setShowLocationSuggestions(true);
                                            }
                                        }}
                                        onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                                        ref={locationInputRef}
                                        required
                                        autoComplete="off"
                                        placeholder="Nhập địa chỉ, ví dụ: 105 Lê Duẩn, Đà Nẵng"
                                    />
                                    {addressLoading && <div className="banner-form-loading">Đang tìm gợi ý...</div>}
                                    {addressError && <div className="banner-form-error">{addressError}</div>}
                                    {showLocationSuggestions && addressSuggestions.length > 0 && (
                                        <ul className="banner-address-suggestions">
                                            {addressSuggestions.map((s, idx) => (
                                                <li
                                                    key={s.id || s.title + idx}
                                                    className="banner-address-item"
                                                    onMouseDown={() => {
                                                        setBookingLocation(s.address?.label || s.title);
                                                        setShowLocationSuggestions(false);
                                                        setTimeout(() => locationInputRef.current?.blur(), 0);
                                                    }}
                                                >
                                                    {s.address?.label || s.title}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.addressInput && <div className="banner-form-error">{errors.addressInput}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label banner-form-label">
                                        Mô tả tình trạng <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className={`form-control banner-form-textarea ${errors.description ? 'error' : ''}`}
                                        value={bookingDescription}
                                        onChange={e => setBookingDescription(e.target.value)}
                                        required
                                        placeholder="Mô tả chi tiết tình trạng bạn gặp phải..."
                                    />
                                    {errors.description && <div className="banner-form-error">{errors.description}</div>}
                                </div>

                                {/* Nếu là scheduled thì nhập ngày, giờ bắt đầu, giờ kết thúc */}
                                {bookingType === 'scheduled' && (
                                    <div className="banner-schedule-section">
                                        <div className="banner-schedule-header">
                                            <i className="bx bx-time banner-info-icon"></i>
                                            <span className="banner-schedule-title">Thông tin lịch hẹn</span>
                                        </div>

                                        <div className="banner-schedule-inputs">
                                            <div className="banner-schedule-input-group">
                                                <label className="form-label banner-form-label">
                                                    Ngày đặt lịch <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className={`form-control banner-form-input ${errors.scheduleDate ? 'error' : ''}`}
                                                    value={bookingDate}
                                                    onChange={e => setBookingDate(e.target.value)}
                                                    required
                                                />
                                                {errors.scheduleDate && <div className="banner-form-error">{errors.scheduleDate}</div>}
                                            </div>
                                        </div>

                                        <div className="banner-schedule-time-inputs">
                                            <label className="form-label banner-form-label">
                                                Thời gian <span className="text-danger">*</span>
                                            </label>

                                            <div className="banner-schedule-time-inputs-row">
                                                <div className="banner-schedule-input-group">
                                                    <input
                                                        type="time"
                                                        className={`form-control banner-form-input ${errors.startTime ? 'error' : ''}`}
                                                        value={bookingTime}
                                                        onChange={e => setBookingTime(e.target.value)}
                                                        required
                                                        placeholder="Từ"
                                                    />
                                                    {errors.startTime && <div className="banner-form-error">{errors.startTime}</div>}
                                                </div>
                                                <div className="banner-schedule-input-separator">
                                                    <span>-</span>
                                                </div>
                                                <div className="banner-schedule-input-group">
                                                    <input
                                                        type="time"
                                                        className={`form-control banner-form-input ${errors.endTime ? 'error' : ''}`}
                                                        value={bookingEndTime}
                                                        onChange={e => setBookingEndTime(e.target.value)}
                                                        required
                                                        placeholder="Đến"
                                                    />
                                                    {errors.endTime && <div className="banner-form-error">{errors.endTime}</div>}
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

                                <div className="mb-3">
                                    <label className="form-label banner-form-label">
                                        Hình ảnh (tùy chọn)
                                    </label>
                                    <ImageUploader onFilesSelect={handleBookingImages} />
                                    {errors.images && <div className="banner-form-error">{errors.images}</div>}
                                </div>

                                {formError && (
                                    <div className="alert alert-danger banner-alert-danger">
                                        <i className="bx bx-error-circle"></i>
                                        {formError}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="banner-modal-footer">
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="banner-btn-outline"
                        >
                            Quay lại
                        </button>
                    )}
                    {step === 0 && (
                        <button
                            type="button"
                            onClick={handleContinueService}
                            disabled={searchResults.length === 0}
                            className="banner-btn-primary"
                        >
                            Tiếp tục
                        </button>
                    )}
                    {step === 1 && (
                        <button
                            type="button"
                            onClick={handleContinueType}
                            className="banner-btn-primary"
                        >
                            Tiếp tục
                        </button>
                    )}
                    {step === 2 && (
                        <button
                            type="submit"
                            onClick={handleSubmitBooking}
                            disabled={submitting}
                            className="banner-btn-primary"
                        >
                            {submitting ? 'Đang xử lý...' : 'Đặt lịch & chọn kỹ thuật viên'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => { setShowSearchModal(false); setShowBookingForm(false); setStep(0); }}
                        className="banner-btn-secondary"
                    >
                        Đóng
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Banner;
