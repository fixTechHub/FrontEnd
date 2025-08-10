import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveTechnicianThunk } from '../../features/admin/adminSlice';
import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const ApproveTechnicianTest = ({ technicianId }) => {
    const dispatch = useDispatch();
    // const { loading } = useSelector(state => state.admin);
    // const { user } = useSelector(state => state.auth);

    // This component should only be visible to Admins
    // if (user?.role?.name !== 'ADMIN') {
    //     return <p>Bạn không có quyền làm việc này.</p>;
    // }
    
    const handleApprove = async () => {
        if (!technicianId) {
            toast.error('Không có thợ nào.');
            return;
        }
    console.log(technicianId);

        try {
            await dispatch(approveTechnicianThunk(technicianId)).unwrap();
            toast.success('Duyệt thợ thành công!');
        } catch (error) {
            toast.error('Không thể duyệt thợ: ' + (error.message || 'Lỗi không xác định'));
        }
    };

    return (
 
          
         
                <div className="input-group mb-3">
                    <button
                        className="btn btn-success"
                        type="submit"
                        onClick={handleApprove}
                        // disabled={loading || !technicianId}
                    >
                        {/* {loading ? 'Đang duyệt...' : 'Duyệt'} */}
                        Duyệt
                    </button>
                </div>
               
           
    
    );
};

export default ApproveTechnicianTest;