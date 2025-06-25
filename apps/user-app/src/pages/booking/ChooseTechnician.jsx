import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingWizard from './common/BookingHeader';
import BookingDetails from './common/BookingDetails';
import Rating from 'react-rating';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotationsByBookingId } from '../../features/bookings/bookingSlice';
import { acceptQuotation } from '../../features/bookings/bookingAPI';
import { fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { fetchBookingPriceInformation } from '../../features/booking-prices/bookingPriceSlice';

function ChooseTechnician() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookingId, setBookingId] = useState(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
    const [selectedQuotationId, setSelectedQuotationId] = useState(null);
    const { quotations, status: quotationsStatus } = useSelector((state) => state.booking);
    const { quotationDetail, status: quotationStatus } = useSelector((state) => state.bookingPrice);
    const { profile, loading, error } = useSelector(state => state.technician);

    const technician = profile?.technician;
    const certificates = profile?.certificates;
    const user = technician?.userId ?? {};
    const specialties = technician?.specialtiesCategories ?? [];

    useEffect(() => {
        const id = searchParams.get('bookingId');
        setBookingId(id);

        console.log('--- CHOOSE TECHNICIAN ---', id);

    }, [searchParams]);

    useEffect(() => {
        if (bookingId) {
            dispatch(fetchQuotationsByBookingId(bookingId));
        }
    }, [dispatch, bookingId]);

    const handleShowTechnicianInfo = (id) => {
        setSelectedTechnicianId(id);
        dispatch(fetchTechnicianProfile(id));
    };

    const handleClick = (quotationId) => {
        setSelectedQuotationId(quotationId);
        dispatch(fetchBookingPriceInformation(quotationId));
    };

    const handleComfirm = async (id, techId) => {
        try {
            const res = await acceptQuotation(id);
            console.log('--- ACCEPT QUOTATION ---', res);

            if (res.data.success) {
                navigate(`/booking/booking-processing?bookingId=${bookingId}&technicianId=${techId}`);
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error('Lỗi khi xác nhận báo giá:', error);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Chọn Kỹ Thuật Viên'} subtitle={'Choose Technician'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard activeStep={2} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-4">
                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg-8">
                                <div className="booking-information-card">
                                    <div className="booking-info-head justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <span><i className="bx bx-add-to-queue"></i></span>
                                            <h5>Danh Sách Báo Giá</h5>
                                        </div>
                                    </div>
                                    <div className="booking-info-body">
                                        <div className="card">
                                            {/* <div className="card-body"> */}
                                            <div className="table-responsive">
                                                <table className="table text-nowrap table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Kỹ thuật viên</th>
                                                            <th scope="col">Giá đề xuất</th>
                                                            <th scope="col">Bảo hành</th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.isArray(quotations) && quotations.map((quotation) => (
                                                            <tr key={quotation._id}>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="avatar avatar-sm me-2">
                                                                            <img src={quotation?.technicianId?.userId?.avatar} alt="img" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="lh-1">
                                                                                <span className="fs-11 text-muted">
                                                                                    <a data-bs-toggle="modal"
                                                                                        data-bs-target="#view_tech_info"
                                                                                        className="__cf_email__"
                                                                                        onClick={() => handleShowTechnicianInfo(quotation?.technicianId?._id)}
                                                                                    >{quotation?.technicianId?.userId?.fullName}</a>
                                                                                </span>
                                                                            </div>

                                                                            <div style={{ fontSize: 14 }}>
                                                                                <span>{quotation?.technicianId?.ratingAverage}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{quotation?.finalPrice} VND</td>
                                                                <td>{quotation?.warrantiesDuration} ngày</td>
                                                                <td>
                                                                    <button
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#view_price_info"
                                                                        onClick={() => handleClick(quotation?._id)}
                                                                        className="btn btn-secondary">
                                                                        Xem chi tiết
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <button onClick={() => handleComfirm(quotation._id, quotation.technicianId._id)} className="btn btn-secondary">
                                                                        Xác nhận
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* </div> */}
                                        </div>

                                        <div className="modal fade" id="view_tech_info" tabIndex="-1">
                                            <div className="modal-dialog modal-dialog-centered modal-md">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="mb-0">Thông tin chi tiết</h5>
                                                        <button
                                                            type="button"
                                                            className="btn-close custom-btn-close"
                                                            data-bs-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <i className="ti ti-x fs-16"></i>
                                                        </button>
                                                    </div>
                                                    <div className="modal-body pb-1">
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                <img src={user?.avatar} alt="avatar" style={{ width: 150, borderRadius: '50%' }} />
                                                            </label>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Họ và tên: <span className="text-danger">{user?.fullName}</span>
                                                            </label>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Kinh nghiệm: <span className="text-danger">{technician?.experienceYears} năm</span>
                                                            </label>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Đánh giá: <span className="text-danger">
                                                                    <div className="review-rating">
                                                                        <Rating
                                                                            initialRating={technician?.ratingAverage}
                                                                            readonly
                                                                            fullSymbol={<i className="fas fa-star filled"></i>}
                                                                            emptySymbol={<i className="far fa-star"></i>}
                                                                        />
                                                                        <span>({technician?.ratingAverage})</span>
                                                                    </div>
                                                                </span>
                                                            </label>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Chuyên môn: <span className="text-danger">
                                                                    <ul>
                                                                        {specialties.map((spec) => (
                                                                            <li key={spec._id}>{spec.categoryName}</li>
                                                                        ))}
                                                                    </ul>
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* <div className="modal-footer">
                                                        <div className="d-flex justify-content-center">
                                                            <a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">
                                                                Cancel
                                                            </a>
                                                            <a href="javascript:void(0);" className="btn btn-primary">
                                                                Create New
                                                            </a>
                                                        </div>
                                                    </div> */}

                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal fade" id="view_price_info" tabIndex="-1">
                                            <div className="modal-dialog modal-dialog-centered modal-md">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="mb-0">Thông tin chi tiết</h5>
                                                        <button
                                                            type="button"
                                                            className="btn-close custom-btn-close"
                                                            data-bs-dismiss="modal"
                                                            aria-label="Close"
                                                        >
                                                            <i className="ti ti-x fs-16"></i>
                                                        </button>
                                                    </div>
                                                    <div className="modal-body pb-1">
                                                        {/* <div className="mb-3">
                                                            <label className="form-label">
                                                                <img src={user?.avatar} alt="avatar" style={{ width: 150, borderRadius: '50%' }} />
                                                            </label>
                                                        </div> */}

                                                        <div className="modal-body pb-1">
                                                            {quotationDetail?.quotation ? (
                                                                <>
                                                                    <div className="mb-3">
                                                                        <label className="form-label">
                                                                            Tiền công: <span className="text-danger">{quotationDetail.quotation.laborPrice} VND</span>
                                                                        </label>
                                                                    </div>

                                                                    <div className="mb-3">
                                                                        <label className="form-label">Tiền vật tư:</label>
                                                                    </div>

                                                                    {Array.isArray(quotationDetail.items) &&
                                                                        quotationDetail.items.map((item) => (
                                                                            <div className="mb-3" key={item._id}>
                                                                                <label className="form-label">
                                                                                    Tên: {item.name} - Số lượng: {item.quantity} - Giá tiền: {item.price} VND
                                                                                </label>
                                                                            </div>
                                                                        ))}

                                                                    <div className="mb-3">
                                                                        <label className="form-label">
                                                                            Tiền tạm tính: <span className="text-danger">{quotationDetail.quotation.finalPrice} VND</span>
                                                                        </label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center text-muted">Đang tải dữ liệu...</div>
                                                            )}
                                                        </div>


                                                    </div>

                                                    {/* <div className="modal-footer">
                                                        <div className="d-flex justify-content-center">
                                                            <a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">
                                                                Cancel
                                                            </a>
                                                            <a href="javascript:void(0);" className="btn btn-primary">
                                                                Create New
                                                            </a>
                                                        </div>
                                                    </div> */}

                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </>
    );
}

export default ChooseTechnician;
