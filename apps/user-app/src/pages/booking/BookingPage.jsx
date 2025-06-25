import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingWizard from "./common/BookingHeader";
import Map from "../../components/map/Map";
import ServiceSelector from "./common/ServiceSelector";
import ImageUploader from "./common/ImageUploader";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createNewBooking } from "../../features/bookings/bookingSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { customerSteps, technicianSteps } from "../../utils/stepsData";

function BookingPage() {
    const { categories, status: categoryStatus } = useSelector((state) => state.categories);
    const { services, status: serviceStatus } = useSelector((state) => state.services);
    const { user } = useSelector((state) => state.auth);
    const stepsForCurrentUser = user.role.name === 'CUSTOMER' ? customerSteps : technicianSteps;

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
        scheduleTime: '',
        images: []
    });

    const handleServiceChange = useCallback((service) => {
        setBookingData(prev => ({ ...prev, service }));
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!addressInput || !geoJson || !bookingData.service) {
            alert('Vui lòng nhập địa chỉ, chọn vị trí trên bản đồ và chọn dịch vụ cần sửa chữa');
            return;
        }
        const formData = new FormData();
        formData.append('serviceId', bookingData.service?._id);
        formData.append('address', addressInput); // địa chỉ khách nhập
        formData.append('geoJson', JSON.stringify(geoJson)); // vị trí marker
        formData.append('description', bookingData.description);
        formData.append('schedule', `${bookingData.scheduleDate}T${bookingData.scheduleTime}`);
        for (const file of bookingData.images) {
            formData.append('images', file);
        }

        try {
            console.log("Đang gửi FormData đến backend...", formData);
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const actionResult = await dispatch(createNewBooking(formData));
            const bookingResult = unwrapResult(actionResult);

            // console.log('--- RES BOOKING ---', res);
            // console.log('--- RES BOOKING ID ---', res.data._id);

            if (bookingResult && bookingResult._id) {
                navigate(`/booking/choose-technician?bookingId=${bookingResult._id}`);
            } else {
                alert('Đặt lịch thành công nhưng không thể chuyển sang trang chọn kỹ thuật viên!');
            }
        } catch (error) {
            alert('Đặt lịch thất bại!');
            console.error(error);
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
                                </div>

                                <div className="input-block">
                                    <label className="form-label">
                                        Chọn ngày <span className="text-danger">*</span>
                                    </label>
                                    <div className="group-img">
                                        <input
                                            name="scheduleDate"
                                            type="date"
                                            className="form-control"
                                            placeholder="Choose Date"
                                            value={bookingData.scheduleDate}
                                            onChange={handleInputChange}
                                        />
                                        {/* <span className="input-cal-icon"><i className="bx bx-calendar"></i></span> */}
                                    </div>
                                </div>
                                <div className="input-block">
                                    <label className="form-label">
                                        Chọn thời gian <span className="text-danger">*</span>
                                    </label>
                                    <div className="group-img">
                                        <input
                                            name="scheduleTime"
                                            type="time"
                                            step="1"
                                            className="form-control"
                                            placeholder="Choose Time"
                                            value={bookingData.scheduleTime}
                                            onChange={handleInputChange}
                                        />
                                        {/* <span className="input-cal-icon"><i className="bx bx-time"></i></span> */}
                                    </div>
                                </div>

                                <ImageUploader onFilesSelect={handleFilesSelect} />

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

