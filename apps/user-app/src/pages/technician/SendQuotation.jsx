import BreadcrumbBar from "../../components/common/BreadcrumbBar";
import Header from "../../components/common/Header";
import BookingDetails from "../booking/common/BookingDetails";
import BookingWizard from "../booking/common/BookingHeader";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { addItem, removeItem, updateItem, setLaborPrice, setWarrantiesDuration, clearQuotation, setLoading, setError } from "../../features/quotations/quotationSlice";
import { sendQuotation } from "../../features/technicians/technicianSlice";
import { toast } from "react-toastify";
import { useBookingParams } from "../../hooks/useBookingParams";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function SendQuotationToCustomer() {
    const { bookingId, stepsForCurrentUser } = useBookingParams();
    const { items, laborPrice, warrantiesDuration, loading, error } = useSelector((state) => state.quotation);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modalItem, setModalItem] = useState({ name: '', price: '', quantity: 1, note: '' });
    const [editIndex, setEditIndex] = useState(null);

    // Xử lý thêm/sửa item vào danh sách
    const handleAddItem = (e) => {
        e.preventDefault();
        if (modalItem.name.trim() === '' || !modalItem.price || !modalItem.quantity) return;

        const newItem = {
            ...modalItem,
            price: Number(modalItem.price),
            quantity: Number(modalItem.quantity)
        };

        if (editIndex !== null) {
            // Sửa item
            dispatch(updateItem({ index: editIndex, item: newItem }));
            setEditIndex(null);
        } else {
            // Thêm mới
            dispatch(addItem(newItem));
        }

        setModalItem({ name: '', price: '', quantity: 1, note: '' });

        // Đóng modal bằng Bootstrap 5
        const modal = document.getElementById('add_card');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }
    };

    // Xử lý nhấn nút sửa
    const handleEdit = (idx) => {
        setModalItem(items[idx]);
        setEditIndex(idx);

        // Mở modal bằng Bootstrap 5
        const modal = document.getElementById('add_card');
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    };

    // Xử lý nhấn nút xóa
    const handleDelete = (idx) => {
        if (window.confirm('Bạn có chắc muốn xóa hạng mục này?')) {
            dispatch(removeItem(idx));
        }
    };

    // Xử lý gửi báo giá
    const handleSendQuotation = async (e) => {
        e.preventDefault();
        if (!laborPrice) {
            Swal.fire({
                title: 'Vui lòng nhập giá công thợ !!',
                // text: 'Bạn có chắc chắn muốn đăng xuất không?',
                icon: 'question',
            });
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const quotationData = {
                bookingId,
                // technicianId: user._id,
                laborPrice: Number(laborPrice),
                warrantiesDuration: Number(warrantiesDuration),
                items: items
            };
            // console.log('--- SEND QUOTATION DATA ---', quotationData);   

            const response = await dispatch(sendQuotation(quotationData)).unwrap();
            // console.log('--- SEND QUOTATION RESPONSE ---', response);

            if (response) {
                toast.success('Gửi báo giá thành công!');
                navigate(`/technician/waiting-confirm?bookingId=${bookingId}`);
            }

            dispatch(clearQuotation());
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Gửi báo giá thất bại!';
            dispatch(setError(errorMessage));
            alert(errorMessage);
        }

        dispatch(setLoading(false));
    };

    return (
        <>
            <Header />

            <BreadcrumbBar title={'Chọn Kỹ Thuật Viên'} subtitle={'Choose Technician'} />

            <div className="booking-new-module">
                <div className="container">
                    <BookingWizard steps={stepsForCurrentUser} activeStep={1} />

                    <div className="booking-detail-info">
                        <div className="row">
                            <div className="col-lg-5">
                                <BookingDetails bookingId={bookingId} />
                            </div>

                            <div className="col-lg-7">
                                <div className="card your-card flex-fill">
                                    <form onSubmit={handleSendQuotation} className="card-body">
                                        <div className="wallet-header d-flex justify-content-between align-items-center">
                                            <h4>Báo giá của bạn</h4>
                                            <a href="#" data-bs-toggle="modal" data-bs-target="#add_card">
                                                <i className="feather-plus-circle"></i>
                                            </a>
                                        </div>

                                        <div className="input-block">
                                            <div className="group-img">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Nhập giá công thợ (VND)"
                                                    value={laborPrice}
                                                    onChange={e => dispatch(setLaborPrice(e.target.value))}
                                                    min={0}
                                                />
                                            </div>
                                        </div>

                                        <div className="wallet-table">
                                            <div className="table-responsive">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>STT</th>
                                                            <th>Tên thiết bị</th>
                                                            <th>Giá tiền</th>
                                                            <th>Số lượng</th>
                                                            <th>Ghi chú</th>
                                                            <th>Hành động</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td>{idx + 1}</td>
                                                                <td>{item.name}</td>
                                                                <td>{item.price.toLocaleString()}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>{item.note}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-warning me-2"
                                                                        onClick={() => handleEdit(idx)}
                                                                    >
                                                                        Sửa
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDelete(idx)}
                                                                    >
                                                                        Xóa
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {items.length === 0 && (
                                                            <tr><td colSpan="6" className="text-center">Chưa thêm thiết bị nào</td></tr>
                                                        )}

                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 20 }} >
                                            <div>
                                                <div className="wallet-header">
                                                    <h4>Thời gian bảo hành</h4>
                                                </div>

                                                <div className="location-content">
                                                    <div className="delivery-tab">
                                                        <ul className="nav">
                                                            {[30, 60, 90, 180, 360, 720].map((day) => (
                                                                <li key={day}>
                                                                    <label className="booking_custom_check">
                                                                        <input
                                                                            type="radio"
                                                                            name="rent_type"
                                                                            value={day}
                                                                            checked={Number(warrantiesDuration) === day}
                                                                            onChange={e => dispatch(setWarrantiesDuration(Number(e.target.value)))}
                                                                        />
                                                                        <span className="booking_checkmark">
                                                                            <span style={{ width: 100 }} className="checked-title">{day} ngày</span>
                                                                        </span>
                                                                    </label>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Đang gửi...' : 'Gửi báo giá'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal new-modal fade" id="add_card" tabIndex="-1" data-bs-keyboard="false" data-bs-backdrop="static">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">
                                {editIndex !== null ? 'Sửa thiết bị' : 'Chi tiết đơn giá'}
                            </h4>
                            <button type="button" className="close-btn" data-bs-dismiss="modal" aria-label="Close">
                                <span>×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAddItem}>
                                <div className="modal-form-group">
                                    <label>
                                        Tên thiết bị <span className="text-danger">*</span>
                                    </label>
                                    <input type="text" className="form-control"
                                        placeholder="Nhập tên thiết bị"
                                        value={modalItem.name}
                                        onChange={e => setModalItem({ ...modalItem, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="modal-form-group">
                                            <label>
                                                Số lượng <span className="text-danger">*</span>
                                            </label>
                                            <div className="form-icon">
                                                <input type="number" className="form-control"
                                                    value={modalItem.quantity}
                                                    onChange={e => setModalItem({ ...modalItem, quantity: e.target.value })}
                                                    min={1}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="modal-form-group">
                                            <label>
                                                Giá <span className="text-danger">*</span>
                                            </label>
                                            <div className="form-icon">
                                                <input type="number" className="form-control"
                                                    value={modalItem.price}
                                                    onChange={e => setModalItem({ ...modalItem, price: e.target.value })}
                                                    min={0}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-form-group">
                                    <label>
                                        Ghi chú
                                    </label>
                                    <input type="text" className="form-control"
                                        placeholder="Nhập ghi chú (không bắt buộc)"
                                        value={modalItem.note}
                                        onChange={e => setModalItem({ ...modalItem, note: e.target.value })}
                                    />
                                </div>

                                <div className="modal-btn">
                                    <button type="submit" className="btn btn-secondary w-100">
                                        {editIndex !== null ? 'Lưu thay đổi' : 'Xác nhận'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SendQuotationToCustomer;
