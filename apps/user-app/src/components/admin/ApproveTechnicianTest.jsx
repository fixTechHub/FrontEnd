import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveTechnicianThunk } from '../../features/admin/adminSlice';
import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const ApproveTechnicianTest = ({ technicianId, onSuccess }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.admin);
    const { user } = useSelector(state => state.auth);

    // This component should only be visible to Admins
    if (user?.role?.name !== 'ADMIN') {
        return <p>Bạn không có quyền làm việc này.</p>;
    }

    const handleApprove = async () => {
        if (!technicianId) {
            toast.error('Không có thợ nào.');
            return;
        }
        try {
            await dispatch(approveTechnicianThunk(technicianId)).unwrap();
            toast.success('Duyệt thợ thành công!');
            if (onSuccess) onSuccess(); // Trigger callback to refresh technician list
        } catch (error) {
            toast.error('Không thể duyệt thợ: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h3>Admin Test: Approve Technician</h3>
            </div>
            <div className="card-body">
                <p>Technician ID: {technicianId || 'Không có thợ nào được chọn'}</p>
                <div className="input-group mb-3">
                    <button
                        className="btn btn-success"
                        type="button"
                        onClick={handleApprove}
                        disabled={loading || !technicianId}
                    >
                        {loading ? 'Đang duyệt...' : 'Duyệt'}
                    </button>
                </div>
                <small className="form-text text-muted">
                    Thao tác này sẽ duyệt thợ, tự động tạo hợp đồng dịch vụ và gửi thông báo cho họ.
                </small>
            </div>
        </div>
    );
};

export default ApproveTechnicianTest;