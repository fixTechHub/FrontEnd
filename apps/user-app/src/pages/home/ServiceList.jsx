import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { Spinner, Button, Modal } from "react-bootstrap";
import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import { createNewBooking } from '../../features/bookings/bookingSlice';
import ImageUploader from '../booking/common/ImageUploader';
import { validateBookingData } from '../../validations/bookingValidation';

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

        // Validate
        let newErrors = {};
        if (bookingType === 'scheduled') {
            const bookingData = {
                service: selectedService,
                description: bookingDescription,
                scheduleDate: bookingDate,
                startTime: bookingTime,
                endTime: bookingEndTime,
                images: bookingImages
            };
            newErrors = validateBookingData(
                bookingData,
                bookingLocation,
                true,
                bookingType
            );
        } else {
            if (!bookingLocation || bookingLocation.trim().length < 5) newErrors.addressInput = 'Vui lòng nhập địa chỉ hợp lệ của bạn.';
            if (!bookingDescription || bookingDescription.trim().length < 10) newErrors.description = 'Vui lòng nhập mô tả chi tiết (tối thiểu 10 ký tự).';
            if (bookingImages && bookingImages.length > 5) newErrors.images = 'Chỉ được tải lên tối đa 5 ảnh.';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            setFormError('Vui lòng kiểm tra lại thông tin!');
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
            <>
                <Spinner animation="border" variant="warning" />
                <h6>Đang tải dữ liệu</h6>
            </>
        );

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Danh Sách Dịch Vụ'} subtitle={'Services List'} />

            <div className="main-wrapper listing-page mt-3  ">
                <div className="sort-section">
                    <div className="container">
                        <div className="sortby-sec">
                            <div className="sorting-div">
                                <div className="row d-flex align-items-center">
                                    <div className="col-xl-4 col-lg-3 col-sm-12 col-12">
                                        {/* <div className="count-search">
                                            <p>Showing 1-9 of 154 Cars</p>
                                        </div> */}
                                    </div>
                                    <div className="col-xl-8 col-lg-9 col-sm-12 col-12">
                                        <div className="product-filter-group">
                                            <div className="sortbyset">
                                                <ul>
                                                    <li>
                                                        <span className="sortbytitle">Sort By </span>
                                                        <div className="sorting-select select-two">
                                                            <select className="form-control select">
                                                                <option>Newest</option>
                                                                <option>Relevance</option>
                                                                <option>Best Rated</option>
                                                            </select>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="section car-listing pt-0">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-3 col-lg-4 col-sm-12 col-12 theiaStickySidebar">
                                <form action="#" autoComplete="off" className="sidebar-form">
                                    <div className="product-search">
                                        <div className="form-custom">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="member_search1"
                                                placeholder="Nhập để tìm kiếm"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                                            />

                                            <span><img src="/img/icons/search.svg" alt="Search" /></span>
                                        </div>
                                    </div>

                                    <div className="accord-list">
                                        <div className="accordion" id="accordionMain1">
                                            <div className="card-header-new" id="headingOne">
                                                <h6 className="filter-title">
                                                    <a href="javascript:void(0);" className="w-100" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                                        Danh mục
                                                        <span className="float-end"><i className="fa-solid fa-chevron-down"></i></span>
                                                    </a>
                                                </h6>
                                            </div>
                                            <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample1">
                                                <div className="card-body-chat">
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div id="checkBoxes1">
                                                                <div className="selectBox-cont">
                                                                    {categories.map((category) => (
                                                                        <label className="custom_check w-100">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="categories"
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
                                                                            <span className="checkmark"></span>  {category.categoryName}
                                                                        </label>
                                                                    ))}

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <button type="submit" className="d-inline-flex align-items-center justify-content-center btn w-100 btn-primary filter-btn">
                                        <span><i className="feather-filter me-2"></i></span>Filter results
                                    </button>
                                    <a href="#" className="reset-filter">Reset Filter</a> */}
                                </form>
                            </div>

                            <div className="col-lg-9">
                                <div className="row">
                                    {currentServices.length === 0 ? (
                                        <div className="col-12 text-center py-5">
                                            <h5>Không tìm thấy dịch vụ phù hợp.</h5>
                                        </div>
                                    ) : (
                                        currentServices.map((service) => (
                                            <div className="col-xxl-4 col-lg-6 col-md-6 col-12">
                                                <div className="listing-item">
                                                    <div className="listing-img" style={{ height: 184 }}>
                                                        <a href="listing-details.html">
                                                            <img src={service.icon} className="img-fluid" alt="Audi" />
                                                        </a>
                                                    </div>

                                                    <div className="listing-content">
                                                        <div className="listing-features d-flex align-items-end justify-content-between"
                                                            style={{ paddingBottom: 5, marginBottom: 8 }}
                                                        >
                                                            <div className="list-rating">
                                                                <h3 className="listing-title">
                                                                    <a href="listing-details.html"
                                                                        title={service?.serviceName}
                                                                    >{service?.serviceName}</a>
                                                                </h3>
                                                                {/* <div className="list-rating">
                                                            <>Loại dịch vụ: <>Đơn giản</></>
                                                        </div> */}
                                                            </div>
                                                        </div>

                                                        <div className="listing-details-group two-line-ellipsis" title={service?.description}>
                                                            <p>{service?.description}</p>
                                                        </div>

                                                        {/* <div className="listing-location-details" style={{ marginTop: 30 }}>
                                                            <div className="listing-price">
                                                                <span>
                                                                    <i className="feather-map-pin"></i>
                                                                </span>
                                                                Mức Giá
                                                            </div>

                                                            <div className="listing-price">
                                                                <h6><span>Liên hệ</span></h6>
                                                            </div>
                                                        </div> */}

                                                        <div className="button-container">
                                                            <button href="listing-details.html" className="custom-button"
                                                                onClick={() => handleOpenBookingModal(service, 'scheduled')}
                                                            >
                                                                <i className="feather-calendar me-2"></i>
                                                                Đặt Lịch
                                                            </button>
                                                            <button href="contact.html" className="custom-button-secondary"
                                                                onClick={() => handleOpenBookingModal(service, 'urgent')}
                                                            >
                                                                <i className="feather-calendar me-2"></i>
                                                                Đặt Ngay
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        )))}

                                </div>

                                {totalPages > 1 && (
                                    <div className="blog-pagination">
                                        <nav>
                                            <ul className="pagination page-item justify-content-center">
                                                {/* <li className="previtem">
                                                <a className="page-link" href="#">
                                                    <i className="fas fa-regular fa-arrow-left me-2"></i> Prev
                                                </a>
                                            </li> */}
                                                <li className={`previtem ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <a className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                                        <i className="fas fa-regular fa-arrow-left"></i>
                                                    </a>
                                                </li>

                                                <li className="justify-content-center pagination-center">
                                                    <div className="page-group">
                                                        <ul>
                                                            {[...Array(totalPages)].map((_, index) => (
                                                                <li key={index} className="page-item">
                                                                    <a
                                                                        className={`${currentPage === index + 1 ? 'active page-link' : 'page-link'}`}
                                                                        onClick={() => handlePageChange(index + 1)}>
                                                                        {index + 1}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </li>

                                                <li className={`nextlink ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <a className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                                        <i className="fas fa-regular fa-arrow-right"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </section>
            </div>

            {/* Modal đặt lịch */}
            <Modal show={showBookingModal} onHide={handleCloseBookingModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Đặt lịch dịch vụ - {selectedService?.serviceName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmitBooking}>
                        {/* Hiển thị dịch vụ đã chọn */}
                        <div className="mb-3 p-2" style={{ background: '#f6f6f6', borderRadius: 8 }}>
                            <div><b>Dịch vụ đã chọn:</b> {selectedService?.serviceName} {selectedService?.price && (<span>- {selectedService.price.toLocaleString()} VNĐ</span>)}
                            </div>
                            <div className="text-muted">{selectedService?.description}</div>
                        </div>

                        {/* Loại đặt lịch */}
                        <div className="mb-3">
                            <label className="form-label">Loại đặt lịch <span className="text-danger">*</span></label>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="bookingType"
                                            id="urgent"
                                            value="urgent"
                                            checked={bookingType === 'urgent'}
                                            onChange={() => setBookingType('urgent')}
                                        />
                                        <label className="form-check-label" htmlFor="urgent">
                                            <strong>Đặt ngay</strong>
                                            <br />
                                            <small className="text-muted">(Sẽ đến trong 20 - 40 phút)</small>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="bookingType"
                                            id="scheduled"
                                            value="scheduled"
                                            checked={bookingType === 'scheduled'}
                                            onChange={() => setBookingType('scheduled')}
                                        />
                                        <label className="form-check-label" htmlFor="scheduled">
                                            <strong>Đặt lịch</strong>
                                            <br />
                                            <small className="text-muted">(Chọn thời gian linh hoạt theo lịch của bạn)</small>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="mb-3" style={{ position: 'relative' }}>
                            <label className="form-label">Vị trí <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                value={bookingLocation}
                                onChange={e => {
                                    setBookingLocation(e.target.value);
                                    setShowAddressSuggestions(true);
                                }}
                                onFocus={() => setShowAddressSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                                ref={locationInputRef}
                                required
                                autoComplete="off"
                                placeholder="Nhập địa chỉ, ví dụ: 105 lê ..."
                            />
                            {addressLoading && <div style={{ fontSize: 13, color: '#888' }}>Đang tìm gợi ý...</div>}
                            {addressError && <div style={{ color: 'red', fontSize: 13 }}>{addressError}</div>}
                            {showAddressSuggestions && addressSuggestions.length > 0 && (
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
                                                setShowAddressSuggestions(false);
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

                        {/* Mô tả */}
                        <div className="mb-3">
                            <label className="form-label">Mô tả tình trạng <span className="text-danger">*</span></label>
                            <textarea
                                className="form-control"
                                value={bookingDescription}
                                onChange={e => setBookingDescription(e.target.value)}
                                required
                                rows={3}
                                placeholder="Mô tả chi tiết tình trạng bạn gặp phải..."
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

                        {/* Upload ảnh */}
                        <div className="mb-3">
                            <label className="form-label">Hình ảnh (tùy chọn)</label>
                            <ImageUploader onFilesSelect={handleBookingImages} />
                            {errors.images && <div style={{ color: 'red', fontSize: 13 }}>{errors.images}</div>}
                        </div>

                        {formError && <div className="alert alert-danger mt-2">{formError}</div>}
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseBookingModal}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" onClick={handleSubmitBooking} disabled={submitting}>
                        {submitting ? <Spinner size="sm" animation="border" /> : 'Đặt lịch & chọn kỹ thuật viên'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ServiceList;
