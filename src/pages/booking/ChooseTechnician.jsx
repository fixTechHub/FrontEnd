import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingWizard from './BookingHeader';
import BookingDetails from './BookingDetails';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuotationsByBookingId } from '../../features/bookings/bookingSlice';
import { acceptQuotation } from '../../features/bookings/bookingAPI';

function ChooseTechnician() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookingId, setBookingId] = useState(null);
    const { quotations, status: quotationsStatus } = useSelector((state) => state.booking);

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

    const handleComfirm = async (id) => {
        try {
            const res = await acceptQuotation(id);
            console.log('--- ACCEPT QUOTATION ---', res);

            if (res.data.success) {
                navigate(`/booking`);
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
                                                                {/* <th scope="col"></th>
                                                                <th scope="col"></th> */}
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
                                                                                        <a data-bs-toggle="modal" data-bs-target="#add_extra_service" className="__cf_email__">{quotation?.technicianId?.userId?.fullName}</a>
                                                                                    </span>
                                                                                </div>

                                                                                <div style={{ fontSize: 14 }}>
                                                                                    <span>{quotation?.technicianId?.ratingAverage}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    {/* <td></td>
                                                                    <td></td> */}
                                                                    <td>{quotation?.finalPrice} VND</td>
                                                                    <td>{quotation?.warrantiesDuration} ngày</td>
                                                                    <td>
                                                                        <button onClick={() => handleComfirm(quotation._id)} className="btn btn-secondary">
                                                                            Xác nhận
                                                                        </button>
                                                                    </td>
                                                                    <td>
                                                                        <button onClick={() => handleComfirm(quotation._id)} className="btn btn-secondary">
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

                                        <div className="modal fade" id="add_extra_service" tabIndex="-1">
                                            <div className="modal-dialog modal-dialog-centered modal-md">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h5 className="mb-0">Create Extra Service</h5>
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
                                                                Name <span className="text-danger">*</span>
                                                            </label>
                                                            <input type="text" className="form-control" />
                                                        </div>
                                                        <div className="mb-3 row">
                                                            <div className="col-lg-6">
                                                                <label className="form-label">
                                                                    Quantity <span className="text-danger">*</span>
                                                                </label>
                                                                <input type="text" className="form-control" />
                                                            </div>
                                                            <div className="col-lg-6">
                                                                <label className="form-label">
                                                                    Price <span className="text-danger">*</span>
                                                                </label>
                                                                <input type="text" className="form-control" />
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Type <span className="text-danger">*</span>
                                                            </label>
                                                            <select className="select form-control">
                                                                <option value="">Select</option>
                                                                <option value="">One Time</option>
                                                                <option value="">Per Day</option>
                                                            </select>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">
                                                                Description <span className="text-danger">*</span>
                                                            </label>
                                                            <textarea className="form-control"></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="modal-footer">
                                                        <div className="d-flex justify-content-center">
                                                            <a href="javascript:void(0);" className="btn btn-light me-3" data-bs-dismiss="modal">
                                                                Cancel
                                                            </a>
                                                            <a href="javascript:void(0);" className="btn btn-primary">
                                                                Create New
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChooseTechnician;
