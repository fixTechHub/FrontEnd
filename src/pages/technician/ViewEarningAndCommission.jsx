import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchEarningAndCommission } from '../../features/technicians/technicianSlice';
import { useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import "../../../public/css/style.css";

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
            <div>
                <Sidebar />
            </div>
            <div className="page-wrapper">
                <div className="content pb-0">
                    {/* Breadcrumb */}
                    <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
                        <div className="my-auto mb-2">
                            <h4 className="mb-1">Dashboard</h4>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <a href="">Home</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">Technician Dashboard</li>
                                </ol>
                            </nav>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
                                        <h5 className="mb-1">Earning</h5>
                                        <a
                                            href=""
                                            className="text-decoration-underline fw-medium mb-1"
                                        >
                                            View All
                                        </a>
                                    </div>
                                    <div className="custom-table table-responsive">
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
                                                    <tr key={item.bookingId}> {/* key nên dùng bookingId thay vì _id */}
                                                        <td>{item.bookingInfo?.customerName?.fullName || 'Không có'}</td>
                                                        <td>{item.bookingInfo?.service?.serviceName || 'Không có'}</td>
                                                        <td>{item.finalPrice} VNĐ</td>
                                                        <td>{item.commissionAmount} VNĐ</td>
                                                        <td>{item.holdingAmount} VNĐ</td>
                                                        <td>{item.technicianEarning} VNĐ</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default ViewEarningAndCommission;
