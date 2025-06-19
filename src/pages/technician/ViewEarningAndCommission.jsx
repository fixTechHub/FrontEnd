import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchEarningAndCommission } from '../../features/technicians/technicianSlice';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

function ViewEarningAndCommission() {
    const dispatch = useDispatch();
    const { technicianId } = useParams();
    const { earnings, loading, error } = useSelector((state) => state.technician);

    useEffect(() => {
        if (technicianId) {
            dispatch(fetchEarningAndCommission(technicianId));
        }
    }, [dispatch, technicianId]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;
    if (!earnings || earnings.length === 0) return <p>Không có dữ liệu thu nhập.</p>;

    return (

        <>
            <Header />


            <div style={{ display: 'flex' }}>
                <div>
                    <Sidebar />
                </div>
                <div className="custom-datatable-filter table-responsive brandstable country-table">
                    <table className="table datatable">
                        <thead className="thead-light">
                            <tr>
                                <th>Khách hàng</th>
                                <th>Dịch vụ</th>
                                <th>Giá cuối</th>
                                <th>Hoa hồng</th>
                                <th>Giữ lại</th>
                                <th>Thu nhập kỹ thuật viên</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.bookingInfo?.customerName?.fullName || 'Không có'}</td>
                                    <td>{item.bookingInfo?.serviceName || 'Không có'}</td>
                                    <td>{item.finalPrice} VNĐ</td>
                                    <td>{item.commission} VNĐ</td>
                                    <td>{item.retained} VNĐ</td>
                                    <td>{item.technicianEarling} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>



        </>
    );
}

export default ViewEarningAndCommission;
