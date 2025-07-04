// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { fetchTechnicianJobs, fetchTechnicianJobDetails } from '../../features/technician/technicianSlice';
// import Sidebar from '../../components/common/Sidebar';

// const TechnicianJobList = () => {
//     const dispatch = useDispatch();
//     const { technicianId } = useParams();
//     const { bookings, loading, error } = useSelector((state) => state.technician);

//     useEffect(() => {
//         if (technicianId) {
//             dispatch(fetchTechnicianJobs(technicianId));
//         }
//     }, [technicianId, dispatch]);

//     if (loading) return <p>Loading bookings...</p>;
//     if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

//     const handleViewDetails = (bookingId, technicianId) => {
//         dispatch(fetchTechnicianJobDetails({ bookingId, technicianId }));
//     };

//     return (

//         <>
//             <div>
//                 <Sidebar />
//             </div>
//             <div className="page-wrapper">
//                 <div className="content pb-0">
//                     {/* Breadcrumb */}
//                     <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
//                         <div className="my-auto mb-2">
//                             <h4 className="mb-1">Dashboard</h4>
//                             <nav>
//                                 <ol className="breadcrumb mb-0">
//                                     <li className="breadcrumb-item">
//                                         <a href="">Home</a>
//                                     </li>
//                                     <li className="breadcrumb-item active" aria-current="page">Technician Dashboard</li>
//                                 </ol>
//                             </nav>
//                         </div>

//                     </div>
//                     <div className="row">
//                         <div className="col-md-12">
//                             <div className="card">
//                                 <div className="card-body">
//                                     <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
//                                         <h5 className="mb-1">Job</h5>
//                                         <a
//                                             href=""
//                                             className="text-decoration-underline fw-medium mb-1"
//                                         >
//                                             View All
//                                         </a>
//                                     </div>
//                                     <div className="custom-table table-responsive">
//                                         <table className="table datatable">
//                                             <thead className="thead-light">
//                                                 <tr>
//                                                     <th>Mã đơn</th>
//                                                     <th>Tên khách hàng</th>
//                                                     <th>Dịch vụ</th>
//                                                     <th>Địa chỉ</th>
//                                                     <th>Ngày</th>
//                                                     <th>Trạng thái</th>
//                                                     <th>Hành động</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {Array.isArray(bookings) && bookings.map((b) => (
//                                                     <tr key={b.bookingId || b._id}>
//                                                         <td>{b.bookingCode}</td>
//                                                         <td>{b.customerName}</td>
//                                                         <td>{b.serviceName}</td>
//                                                         <td>{b.address}</td>
//                                                         <td>{new Date(b.schedule).toLocaleString()}</td>
//                                                         <td>{b.status}</td>
//                                                         <td>
//                                                             <button
//                                                                 className="btn btn-sm btn-primary"
//                                                                 onClick={() => handleViewDetails(b._id, b.technicianId)}
//                                                             >
//                                                                 Xem chi tiết
//                                                             </button>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                 </div>
//             </div>






//         </>
//     );
// }

// export default TechnicianJobList;