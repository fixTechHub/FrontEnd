import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingWizard from "./common/BookingHeader";
import Map from "../../components/map/Map";
import ServiceSelector from "./common/ServiceSelector";
import ImageUploader from "./common/ImageUploader";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { useCallback, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createNewBooking } from "../../features/bookings/bookingSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { useBookingParams } from "../../hooks/useBookingParams";
//import { validateBookingData } from "../../validations/bookingValidation";

function BookingPage() {
    const { categories, status: categoryStatus } = useSelector((state) => state.categories);
    const { services, status: serviceStatus } = useSelector((state) => state.services);
    const newBooking = useSelector(state => state.booking.newBooking); console.log('--- GET BOOKING CREATED ---', newBooking)
    const { stepsForCurrentUser } = useBookingParams();
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const serviceId = searchParams.get('serviceId');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Địa chỉ khách nhập
    const [addressInput, setAddressInput] = useState("");
    // Địa chỉ từ map/geocode (gợi ý)
    const [mapAddress, setMapAddress] = useState("");
    // Tọa độ marker
    const [geoJson, setGeoJson] = useState(null);

    const [bookingData, setBookingData] = useState({
        service: '',
        description: '',
        scheduleDate: '',
        startTime: '',
        endTime: '',
        images: []
    });

    const handleAddressInput = (e) => {
        setAddressInput(e.target.value);
    };

    const handleConfirmAddress = (e) => {
        e.preventDefault();
        // Truyền addressInput cho Map để geocode
        setMapAddress(""); // reset gợi ý trước đó
        setGeoJson(null); // reset geoJson trước đó

        setTimeout(() => setMapAddress(addressInput), 0);
    };

    const handleLocationChange = useCallback((address, geo) => {
        setMapAddress(address || ""); // chỉ cập nhật gợi ý, không ghi đè input
        setGeoJson(geo);
    }, []);

    const handleUseMapAddress = () => {
        setAddressInput(mapAddress);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilesSelect = (files) => {
        setBookingData(prev => ({ ...prev, images: files }));
    };

    const handleServiceChange = (service) => {
        console.log('Service selected:', service);
        setBookingData(prev => ({
            ...prev,
            service: service
        }));
    };

    // Auto-select service when serviceId is provided in URL
    useEffect(() => {
        console.log('Auto-select effect:', { serviceId, servicesLength: services.length });
        if (serviceId && services.length > 0) {
            const selectedService = services.find(service => service._id === serviceId);
            console.log('Found service:', selectedService);
            if (selectedService) {
                setBookingData(prev => ({
                    ...prev,
                    service: selectedService
                }));
                console.log('Service auto-selected:', selectedService.serviceName);
            }
        }
    }, [serviceId, services]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // const newErrors = validateBookingData(bookingData, addressInput, geoJson, type);
        // setErrors(newErrors);
        // if (Object.keys(newErrors).length > 0) {
        //     return;
        // }

        const startDateTime = new Date(`${bookingData?.scheduleDate}T${bookingData?.startTime}`);
        const endDateTime = new Date(`${bookingData?.scheduleDate}T${bookingData?.endTime}`);

        const formData = new FormData();

        // Validate service is selected
        if (!bookingData.service?._id) {
            alert('Vui lòng chọn dịch vụ!');
            return;
        }

        console.log('Submitting with service:', bookingData.service);
        formData.append('type', type);
        formData.append('serviceId', bookingData.service._id);
        formData.append('address', addressInput); // địa chỉ khách nhập
        formData.append('geoJson', JSON.stringify(geoJson)); // vị trí marker
        formData.append('description', bookingData.description);
        if (type === 'scheduled') {
            formData.append('startTime', startDateTime.toISOString());
            formData.append('endTime', endDateTime.toISOString());
        }

        if (bookingData.images && bookingData.images.length > 0) {
            bookingData.images.forEach(file => {
                formData.append('images', file);
            });
        }
        // console.log('Files to upload:', bookingData.images);

        try {
            console.log("Đang gửi FormData đến backend...");
            console.log("Selected service:", bookingData.service);
            console.log("Service ID:", bookingData.service?._id);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const actionResult = await dispatch(createNewBooking(formData));
            const bookingResult = unwrapResult(actionResult);

            // console.log('--- RES BOOKING ---', res);
            // console.log('--- RES BOOKING ID ---', res.data._id);

            if (bookingResult?.booking?._id) {
                navigate(`/booking/choose-technician?bookingId=${bookingResult?.booking?._id}`);
            } else {
                alert('Đặt lịch thành công nhưng không thể chuyển sang trang chọn kỹ thuật viên!');
            }
        } catch (error) {
            alert('Đặt lịch thất bại!');
            console.error(error);
        }
    };

    // Show loading if services are still loading
    if (serviceStatus === 'loading' || categoryStatus === 'loading') {
        return (
            <>
                <Header />
                <BreadcrumbBar title={'Đặt Lịch Sửa Chữa'} subtitle={'Create Your Booking Service'} />
                <div className="booking-new-module">
                    <div className="container">
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="warning" />
                            <h6 className="mt-3">Đang tải dữ liệu...</h6>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Đặt Lịch Sửa Chữa'} subtitle={'Create Your Booking Service'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={1} />
                    <form onSubmit={handleSubmit} className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="booking-information-main">
                                    <div>
                                        <div className="booking-information-card delivery-location">
                                            <div className="booking-info-head">
                                                <span><i className="bx bxs-map"></i></span>
                                                <h5>Vị trí</h5>
                                            </div>
                                            <div className="booking-info-body">
                                                <div className="form-custom">
                                                    <div className="d-flex align-items-center">
                                                        <input
                                                            name="address"
                                                            type="text"
                                                            className="form-control mb-0"
                                                            placeholder="Nhập vị trí của bạn (ví dụ: 105 Nguyễn Nhàn, Cẩm Lệ, Đà Nẵng)"
                                                            value={addressInput}
                                                            onChange={handleAddressInput}
                                                        />
                                                        <a
                                                            className="btn btn-secondary location-btn"
                                                            onClick={handleConfirmAddress}
                                                        >
                                                            <i className="bx bxs-map-alt me-2"></i>Tìm trên bản đồ
                                                        </a>
                                                    </div>
                                                    {errors.addressInput && (
                                                        <div style={{ color: 'red', fontSize: 13, marginTop: 2, marginLeft: 10 }}>{errors.addressInput}</div>
                                                    )}
                                                </div>
                                                <div style={{ marginTop: 20 }}>
                                                    <Map
                                                        address={mapAddress || addressInput}
                                                        onLocationChange={handleLocationChange}
                                                    />
                                                    {mapAddress && (
                                                        <div style={{ marginTop: 14, fontSize: 15, color: '#888', textAlign: 'center' }}>
                                                            Địa chỉ trên bản đồ: {mapAddress}
                                                            <a className="btn btn-secondary"
                                                                onClick={handleUseMapAddress}
                                                                style={{ marginLeft: 8, fontSize: 14 }}
                                                            >Dùng địa chỉ này</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="input-block">
                                    <label className="form-label">
                                        Dịch vụ <span className="text-danger">*</span>
                                    </label>
                                    <ServiceSelector
                                        categories={categories}
                                        services={services}
                                        onServiceChange={handleServiceChange}
                                        selectedServiceName={bookingData.service?.serviceName}
                                    />
                                    {errors.service && (
                                        <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.service}</div>
                                    )}
                                </div>

                                <div className="input-block">
                                    <label className="form-label">
                                        Mô tả <span className="text-danger">*</span>
                                    </label>
                                    <div className="group-img">
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            placeholder="Nhập mô tả tình trạng bạn gặp phải..."
                                            value={bookingData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.description && (
                                        <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.description}</div>
                                    )}
                                </div>

                                {type === 'scheduled' && (
                                    <>
                                        <div className="input-block">
                                            <label className="form-label">
                                                Ngày đặt lịch <span className="text-danger">*</span>
                                            </label>
                                            <div className="group-img">
                                                <input
                                                    name="scheduleDate"
                                                    type="date"
                                                    className="form-control"
                                                    value={bookingData.scheduleDate}
                                                    onChange={handleInputChange}
                                                />
                                                {/* <span className="input-cal-icon"><i className="bx bx-calendar"></i></span> */}
                                            </div>
                                            {errors.scheduleDate && (
                                                <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.scheduleDate}</div>
                                            )}
                                        </div>

                                        <div className="input-block">
                                            <label className="form-label">
                                                Thời gian bắt đầu <span className="text-danger">*</span>
                                            </label>
                                            <div className="group-img">
                                                <input
                                                    name="startTime"
                                                    type="time"
                                                    className="form-control"
                                                    value={bookingData.startTime}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            {errors.startTime && (
                                                <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.startTime}</div>
                                            )}
                                        </div>

                                        <div className="input-block">
                                            <label className="form-label">
                                                Thời gian kết thúc <span className="text-danger">*</span>
                                            </label>
                                            <div className="group-img">
                                                <input
                                                    name="endTime"
                                                    type="time"
                                                    className="form-control"
                                                    value={bookingData.endTime}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            {errors.endTime && (
                                                <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.endTime}</div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <ImageUploader onFilesSelect={handleFilesSelect} />
                                {errors.images && (
                                    <div style={{ color: 'red', fontSize: 13, marginTop: 2 }}>{errors.images}</div>
                                )}

                                <div style={{ position: 'relative', bottom: 0 }} className="booking-info-btns d-flex justify-content-end">
                                    <button type="submit" className="btn btn-primary continue-book-btn">Đặt dịch vụ</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default BookingPage;

