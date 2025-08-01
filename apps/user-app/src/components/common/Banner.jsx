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
        dispatch(fetchPopularDescriptions(8));
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
        if (!searchValue.trim()) return;
        dispatch(fetchSuggestServices(searchValue)).then(() => {
            setShowSearchModal(true);
            setSelectedServiceIdx(0);
            setShowBookingForm(false);
            setBookingDescription(searchValue);
            setStep(0);
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
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                zIndex: 1000,
                                                background: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                maxHeight: '300px',
                                                overflowY: 'auto'
                                            }}>
                                                {/* Gợi ý tìm kiếm */}
                                                {searchValue && searchValue.trim().length >= 2 && (
                                                    <>
                                                        {suggestionSearchLoading && (
                                                            <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                                                <Spinner size="sm" animation="border" /> Đang tìm kiếm...
                                                            </div>
                                                        )}
                                                        {suggestionSearchResults.length > 0 && (
                                                            <div>
                                                                {/* <div style={{ 
                                                                    padding: '8px 12px', 
                                                                    background: '#f8f9fa', 
                                                                    borderBottom: '1px solid #dee2e6',
                                                                    fontSize: '12px',
                                                                    fontWeight: 'bold',
                                                                    color: '#495057'
                                                                }}>
                                                                    Kết quả tìm kiếm
                                                                </div> */}
                                                                {suggestionSearchResults.map((suggestion, idx) => (
                                                                    <div
                                                                        key={`search-${idx}`}
                                                                        style={{
                                                                            padding: '10px 12px',
                                                                            cursor: 'pointer',
                                                                            borderBottom: '1px solid #f0f0f0',
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center'
                                                                        }}
                                                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                                        onMouseLeave={(e) => e.target.style.background = '#fff'}
                                                                    >
                                                                        <span>{suggestion.description}</span>
                                                                        {/* <small style={{ color: '#6c757d' }}>
                                                                            {suggestion.count} lần sử dụng
                                                                        </small> */}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {/* Gợi ý phổ biến */}
                                                {(!searchValue || searchValue.trim().length < 2) && popularDescriptions.length > 0 && (
                                                    <div>
                                                        {/* <div style={{ 
                                                            padding: '8px 12px', 
                                                            background: '#f8f9fa', 
                                                            borderBottom: '1px solid #dee2e6',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            color: '#495057'
                                                        }}>
                                                            Mô tả phổ biến
                                                        </div> */}
                                                        {popularDescriptions.map((suggestion, idx) => (
                                                            <div
                                                                key={`popular-${idx}`}
                                                                style={{
                                                                    padding: '10px 12px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid #f0f0f0',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                                                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                                onMouseLeave={(e) => e.target.style.background = '#fff'}
                                                            >
                                                                <span>{suggestion.description}</span>
                                                                {/* <small style={{ color: '#6c757d' }}>
                                                                    {suggestion.count} lần sử dụng
                                                                </small> */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {/* Thông báo không có kết quả */}
                                                {/* {searchValue && searchValue.trim().length >= 2 && !suggestionSearchLoading && suggestionSearchResults.length === 0 && (
                                                    <div style={{ padding: '12px', textAlign: 'center', color: '#666' }}>
                                                        Không tìm thấy gợi ý phù hợp
                                                    </div>
                                                )} */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="search-btn">
                                <button className="btn btn-primary" type="submit">
                                    <i className="bx bx-search-alt"></i>
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
            <Modal show={showSearchModal} onHide={() => { setShowSearchModal(false); setShowBookingForm(false); setStep(0); }}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {step === 0 && 'Kết quả dịch vụ phù hợp'}
                        {step === 1 && 'Chọn loại đặt lịch'}
                        {step === 2 && 'Đặt lịch dịch vụ'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Bước 1: Chọn dịch vụ */}
                    {step === 0 && (
                        <>
                            {searchStatus === 'loading' && <div>Đang tìm kiếm...</div>}
                            {searchError && <div className="alert alert-danger">{searchError}</div>}
                            {searchStatus === 'succeeded' && searchResults.length === 0 && (
                                <div>Không tìm thấy dịch vụ phù hợp.</div>
                            )}
                            {searchStatus === 'succeeded' && searchResults.length > 0 && (
                                <form>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {searchResults.map((service, idx) => (
                                            <li key={service._id || idx} style={{ marginBottom: 10 }}>
                                                <label style={{ cursor: 'pointer', width: '100%' }}>
                                                    <input
                                                        type="radio"
                                                        name="selectedService"
                                                        checked={selectedServiceIdx === idx}
                                                        onChange={() => setSelectedServiceIdx(idx)}
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <strong>{service.serviceName}</strong>
                                                    {service.price && (
                                                        <span> - {service.price.toLocaleString()} VNĐ</span>
                                                    )}
                                                    <div className="text-muted">{service.description}</div>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </form>
                            )}
                        </>
                    )}
                    {/* Bước 2: Chọn loại đặt lịch */}
                    {step === 1 && (
                        <form>
                            <div className="mb-3">
                                <section className="">
                                    <div className="container">
                                        <div className="row align-items-center">
                                            <div style={{ justifyContent: 'space-between' }} className="feature-item flex-fill" onClick={() => setBookingType('urgent')}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span className="feature-icon">
                                                        <i className="bx bxs-info-circle"></i>
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-1">Đặt ngay</h6>
                                                        <p>(Sẽ đến trong 20 - 40 phút)</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="bookingType"
                                                    value="urgent"
                                                    checked={bookingType === 'urgent'}
                                                    onChange={() => setBookingType('urgent')}
                                                />
                                            </div>

                                            <div style={{ justifyContent: 'space-between' }} className="feature-item flex-fill" onClick={() => setBookingType('scheduled')}>

                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span className="feature-icon">
                                                        <i className="bx bx-exclude"></i>
                                                    </span>
                                                    <div>
                                                        <h6 className="mb-1">Đặt lịch</h6>
                                                        <p>(Chọn thời gian linh hoạt theo lịch của bạn)</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="bookingType"
                                                    value="scheduled"
                                                    checked={bookingType === 'scheduled'}
                                                    onChange={() => setBookingType('scheduled')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </form>
                    )}
                    {/* Bước 3: Form booking */}
                    {step === 2 && (
                        <form onSubmit={handleSubmitBooking}>
                            {/* Hiển thị dịch vụ đã chọn */}
                            <div className="mb-3 p-2" style={{ background: '#f6f6f6', borderRadius: 8 }}>
                                <div><b>Dịch vụ đã chọn:</b> {searchResults[selectedServiceIdx]?.serviceName} {searchResults[selectedServiceIdx]?.price && (<span>- {searchResults[selectedServiceIdx].price.toLocaleString()} VNĐ</span>)}
                                </div>
                                <div className="text-muted">{searchResults[selectedServiceIdx]?.description}</div>
                            </div>
                            <div className="mb-3" style={{ position: 'relative' }}>
                                <label className="form-label">Vị trí <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={bookingLocation}
                                    onChange={e => {
                                        setBookingLocation(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    ref={locationInputRef}
                                    required
                                    autoComplete="off"
                                    placeholder="Nhập địa chỉ, ví dụ: 105 lê ..."
                                />
                                {addressLoading && <div style={{ fontSize: 13, color: '#888' }}>Đang tìm gợi ý...</div>}
                                {addressError && <div style={{ color: 'red', fontSize: 13 }}>{addressError}</div>}
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <ul style={{
                                        position: 'absolute',
                                        zIndex: 10,
                                        background: '#fff',
                                        border: '1px solid #ddd',
                                        width: '100%',
                                        maxHeight: 180,
                                        overflowY: 'auto',
                                        margin: 0,
                                        padding: 0,
                                        listStyle: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                    }}>
                                        {addressSuggestions.map((s, idx) => (
                                            <li
                                                key={s.id || s.title + idx}
                                                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                                                onMouseDown={() => {
                                                    setBookingLocation(s.address?.label || s.title);
                                                    setShowSuggestions(false);
                                                    setTimeout(() => locationInputRef.current?.blur(), 0);
                                                }}
                                            >
                                                {s.address?.label || s.title}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.addressInput && <div style={{ color: 'red', fontSize: 13 }}>{errors.addressInput}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Mô tả tình trạng <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    value={bookingDescription}
                                    onChange={e => setBookingDescription(e.target.value)}
                                    required
                                />
                                {errors.description && <div style={{ color: 'red', fontSize: 13 }}>{errors.description}</div>}
                            </div>
                            {/* Nếu là scheduled thì nhập ngày, giờ bắt đầu, giờ kết thúc */}
                            {bookingType === 'scheduled' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Ngày đặt lịch <span className="text-danger">*</span></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={bookingDate}
                                            onChange={e => setBookingDate(e.target.value)}
                                            required
                                        />
                                        {errors.scheduleDate && <div style={{ color: 'red', fontSize: 13 }}>{errors.scheduleDate}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Giờ bắt đầu <span className="text-danger">*</span></label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={bookingTime}
                                            onChange={e => setBookingTime(e.target.value)}
                                            required
                                        />
                                        {errors.startTime && <div style={{ color: 'red', fontSize: 13 }}>{errors.startTime}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Giờ kết thúc <span className="text-danger">*</span></label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={bookingEndTime}
                                            onChange={e => setBookingEndTime(e.target.value)}
                                            required
                                        />
                                        {errors.endTime && <div style={{ color: 'red', fontSize: 13 }}>{errors.endTime}</div>}
                                    </div>
                                </>
                            )}
                            <ImageUploader onFilesSelect={handleBookingImages} />
                            {errors.images && <div style={{ color: 'red', fontSize: 13 }}>{errors.images}</div>}
                            {formError && <div className="alert alert-danger mt-2">{formError}</div>}
                        </form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {step > 0 && (
                        <Button variant="secondary" onClick={() => setStep(step - 1)}>
                            Quay lại
                        </Button>
                    )}
                    {step === 0 && (
                        <Button variant="primary" onClick={handleContinueService} disabled={searchResults.length === 0}>
                            Tiếp tục
                        </Button>
                    )}
                    {step === 1 && (
                        <Button variant="primary" onClick={handleContinueType}>
                            Tiếp tục
                        </Button>
                    )}
                    {step === 2 && (
                        <Button variant="primary" type="submit" onClick={handleSubmitBooking} disabled={submitting}>
                            {submitting ? <Spinner size="sm" animation="border" /> : 'Đặt lịch & chọn kỹ thuật viên'}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => { setShowSearchModal(false); setShowBookingForm(false); setStep(0); }}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Banner;
