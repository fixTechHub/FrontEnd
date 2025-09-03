import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingWizard from './common/BookingHeader';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useBookingParams } from '../../hooks/useBookingParams';
import { selectTechnicianThunk, fetchBookingRequests, fetchTechniciansFound, fetchBookingById } from '../../features/bookings/bookingSlice';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import Rating from 'react-rating';
import TechnicianProfile from '../../components/profile/TechnicianProfile';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { formatDateOnly, formatTimeOnly } from '../../utils/formatDate';
import { onBookingRequestAccepted, onBookingRequestRejected, onBookingRequestStatusUpdate, onTechniciansFoundUpdated } from '../../services/socket';

function ChooseTechnician() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newBooking, status: createBookingStatus, requests, booking } = useSelector(state => state.booking);
    const { techniciansFound, status: techniciansFoundStatus } = useSelector(state => state.booking);
    const { user } = useSelector(state => state.auth);
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const [confirming, setConfirming] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [showBookingDetails, setShowBookingDetails] = useState(false);

    // Filter state
    const [price, setPrice] = useState([0, 10000000]); // [min, max] giá, có thể chỉnh lại range phù hợp
    const [status, setStatus] = useState('ALL'); // 'ALL', 'FREE', 'ONJOB'
    const [rating, setRating] = useState(0); // số sao tối thiểu
    const [sort, setSort] = useState('none'); // 'none', 'price-asc', 'price-desc', 'rating-asc', 'rating-desc'

    // Phân trang
    const [page, setPage] = useState(1);
    const pageSize = 4;

    // Lọc danh sách thợ
    const filteredTechnicians = (techniciansFound || []).filter(technician => {
        // Lấy giá hiển thị
        let techPrice = technician?.servicePrice || 0;
        // Lọc theo giá
        if (techPrice < price[0] || techPrice > price[1]) return false;
        // Lọc theo trạng thái
        if (status !== 'ALL' && technician?.availability !== status) return false;
        // Lọc theo rating
        if (rating && Math.round(technician?.ratingAverage) !== rating) return false;
        return true;
    });

    // Sắp xếp danh sách thợ
    let sortedTechnicians = [...filteredTechnicians];
    if (sort === 'price-asc') {
        sortedTechnicians.sort((a, b) => {
            const priceA = a.servicePrice || 0;
            const priceB = b.servicePrice || 0;
            return priceA - priceB;
        });
    } else if (sort === 'price-desc') {
        sortedTechnicians.sort((a, b) => {
            const priceA = a.servicePrice || 0;
            const priceB = b.servicePrice || 0;
            return priceB - priceA;
        });
    } else if (sort === 'rating-desc') {
        sortedTechnicians.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
    }

    const totalPages = Math.ceil(sortedTechnicians.length / pageSize);
    const paginatedTechnicians = sortedTechnicians.slice((page - 1) * pageSize, page * pageSize);

    // Khi filter/sort thay đổi, reset về trang 1
    useEffect(() => {
        setPage(1);
    }, [price, status, rating, sort, techniciansFound]);

    // Xử lý form filter
    const handleFilterSubmit = (e) => {
        e.preventDefault();
    };
    const handleResetFilter = (e) => {
        e.preventDefault();
        setPrice([0, 10000000]);
        setStatus('ALL');
        setRating(0);
    };

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchBookingRequests(bookingId));
            // Fetch booking details nếu chưa có hoặc khác với bookingId hiện tại
            if (!booking || booking._id !== bookingId) {
                dispatch(fetchBookingById(bookingId));
            }
        }
    }, [bookingId, dispatch, booking]);

    // Khi bookingId thay đổi, luôn fetch lại danh sách technician
    useEffect(() => {
        if (bookingId) {
            dispatch(fetchTechniciansFound(bookingId));
            setPage(1);
            setPrice([0, 10000000]);
            setStatus('ALL');
            setRating(0);
            setSort('none');
        }
    }, [bookingId, dispatch]);

    // Theo dõi trạng thái loading và log để debug
    useEffect(() => {
        if (techniciansFoundStatus === 'loading') {
            console.log('Đang tải danh sách thợ...');
        } else if (techniciansFoundStatus === 'succeeded') {
            console.log('Đã tải xong danh sách thợ:', techniciansFound?.length || 0, 'thợ');

            // Kiểm tra tính đầy đủ của dữ liệu
            if (techniciansFound && techniciansFound.length > 0) {
                const hasCompleteData = techniciansFound.every(tech =>
                    tech.estimatedArrivalTime &&
                    tech.isSubscribe !== undefined &&
                    tech.subscriptionStatus
                );

                if (!hasCompleteData) {
                    console.log('⚠️ Dữ liệu thợ chưa đầy đủ, sẽ được cập nhật tự động...');
                } else {
                    console.log('✅ Dữ liệu thợ đã đầy đủ');
                }
            }
        } else if (techniciansFoundStatus === 'failed') {
            console.log('Lỗi khi tải danh sách thợ');
        }
    }, [techniciansFoundStatus, techniciansFound]);

    // Socket listeners cho booking request status updates
    useEffect(() => {
        if (!bookingId) return;

        // Lắng nghe khi thợ chấp nhận booking request
        const unsubscribeAccepted = onBookingRequestAccepted((data) => {
            console.log('Booking request accepted:', data);
            if (data.bookingId === bookingId) {
                // Refresh booking requests để cập nhật trạng thái nút
                dispatch(fetchBookingRequests(bookingId));
            }
        });

        // Lắng nghe khi thợ từ chối booking request
        const unsubscribeRejected = onBookingRequestRejected((data) => {
            console.log('Booking request rejected:', data);
            if (data.bookingId === bookingId) {
                // Refresh booking requests để cập nhật trạng thái nút
                dispatch(fetchBookingRequests(bookingId));
            }
        });

        // Lắng nghe khi có cập nhật trạng thái booking request
        const unsubscribeStatusUpdate = onBookingRequestStatusUpdate((data) => {
            console.log('Booking request status update:', data);
            if (data.bookingId === bookingId) {
                // Refresh booking requests để cập nhật trạng thái nút
                dispatch(fetchBookingRequests(bookingId));
            }
        });

        // Lắng nghe khi có cập nhật danh sách thợ
        const unsubscribeTechniciansUpdated = onTechniciansFoundUpdated((data) => {
            if (data.bookingId === bookingId) {
                // Refresh danh sách thợ
                dispatch(fetchTechniciansFound(bookingId));
            }
        });

        // Cleanup listeners khi component unmount hoặc bookingId thay đổi
        return () => {
            unsubscribeAccepted();
            unsubscribeRejected();
            unsubscribeStatusUpdate();
            unsubscribeTechniciansUpdated();
        };
    }, [bookingId, dispatch]);

    console.log('--- CREATE BOOKING LOG ---', newBooking);
    console.log('--- BOOKING DETAIL LOG ---', booking);
    console.log('--- TECHNICIAN FOUND LOG ---', techniciansFound);

    const handleShowProfile = (technician) => {
        setSelectedTechnician(technician);
        setShowProfileModal(true);
    };

    const handleCloseProfile = () => {
        setShowProfileModal(false);
        setSelectedTechnician(null); // Clear data on close
    };

    const getTechnicianStatus = (technicianId) => {
        const req = requests.find(r => r.technicianId === technicianId);
        return req ? req.status : null;
    };

    const handleSendRequest = async (technicianId) => {
        // const pending = requests.find(r => r.status === 'PENDING');
        // if (pending) {
        //     // Kiểm tra thời gian đã gửi
        //     const createdAt = new Date(pending.createdAt).getTime();
        //     const now = Date.now();
        //     const FIVE_MINUTES = 5 * 60 * 1000;
        //     if (now - createdAt < FIVE_MINUTES) {
        //         const secondsLeft = Math.ceil((FIVE_MINUTES - (now - createdAt)) / 1000);
        //         const minutes = Math.floor(secondsLeft / 60);
        //         const seconds = secondsLeft % 60;
        //         alert(`Bạn chỉ có thể gửi yêu cầu cho 1 thợ mỗi lần. Vui lòng đợi ${minutes} phút ${seconds} giây hoặc khi thợ phản hồi.`);
        //         return;
        //     }
        // }
        try {
            await dispatch(selectTechnicianThunk({ bookingId, technicianId })).unwrap();
            dispatch(fetchBookingRequests(bookingId));
        } catch (err) {
            // Hiển thị đúng message lỗi từ backend
            alert(err?.message || err || 'Gửi yêu cầu thất bại!');
        }
    };

    // Khi nhấn gửi yêu cầu, show modal xác nhận
    const handleSendRequestClick = (technician) => {
        setSelectedTechnician(technician);
        setShowConfirm(true);
    };
    // Khi xác nhận gửi
    const handleConfirmSend = async () => {
        setShowConfirm(false);
        if (selectedTechnician) {
            await handleSendRequest(selectedTechnician._id);
        }
    };

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Chọn Kỹ Thuật Viên'} subtitle={'Choose Technician'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={2} />

                    <section className="section car-listing pt-0">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-3 col-lg-4 col-sm-12 col-12 theiaStickySidebar">

                                    {/* Nút xem chi tiết đơn hàng */}
                                    {(newBooking || booking) && (
                                        <div className="text-center mb-4">
                                            <button
                                                className="btn btn-primary choose-technician-booking-details-btn"
                                                onClick={() => setShowBookingDetails(true)}
                                            >
                                                <i className="feather-info"></i>
                                                Xem chi tiết đơn hàng
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={handleFilterSubmit} autoComplete="off" className="sidebar-form">
                                        <div className="product-availability">
                                            <h6>Bộ lọc tìm kiếm</h6>
                                        </div>

                                        {/* <Form.Group className='mb-3'>
                                            <Form.Label><strong>Khoảng giá</strong></Form.Label>
                                            <Form.Range
                                                min={0}
                                                max={10000000}
                                                step={100000}
                                                value={price[1]}
                                                onChange={e => setPrice([0, Number(e.target.value)])}
                                            />
                                            <div className="d-flex justify-content-between">
                                                <span>0</span>
                                                <span>{price[1].toLocaleString()} VNĐ</span>
                                                                    </div>
                                        </Form.Group> */}

                                        <Form.Group className='mb-3'>
                                            <Form.Label><strong>Khoảng giá</strong></Form.Label>
                                            <Box sx={{ px: 1, pb: 2 }}>
                                                <Slider
                                                    value={price}
                                                    onChange={(e, newValue) => setPrice(newValue)}
                                                    valueLabelDisplay="auto"
                                                    min={0}
                                                    max={10000000}
                                                    step={50000}
                                                    marks={[
                                                        { value: 0, label: '0' },
                                                        { value: 1000000, label: '1tr' },
                                                        { value: 2000000, label: '2tr' },
                                                        { value: 5000000, label: '5tr' },
                                                        { value: 10000000, label: '10tr' }
                                                    ]}
                                                    disableSwap
                                                />
                                                <div className="d-flex justify-content-between mt-2">
                                                    <span>{price[0].toLocaleString()} VNĐ</span>
                                                    <span>{price[1].toLocaleString()} VNĐ</span>
                                                </div>
                                            </Box>
                                        </Form.Group>

                                        <Form.Group className='mb-3'>
                                            <Form.Label><strong>Sắp xếp</strong></Form.Label>
                                            <div className="mb-2">
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="sort-none"
                                                    name="sort"
                                                    label="Mặc định"
                                                    value="none"
                                                    checked={sort === 'none'}
                                                    onChange={e => setSort(e.target.value)}
                                                />
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="sort-price-asc"
                                                    name="sort"
                                                    label="Giá tăng dần"
                                                    value="price-asc"
                                                    checked={sort === 'price-asc'}
                                                    onChange={e => setSort(e.target.value)}
                                                />
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="sort-price-desc"
                                                    name="sort"
                                                    label="Giá giảm dần"
                                                    value="price-desc"
                                                    checked={sort === 'price-desc'}
                                                    onChange={e => setSort(e.target.value)}
                                                />
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="sort-rating-desc"
                                                    name="sort"
                                                    label="Đánh giá cao nhất"
                                                    value="rating-desc"
                                                    checked={sort === 'rating-desc'}
                                                    onChange={e => setSort(e.target.value)}
                                                />
                                            </div>
                                        </Form.Group>

                                        {/* <Form.Group className='mb-3'>
                                            <Form.Label><strong>Trạng thái</strong></Form.Label>
                                            <div className="mb-2">
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="status-all"
                                                    name="status"
                                                    label="Tất cả"
                                                    value="ALL"
                                                    checked={status === 'ALL'}
                                                    onChange={e => setStatus(e.target.value)}
                                                />
                                                <Form.Check
                                                    className='mb-3'
                                                    type="radio"
                                                    id="status-free"
                                                    name="status"
                                                    label="Sẵn sàng nhận việc"
                                                    value="FREE"
                                                    checked={status === 'FREE'}
                                                    onChange={e => setStatus(e.target.value)}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    id="status-onjob"
                                                    name="status"
                                                    label="Có thể nhận sau"
                                                    value="ONJOB"
                                                    checked={status === 'ONJOB'}
                                                    onChange={e => setStatus(e.target.value)}
                                                />
                                            </div>
                                        </Form.Group> */}

                                        <Form.Group className='mb-3'>
                                            <Form.Label><strong>Xếp hạng</strong></Form.Label>

                                            <Form.Check
                                                type="radio"
                                                name="rating"
                                                id="star-0"
                                                value={0}
                                                label=" Tất cả"
                                                className="mb-2"
                                                // style={{ fontSize: 20 }}
                                                checked={rating === 0}
                                                onChange={() => setRating(0)}
                                            />

                                            <div className="mb-2">
                                                {[5, 4, 3, 2, 1].map((star) => (
                                                    <Form.Check
                                                        key={star}
                                                        type="radio"
                                                        name="rating"
                                                        id={`star-${star}`}
                                                        value={star}
                                                        label={`${'★'.repeat(star)}${'☆'.repeat(5 - star)}`}
                                                        className="mb-2"
                                                        style={{ color: '#FFA633', fontSize: 20 }}
                                                        checked={rating === star}
                                                        onChange={() => setRating(star)}
                                                    />
                                                ))}
                                            </div>
                                        </Form.Group>

                                        <button
                                            type="submit"
                                            className="d-inline-flex align-items-center justify-content-center btn w-100 btn-primary filter-btn"
                                            onClick={handleResetFilter}
                                        >
                                            <span>
                                                <i className="feather-filter me-2" />
                                            </span>
                                            Đặt lại bộ lọc
                                        </button>
                                    </form>
                                </div>

                                <div className="col-lg-9">
                                    <div className="row">
                                        {/* Hiển thị spinner khi đang tìm thợ */}
                                        {techniciansFoundStatus === 'loading' && (
                                            <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 200 }}>
                                                <Spinner animation="border" role="status" />
                                                <div className="mt-3">Hệ thống đang tìm thợ phù hợp với yêu cầu của bạn...</div>
                                            </div>
                                        )}
                                        {techniciansFound && techniciansFound.length === 0 && techniciansFoundStatus !== 'loading' && (
                                            <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 200 }}>
                                                <div className="mt-3">Chưa tìm thấy thợ phù hợp. Hệ thống sẽ tiếp tục tìm kiếm...</div>
                                            </div>
                                        )}
                                        {/* {createBookingStatus === 'loading' && (
                                            <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 200 }}>
                                                <Spinner animation="border" role="status" />
                                                <div className="mt-3">Hệ thống đang tìm thợ phù hợp...</div>
                                            </div>
                                        )} */}
                                        {techniciansFound && techniciansFound.length > 0 && sortedTechnicians.length === 0 && (
                                            <div className="w-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 200 }}>
                                                <div className="mt-3">Không có thợ nào phù hợp với bộ lọc hiện tại.</div>
                                            </div>
                                        )}
                                        {/* Nếu có thợ, render như cũ */}
                                        {paginatedTechnicians.map((technician) => (
                                            <div className="listview-car" key={technician._id}>
                                                <div className="card">
                                                    <div className="blog-widget d-flex">
                                                        <div className="blog-img">
                                                            <a onClick={(e) => { e.preventDefault(); handleShowProfile(technician); }}>
                                                                <img
                                                                    style={{ width: 230, height: 194 }}
                                                                    src={technician?.userInfo?.avatar || ''}
                                                                    className="img-fluid"
                                                                    alt="blog-img"
                                                                />
                                                            </a>
                                                            <div className="fav-item justify-content-end">
                                                                {/* <a href="#" className="fav-icon">
                                                                    <i className="feather-heart" />
                                                                </a> */}
                                                            </div>
                                                        </div>
                                                        <div className="bloglist-content w-100">
                                                            <div className="card-body">
                                                                <div className="blog-list-head d-flex">
                                                                    <div className="blog-list-title">
                                                                        <h3>
                                                                            <a onClick={(e) => { e.preventDefault(); handleShowProfile(technician); }}>
                                                                                {technician?.userInfo?.fullName}
                                                                            </a>
                                                                        </h3>

                                                                        {/* {technician?.category.map((category) => (
                                                                                <h6>
                                                                                    {category?.categoryName}
                                                                                </h6>
                                                                            ))} */}
                                                                        {/* <h6>
                                                                                Kinh nghiệm: <span>{technician?.experienceYears} năm</span>
                                                                            </h6> */}
                                                                        {/* <h6>
                                                                                Loại dịch vụ: <span>{technician?.serviceType === 'COMPLEX' ? 'Phức tạp' : 'Đơn giản'}</span>
                                                                            </h6> */}
                                                                        {/* <h6>
                                                                                {technician?.serviceName}
                                                                            </h6> */}
                                                                        <h6>
                                                                            <span>
                                                                                <i className="feather-check-circle me-2" />
                                                                                Đã xác minh
                                                                            </span>
                                                                        </h6>
                                                                    </div>
                                                                    <div style={{ textAlign: 'end' }} className="blog-list-rate">
                                                                        {technician?.servicePrice ? (
                                                                            <h6>
                                                                                {technician?.servicePrice?.toLocaleString()}<span>VNĐ</span>
                                                                            </h6>
                                                                        ) : (
                                                                            <h6>
                                                                                <span>Chưa có giá</span>
                                                                            </h6>
                                                                        )}

                                                                        <Rating
                                                                            initialRating={technician?.ratingAverage}
                                                                            readonly
                                                                            fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                                                            emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                                                        />
                                                                        <span>({(technician?.ratingAverage).toFixed(1)})</span>
                                                                    </div>
                                                                </div>
                                                                <div className="listing-details-group">
                                                                    <ul>
                                                                        <li title={'Đơn đã hoàn thành: ' + technician?.jobCompleted}>
                                                                            <span>
                                                                                <i className="feather-award me-2" />
                                                                            </span>
                                                                            <p>{technician?.jobCompleted} đơn</p>
                                                                        </li>

                                                                        <li title={'Kinh nghiệm: ' + technician?.experienceYears + ' năm'}>
                                                                            <span>
                                                                                <i className="feather-briefcase me-2" />
                                                                            </span>
                                                                            <p>{technician?.experienceYears} năm</p>
                                                                        </li>

                                                                        <li title={'Thời gian bảo hành: ' + technician?.warrantyDuration + ' tháng'}>
                                                                            <span>
                                                                                <i className="feather-shield me-2" />
                                                                            </span>
                                                                            <p>{technician?.warrantyDuration} tháng</p>
                                                                        </li>

                                                                        <li title={'Thời gian đến dự kiến: ' + (technician?.estimatedArrivalTime?.formattedTime || 'Đang tính toán...')}>
                                                                            <span>
                                                                                <i className="feather-clock me-2" />
                                                                            </span>
                                                                            <p>
                                                                                Thời gian đến dự kiến: {
                                                                                    technician?.estimatedArrivalTime?.formattedTime
                                                                                        ? technician.estimatedArrivalTime.formattedTime
                                                                                        : techniciansFoundStatus === 'loading'
                                                                                            ? <span className="text-muted">Đang tính toán...</span>
                                                                                            : <span className="text-muted">Đang cập nhật...</span>
                                                                                }
                                                                            </p>
                                                                        </li>

                                                                        {/* <li title={'Trạng thái: ' + technician?.availability}>
                                                                            <span>
                                                                                <i className="feather-activity me-2" />
                                                                            </span>
                                                                            <p>{technician?.availability === 'FREE' ? 'Sẵn sàng nhận việc' : 'Bận – có thể tiếp nhận thêm yêu cầu'}</p>
                                                                        </li> */}

                                                                    </ul>
                                                                </div>
                                                                <div className="blog-list-head list-head-bottom d-flex">
                                                                    <div className="blog-list-title">
                                                                        <div className="title-bottom">
                                                                            <div className="address-info">
                                                                                <h6>
                                                                                    <i className="feather-map-pin" />
                                                                                    {technician?.userInfo?.address?.city || 'Đang cập nhật'}
                                                                                </h6>
                                                                            </div>
                                                                            <div className="list-km">
                                                                                <span style={{ display: 'flex' }} className="km-count">
                                                                                    <img src="/img/icons/map-pin.svg" alt="author" />
                                                                                    {technician?.distanceInKm + 'km'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="listing-button">
                                                                        <button
                                                                            className="btn btn-order"
                                                                            disabled={confirming}
                                                                            onClick={() => handleSendRequestClick(technician)}
                                                                        >
                                                                            <span>
                                                                                <i className="feather-user-check me-2" />
                                                                            </span>
                                                                            {getTechnicianStatus(technician._id) === 'PENDING'
                                                                                ? 'Đã gửi, chờ phản hồi'
                                                                                : getTechnicianStatus(technician._id) === 'ACCEPTED'
                                                                                    ? 'Đã nhận đơn'
                                                                                    : getTechnicianStatus(technician._id) === 'REJECTED'
                                                                                        ? 'Đã từ chối'
                                                                                        : 'Gửi yêu cầu'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {technician?.subscriptionStatus === 'PREMIUM' && (
                                                            <div className="feature-text">
                                                                <span className="bg-warning">ĐỀ XUẤT</span>
                                                            </div>
                                                        )}
                                                        {technician?.isFavorite === true && technician?.subscriptionStatus !== 'PREMIUM' && (
                                                            <div className="feature-text">
                                                                <span className="bg-danger">BẠN ĐÃ THÍCH</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        ))}

                                    </div>

                                    {totalPages > 1 && (
                                        <div className="blog-pagination">
                                            <nav>
                                                <ul className="pagination page-item justify-content-center">
                                                    <li className={`previtem ${page === 1 ? ' disabled' : ''}`}>
                                                        <a className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>
                                                            <i className="fas fa-regular fa-arrow-left" />
                                                        </a>
                                                    </li>
                                                    <li className="justify-content-center pagination-center">
                                                        <div className="page-group">
                                                            <ul>
                                                                {Array.from({ length: totalPages }, (_, idx) => (
                                                                    <li className="page-item" key={idx}>
                                                                        <a className={`${page === idx + 1 ? ' active page-link' : 'page-link'}`} onClick={() => setPage(idx + 1)}>{idx + 1}</a>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </li>
                                                    <li className={`nextlink ${page === totalPages ? ' disabled' : ''}`}>
                                                        <a className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                                                            <i className="fas fa-regular fa-arrow-right" />
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
            </div>

            <Modal
                show={showProfileModal}
                size="lg"
                onHide={handleCloseProfile}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Thông Tin Chi Tiết Kỹ Thuật Viên
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TechnicianProfile technician={selectedTechnician} />
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseProfile}>
                        Đóng
                    </Button>
                    <Button variant="primary" onClick={handleCloseProfile}>
                        Save Changes
                    </Button>
                </Modal.Footer> */}
            </Modal>

            {/* Modal chi tiết đơn hàng - Phiên bản cực đơn giản */}
            <Modal
                show={showBookingDetails}
                onHide={() => setShowBookingDetails(false)}
                size="md"
                centered
                className="choose-technician-booking-details-minimal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="feather-info me-2"></i>
                        Chi tiết đơn hàng
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {(newBooking || booking) && (
                        <div className="choose-technician-booking-details-minimal-content">
                            <div className="choose-technician-detail-row">
                                <span className="label">Dịch vụ:</span>
                                <span className="value">{booking?.serviceId?.serviceName}</span>
                            </div>

                            {(newBooking || booking).description && (
                                <div className="choose-technician-detail-row">
                                    <span className="label">Mô tả:</span>
                                    <span className="value">{(newBooking || booking).description}</span>
                                </div>
                            )}

                            <div className="choose-technician-detail-row">
                                <span className="label">Địa chỉ:</span>
                                <span className="value">{(newBooking || booking).location?.address || (newBooking || booking).address}</span>
                            </div>

                            <div className="choose-technician-detail-row">
                                <span className="label">Thời gian:</span>
                                {/* <span className="value">{(newBooking || booking).schedule?.startTime || (newBooking || booking).preferredTime}</span> */}
                                <span className="value">
                                    {booking?.schedule?.startTime && booking?.schedule?.expectedEndTime
                                        ? `${formatDateOnly(booking?.schedule?.startTime)}  ${formatTimeOnly(booking?.schedule?.startTime)} - ${formatTimeOnly(booking?.schedule?.expectedEndTime)}`
                                        : 'Thời gian không hợp lệ'}
                                </span>
                            </div>

                            <div className="choose-technician-detail-row">
                                <span className="label">Phương thức:</span>
                                <span className="value method">
                                    {(newBooking || booking).isUrgent === false ? 'Đặt lịch' : 'Đặt ngay'}
                                </span>
                            </div>

                            <div className="choose-technician-detail-row">
                                <span className="label">Trạng thái:</span>
                                <span className="value status">
                                    <span className="choose-technician-status-badge">
                                        <i className="feather-search me-1"></i>
                                        Đang tìm thợ
                                    </span>
                                </span>
                            </div>

                            <div className="choose-technician-detail-row">
                                <span className="label">Ngày tạo:</span>
                                <span className="value">{new Date((newBooking || booking).createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>

                            {(newBooking || booking).estimatedPrice && (
                                <div className="choose-technician-detail-row">
                                    <span className="label">Giá ước tính:</span>
                                    <span className="value price">{(newBooking || booking).estimatedPrice.toLocaleString()} VNĐ</span>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBookingDetails(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal xác nhận gửi yêu cầu */}
            <Modal show={showConfirm}
                onHide={() => setShowConfirm(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận gửi yêu cầu</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                        {/* <p>
                            <strong>Phí kiểm tra:</strong>{' '}
                            <span style={{ color: 'red', fontWeight: 'bold' }}>
                                {selectedTechnician?.inspectionFee?.toLocaleString() || 0} VNĐ
                            </span>
                        </p>

                        <p style={{ fontSize: 12, color: '#6c757d', marginBottom: 12 }}>
                            (*) Phí này chỉ thu nếu bạn không đồng ý sửa chữa. Nếu tiếp tục sửa, bạn <strong>không cần thanh toán</strong> phí kiểm tra.
                        </p> */}

                        <p>
                            Bạn có chắc chắn muốn gửi yêu cầu cho kỹ thuật viên{' '}
                            <strong>{selectedTechnician?.userInfo?.fullName}</strong> không?
                        </p>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleConfirmSend}>
                        Gửi yêu cầu
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ChooseTechnician;
