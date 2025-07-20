// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { fetchTechnicianDepositLogs, fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
// import { depositBalance, clearTransactionState, requestWithdraw } from '../../features/transactions/transactionSlice';
// import { toast } from 'react-toastify';
// import Header from '../../components/common/Header';
// import BreadcrumbBar from '../../components/common/BreadcrumbBar';
// import { Link } from 'react-router-dom';

// const styles = {
//   pagination: {
//     display: 'flex',
//     justifyContent: 'center',
//     marginTop: '20px',
//   },
//   paginationBtn: {
//     backgroundColor: '#f8f9fa',
//     border: '1px solid #dee2e6',
//     borderRadius: '4px',
//     color: '#6c757d',
//     padding: '5px 10px',
//     margin: '0 5px',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//   },
//   disabledBtn: {
//     opacity: 0.5,
//     cursor: 'not-allowed',
//   },
// };

// const TechnicianDeposit = () => {
//   const dispatch = useDispatch();
//   const { loading: transactionLoading, error: transactionError, successMessage } = useSelector((state) => state.transaction);
//   const [amount, setAmount] = useState('');
//   const [amountError, setAmountError] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('BANK');
//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [withdrawAmountError, setWithdrawAmountError] = useState(null);
//   const { user, technician } = useSelector((state) => state.auth);
//   const [page, setPage] = useState(0);
//   const limit = 5;
//   const { logs, loading, error, profile } = useSelector((state) => state.technician);
//   console.log(technician);



//   useEffect(() => {

//     dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
//   }, [dispatch, page]);

//   useEffect(() => {
//     console.log('Logs:', logs);
//     console.log('Error:', error);
//   }, [logs, error]);

//   const handleDepositSubmit = async (e) => {
//     e.preventDefault();
//     const parsedAmount = parseFloat(withdrawAmount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       setAmountError('Hãy nhập số');
//       return;
//     }
//     setAmountError(null);

//     try {
//       console.log('Submitting deposit with amount:', parsedAmount);
//       const resultAction = await dispatch(depositBalance(parsedAmount)).unwrap();
//       console.log('Deposit result:', resultAction);
//       const depositURL = resultAction;
//       if (depositURL) {
//         toast.success('Đang chuyển hướng đến cổng thanh toán...');
//         const modalElement = document.getElementById('deposit_modal');
//         const modal = window.bootstrap.Modal.getInstance(modalElement);
//         if (modal) {
//           modal.hide();
//         } else {
//           console.error('Bootstrap modal instance not found');
//         }
//         console.log('Redirecting to:', depositURL);
//         window.location.href = depositURL;
//       } else {
//         console.error('No deposit URL received');
//         toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
//       }
//     } catch (err) {
//       console.error('Deposit error:', err, {
//         message: err.message,
//         response: err.response ? {
//           status: err.response.status,
//           data: err.response.data
//         } : 'No response data'
//       });
//       toast.error(err.message || 'Có lỗi xảy ra khi xử lý nạp tiền. Vui lòng thử lại.');
//     }
//   };

//   const handleRequestWithdrawSubmit = async (e) => {
//     e.preventDefault();
//     const parsedAmount = parseFloat(amount);
//     if (isNaN(parsedAmount) || parsedAmount <= 0) {
//       setAmountError('Hãy nhập số tiền hợp lệ');
//       return;
//     }
//     setAmountError(null);

//     try {
//       console.log('Submitting withdraw request with amount:', parsedAmount);

//       const resultAction = await dispatch(requestWithdraw({
//         technicianId: technician._id,  // technician should be in component state or props
//         amount: parsedAmount,
//         paymentMethod  // bạn cần lấy từ input select hoặc định nghĩa trước (ví dụ: 'BANK_TRANSFER')
//       })).unwrap();

//       console.log('Withdraw request result:', resultAction);

//       toast.success('Yêu cầu rút tiền đã được gửi đến admin');

//       // Đóng modal
//       const modalElement = document.getElementById('withdraw_modal');
//       const modal = window.bootstrap.Modal.getInstance(modalElement);
//       if (modal) {
//         modal.hide();
//       } else {
//         console.error('Bootstrap modal instance not found');
//       }

//       // Reset input
//       setAmount('');
//       setPaymentMethod(''); // nếu bạn dùng input select

//     } catch (err) {
//       console.error('Withdraw request error:', err, {
//         message: err.message,
//         response: err.response ? {
//           status: err.response.status,
//           data: err.response.data
//         } : 'No response data'
//       });
//       toast.error(err.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền. Vui lòng thử lại.');
//     }
//   };

//   const handleAmountChange = (e) => {
//     setAmount(e.target.value);
//     setAmountError(null);
//   };

//   const getStatusBadgeClass = (status) => {
//     switch (status) {
//       case 'PENDING':
//         return 'badge-light-warning';
//       case 'APPROVED':
//         return 'badge-light-success';
//       case 'COMPLETED':
//         return 'badge-light-success';
//       case 'CANCELLED':
//         return 'badge-light-danger';
//       default:
//         return 'badge-light-secondary';
//     }
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 0) {
//       setPage(newPage);
//     }
//   };

//   return (
//     <div class="main-wrapper">
//       <Header />

//       <BreadcrumbBar />

//       <div className="dashboard-section">
//         <div className="container">
//           <div className="row">
//             <div className="col-lg-12">
//               <div className="dashboard-menu">
//                 <ul>
//                   <li>
//                     <Link to={`/technician`}>
//                       <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
//                       <span>Dashboard</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to={`/technician/booking`} >
//                       <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
//                       <span>My Bookings</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/technician/feedback">
//                       <img src="/public/img/icons/review-icon.svg" alt="Icon" />
//                       <span>Reviews</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/user-wishlist">
//                       <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
//                       <span>Wishlist</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/user-messages">
//                       <img src="/public/img/icons/message-icon.svg" alt="Icon" />
//                       <span>Messages</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to="/technician/deposit" className="active">
//                       <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
//                       <span>My Wallet</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to={`/technician/earning`}>
//                       <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
//                       <span>My Earnings</span>
//                     </Link>
//                   </li>
//                   <li>
//                     <Link to={`/technician/profile/${technician?._id}`}>
//                       <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
//                       <span>Settings</span>
//                     </Link>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="content">
//         <div className="container">

//           <div class="content-header">
//             <h4>Wallet</h4>
//           </div>

//           <div className="row">
//             <div className="col-lg-6 col-md-12 d-flex">
//               <div className="card wallet-card flex-fill">
//                 <div className="card-body">
//                   <div className="balance-info">
//                     <div className="balance-grid">
//                       <div className="balance-content">
//                         <h6>Số dư khả dụng</h6>
//                         <h4>{technician.balance.toLocaleString('vi-VN')} VND</h4>
//                       </div>
//                       <div className="refersh-icon">
//                         <a href="javascript:void(0);">
//                           <i className="fas fa-arrows-rotate"></i>
//                         </a>
//                       </div>
//                     </div>
//                     <div className="balance-list">
//                       <div className="row">
//                         <div className="col-lg-4 col-md-6 d-flex">
//                           <div className="balance-inner credit-info">
//                             <h6>{technician.totalEarning.toLocaleString('vi-VN')} VND</h6>
//                             <p>Tổng thu nhập</p>
//                           </div>
//                         </div>
//                         <div className="col-lg-4 col-md-6 d-flex">
//                           <div className="balance-inner debit-info">
//                             <h6>{technician.totalHoldingAmount.toLocaleString('vi-VN')} VND</h6>
//                             <p>Tổng tiền giữ lại</p>
//                           </div>
//                         </div>
//                         <div className="col-lg-4 col-md-6 d-flex">
//                           <div className="balance-inner transaction-info">
//                             <h6>{technician.totalWithdrawn.toLocaleString('vi-VN')} VND</h6>
//                             <p>Tổng tiền đã rút</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="row">
//                     <div className="wallet-btn">
//                       <button
//                         className="btn"
//                         data-bs-toggle="modal"
//                         data-bs-target="#withdraw_modal" // Đổi id này nếu modal của bạn dùng id khác
//                       >
//                         Rút
//                       </button>
//                     </div>
//                     <div className="wallet-btn">
//                       <a
//                         href="#deposit_modal"
//                         className="btn"
//                         data-bs-toggle="modal"
//                         data-bs-target="#deposit_modal"
//                       >
//                         Nạp
//                       </a>
//                     </div>
//                   </div>

//                 </div>
//               </div>
//             </div>

//             {/* <div className="col-lg-6 col-md-12 d-flex">
//                   <div className="card your-card flex-fill">
//                     <div className="card-body">
//                       <div className="balance-info">
//                         <div className="balance-grid">
//                         <div className="balance-content">
//                           <h6>Tài khoản </h6>
                          
//                         </div>
                        
//                       </div>
//                       </div>
                      
//                     </div>
//                   </div>
//                 </div> */}
//           </div>
//           <div className="col-lg-12 d-flex">
//             <div className="card book-card flex-fill mb-0">
//               <div className="row">
//                 <div className="card-body">
//                   <div className="card-header">
//                     <div className="row align-items-center">
//                       <div className="col-md-5">
//                         <h4>
//                           Lịch sử giao dịch <span>{Array.isArray(logs) ? logs.length : 0}</span>
//                         </h4>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="table-responsive dashboard-table">
//                     <table className="table datatable">
//                       <thead className="thead-light">
//                         <tr>
//                           <th>Loại</th>
//                           <th>Số tiền</th>
//                           <th>Cách thức thanh toán</th>
//                           <th>Ngày</th>
//                           <th>Trạng Thái</th>
//                           <th></th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {loading ? (
//                           <tr>
//                             <td colSpan="10" className="text-center">
//                               Đang tải...
//                             </td>
//                           </tr>
//                         ) : error ? (
//                           <tr>
//                             <td colSpan="10" className="text-center text-danger">
//                               {error}
//                             </td>
//                           </tr>
//                         ) : !Array.isArray(logs) || logs.length === 0 ? (
//                           <tr>
//                             <td colSpan="10" className="text-center">
//                               Không có giao dịch nào
//                             </td>
//                           </tr>
//                         ) : (
//                           logs.map((log) => (
//                             <tr key={log._id}>
//                               <td>{log.type}</td>
//                               <td>{log.amount.toFixed(2)}đ</td>
//                               <td>{log.paymentMethod || 'N/A'}</td>
//                               <td>{new Date(log.createdAt).toLocaleString()}</td>
//                               <td>
//                                 <span className={`badge ${getStatusBadgeClass(log.status)}`}>
//                                   {log.status}
//                                 </span>
//                               </td>
//                               <td className="text-end">
//                                 <div className="dropdown dropdown-action">
//                                   <a
//                                     href="javascript:void(0);"
//                                     className="dropdown-toggle"
//                                     data-bs-toggle="dropdown"
//                                     aria-expanded="false"
//                                   >
//                                     <i className="fas fa-ellipsis-vertical"></i>
//                                   </a>
//                                   <div className="dropdown-menu dropdown-menu-end">
//                                     <a
//                                       className="dropdown-item"
//                                       href="javascript:void(0);"
//                                       data-bs-toggle="modal"
//                                       data-bs-target={`#view_deposit_${log._id}`}
//                                     >
//                                       <i className="feather-eye"></i> Chi tiết
//                                     </a>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                   <div className="table-footer">
//                     <div className="row">
//                       <div className="col-md-6">
//                         <div id="tablelength"></div>
//                       </div>
//                       <div className="col-md-6 text-md-end">
//                         <div id="tablepage"></div>
//                       </div>
//                     </div>
//                   </div>
//                   <div style={styles.pagination}>
//                     <button
//                       style={{
//                         ...styles.paginationBtn,
//                         ...(page === 0 ? styles.disabledBtn : {}),
//                       }}
//                       onClick={() => handlePageChange(page - 1)}
//                       disabled={page === 0}
//                     >
//                       Trang Trước
//                     </button>
//                     <button
//                       style={{
//                         ...styles.paginationBtn,
//                         ...(logs.length < limit ? styles.disabledBtn : {}),
//                       }}
//                       onClick={() => handlePageChange(page + 1)}
//                       disabled={logs.length < limit}
//                     >
//                       Trang Sau
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Deposit Modal */}
//             <div
//               className="modal new-modal fade"
//               id="deposit_modal"
//               data-bs-keyboard="false"
//               data-bs-backdrop="static"
//             >
//               <div className="modal-dialog modal-dialog-centered modal-md">
//                 <div className="modal-content">
//                   <div className="modal-header">
//                     <h4 className="modal-title">Khoản Giao Dịch</h4>
//                     <button
//                       type="button"
//                       className="close-btn"
//                       data-bs-dismiss="modal"
//                       onClick={() => {
//                         setAmount('');
//                         setAmountError(null);
//                         dispatch(clearTransactionState());
//                       }}
//                     >
//                       <span>×</span>
//                     </button>
//                   </div>
//                   <div className="modal-body">
//                     <form onSubmit={handleDepositSubmit}>
//                       <div className="row">
//                         <div className="col-md-12">
//                           <div className="modal-form-group">
//                             <label>
//                               Số tiền <span className="text-danger">*</span>
//                             </label>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Nhập số tiền"
//                               value={withdrawAmount}
//                               onChange={handleAmountChange}
//                             />
//                             {amountError && (
//                               <small className="text-danger">{amountError}</small>
//                             )}
//                             {transactionError && (
//                               <small className="text-danger">{transactionError}</small>
//                             )}
//                             {successMessage && (
//                               <small className="text-success">{successMessage}</small>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="modal-btn modal-btn-sm">
//                         <button
//                           type="button"
//                           className="btn btn-secondary"
//                           data-bs-dismiss="modal"
//                           onClick={() => {
//                             setAmount('');
//                             setAmountError(null);
//                             dispatch(clearTransactionState());
//                           }}
//                         >
//                           Thoát
//                         </button>
//                         <button
//                           type="submit"
//                           className="btn btn-primary"
//                           disabled={transactionLoading}
//                         >
//                           {transactionLoading ? 'Xử lý...' : 'Nạp'}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Withdraw Modal */}
//             <div
//               className="modal new-modal fade"
//               id="withdraw_modal"
//               data-bs-keyboard="false"
//               data-bs-backdrop="static"
//             >
//               <div className="modal-dialog modal-dialog-centered modal-md">
//                 <div className="modal-content">
//                   <div className="modal-header">
//                     <h4 className="modal-title">Yêu Cầu Rút Tiền</h4>
//                     <button
//                       type="button"
//                       className="close-btn"
//                       data-bs-dismiss="modal"
//                       onClick={() => {
//                         setWithdrawAmount('');
//                         setWithdrawAmountError(null);
//                         dispatch(clearTransactionState());
//                       }}
//                     >
//                       <span>×</span>
//                     </button>
//                   </div>
//                   <div className="modal-body">
//                     <form onSubmit={handleRequestWithdrawSubmit}>
//                       <div className="row">
//                         <div className="col-md-12">
//                           <div className="modal-form-group">
//                             <label>
//                               Số tiền <span className="text-danger">*</span>
//                             </label>
//                             <input
//                               type="text"
//                               className="form-control"
//                               placeholder="Nhập số tiền muốn rút"
//                               value={withdrawAmount}
//                               onChange={(e) => setWithdrawAmount(e.target.value)}
//                             />
//                             {withdrawAmountError && (
//                               <small className="text-danger">{withdrawAmountError}</small>
//                             )}
//                             {transactionError && (
//                               <small className="text-danger">{transactionError}</small>
//                             )}
//                             {successMessage && (
//                               <small className="text-success">{successMessage}</small>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="modal-btn modal-btn-sm">
//                         <button
//                           type="button"
//                           className="btn btn-secondary"
//                           data-bs-dismiss="modal"
//                           onClick={() => {
//                             setWithdrawAmount('');
//                             setWithdrawAmountError(null);
//                             dispatch(clearTransactionState());
//                           }}
//                         >
//                           Thoát
//                         </button>
//                         <button
//                           type="submit"
//                           className="btn btn-primary"
//                           disabled={transactionLoading}
//                         >
//                           {transactionLoading ? 'Đang xử lý...' : 'Rút tiền'}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>


//             {/* View Deposit Modals */}
//             {Array.isArray(logs) && logs.map((log) => (
//               <div
//                 key={log._id}
//                 className="modal new-modal fade"
//                 id={`view_deposit_${log._id}`}
//                 data-bs-keyboard="false"
//                 data-bs-backdrop="static"
//               >
//                 <div className="modal-dialog modal-dialog-centered modal-md">
//                   <div className="modal-content">
//                     <div className="modal-header">
//                       <h4 className="modal-title">Chi tiết Giao Dịch</h4>
//                       <button
//                         type="button"
//                         className="close-btn"
//                         data-bs-dismiss="modal"
//                       >
//                         <span>×</span>
//                       </button>
//                     </div>
//                     <div className="modal-body">
//                       <div className="row">
//                         <div className="col-md-12">
//                           <p>
//                             <strong>Mã giao dịch:</strong> {log.transactionCode || log._id}
//                           </p>
//                           <p>
//                             <strong>Loại:</strong> {log.type}
//                           </p>
//                           <p>
//                             <strong>Số tiền:</strong> ${log.amount.toFixed(2)}
//                           </p>
//                           <p>
//                             <strong>Trạng thái:</strong> {log.status}
//                           </p>
//                           <p>
//                             <strong>Cách thức:</strong> {log.paymentMethod || 'N/A'}
//                           </p>
//                           <p>
//                             <strong>Trước giao dịch:</strong> ${log.balanceBefore.toFixed(2)}
//                           </p>
//                           <p>
//                             <strong>Sau giao dịch:</strong>{' '}
//                             {log.balanceAfter
//                               ? `$${log.balanceAfter.toFixed(2)}`
//                               : 'N/A'}
//                           </p>
//                           <p>
//                             <strong>Ngày:</strong> {new Date(log.createdAt).toLocaleString()}
//                           </p>
//                           <p>
//                             <strong>Note:</strong> {log.note || 'N/A'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="modal-btn modal-btn-sm">
//                         <button
//                           type="button"
//                           className="btn btn-secondary"
//                           data-bs-dismiss="modal"
//                         >
//                           Tắt
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>


//   );
// };

// export default TechnicianDeposit;

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTechnicianDepositLogs, fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { depositBalance, clearTransactionState, withdrawBalance } from '../../features/transactions/transactionSlice';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import { Link } from 'react-router-dom';

const styles = {
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  paginationBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    color: '#6c757d',
    padding: '5px 10px',
    margin: '0 5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const TechnicianDeposit = () => {
  const dispatch = useDispatch();
  const { loading: transactionLoading, error: transactionError, successMessage } = useSelector((state) => state.transaction);
  
  // States for Deposit
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);
  
  // States for Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAmountError, setWithdrawAmountError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const {technician } = useSelector((state) => state.auth);
  const technicianId = technician._id;
  console.log(technicianId);
  
  const [page, setPage] = useState(0);
  const limit = 5;
  const { logs, loading, error, profile } = useSelector((state) => state.technician);

  useEffect(() => {
    dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
  }, [dispatch, page]);

  useEffect(() => {
    console.log('Logs:', logs);
    console.log('Error:', error);
  }, [logs, error]);

  // SỬAA LỖI: handleDepositSubmit - sử dụng đúng biến amount
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount); // SỬA: từ withdrawAmount thành amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Hãy nhập số tiền hợp lệ');
      return;
    }
    setAmountError(null);

    try {
      console.log('Submitting deposit with amount:', parsedAmount);
      const resultAction = await dispatch(depositBalance(parsedAmount)).unwrap();
      console.log('Deposit result:', resultAction);
      const depositURL = resultAction;
      if (depositURL) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');
        const modalElement = document.getElementById('deposit_modal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        } else {
          console.error('Bootstrap modal instance not found');
        }
        console.log('Redirecting to:', depositURL);
        window.location.href = depositURL;
      } else {
        console.error('No deposit URL received');
        toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Deposit error:', err, {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response data'
      });
      toast.error(err.message || 'Có lỗi xảy ra khi xử lý nạp tiền. Vui lòng thử lại.');
    }
  };

  // SỬA LỖI: handleRequestWithdrawSubmit - sử dụng đúng biến withdrawAmount
  const handleRequestWithdrawSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount); // SỬA: từ amount thành withdrawAmount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWithdrawAmountError('Hãy nhập số tiền hợp lệ'); // SỬA: setWithdrawAmountError
      return;
    }

    // THÊM: Kiểm tra số dư
    if (parsedAmount > technician.balance) {
      setWithdrawAmountError('Số tiền rút không được vượt quá số dư khả dụng');
      return;
    }

    setWithdrawAmountError(null);

    try {
      console.log('Submitting withdraw request with amount:', parsedAmount);
      console.log("te",technicianId);
      
      
      const resultAction = await dispatch(withdrawBalance({
        technicianId: technicianId,
        amount: parsedAmount,
        paymentMethod
      })).unwrap();

      console.log('Withdraw request result:', resultAction);
      toast.success('Yêu cầu rút tiền đã được gửi đến admin');

      // Đóng modal
      const modalElement = document.getElementById('withdraw_modal');
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      } else {
        console.error('Bootstrap modal instance not found');
      }

      // Reset input - SỬA: reset đúng các state
      setWithdrawAmount('');
      setPaymentMethod('BANK');
      
      // THÊM: Refresh logs
      dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));

    } catch (err) {
      console.error('Withdraw request error:', err, {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response data'
      });
      toast.error(err.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền. Vui lòng thử lại.');
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(null);
  };

  // THÊM: Handler cho withdraw amount
  const handleWithdrawAmountChange = (e) => {
    setWithdrawAmount(e.target.value);
    setWithdrawAmountError(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-light-warning';
      case 'APPROVED':
        return 'badge-light-success';
      case 'COMPLETED':
        return 'badge-light-success';
      case 'CANCELLED':
        return 'badge-light-danger';
      default:
        return 'badge-light-secondary';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0) {
      setPage(newPage);
    }
  };

  return (
    <div className="main-wrapper"> {/* SỬA: className thay vì class */}
      <Header />
      <BreadcrumbBar />

      <div className="dashboard-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="dashboard-menu">
                <ul>
                  <li>
                    <Link to={`/technician`}>
                      <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/booking`} >
                      <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                      <span>My Bookings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/feedback">
                      <img src="/public/img/icons/review-icon.svg" alt="Icon" />
                      <span>Reviews</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/user-wishlist">
                      <img src="/public/img/icons/wishlist-icon.svg" alt="Icon" />
                      <span>Wishlist</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/user-messages">
                      <img src="/public/img/icons/message-icon.svg" alt="Icon" />
                      <span>Messages</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/deposit" className="active">
                      <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                      <span>My Wallet</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/earning`}>
                      <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                      <span>My Earnings</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/profile/${technician?._id}`}>
                      <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
                      <span>Settings</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container">
          <div className="content-header"> {/* SỬA: className thay vì class */}
            <h4>Wallet</h4>
          </div>

          <div className="row">
            <div className="col-lg-6 col-md-12 d-flex">
              <div className="card wallet-card flex-fill">
                <div className="card-body">
                  <div className="balance-info">
                    <div className="balance-grid">
                      <div className="balance-content">
                        <h6>Số dư khả dụng</h6>
                        <h4>{technician.balance.toLocaleString('vi-VN')} VND</h4>
                      </div>
                      <div className="refersh-icon">
                        <a href="javascript:void(0);">
                          <i className="fas fa-arrows-rotate"></i>
                        </a>
                      </div>
                    </div>
                    <div className="balance-list">
                      <div className="row">
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner credit-info">
                            <h6>{technician.totalEarning.toLocaleString('vi-VN')} VND</h6>
                            <p>Tổng thu nhập</p>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner debit-info">
                            <h6>{technician.totalHoldingAmount.toLocaleString('vi-VN')} VND</h6>
                            <p>Tổng tiền giữ lại</p>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner transaction-info">
                            <h6>{technician.totalWithdrawn.toLocaleString('vi-VN')} VND</h6>
                            <p>Tổng tiền đã rút</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="wallet-btn">
                      <button
                        className="btn"
                        data-bs-toggle="modal"
                        data-bs-target="#withdraw_modal"
                      >
                        Rút
                      </button>
                    </div>
                    <div className="wallet-btn">
                      <a
                        href="#deposit_modal"
                        className="btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deposit_modal"
                      >
                        Nạp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12 d-flex">
            <div className="card book-card flex-fill mb-0">
              <div className="row">
                <div className="card-body">
                  <div className="card-header">
                    <div className="row align-items-center">
                      <div className="col-md-5">
                        <h4>
                          Lịch sử giao dịch <span>{Array.isArray(logs) ? logs.length : 0}</span>
                        </h4>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive dashboard-table">
                    <table className="table datatable">
                      <thead className="thead-light">
                        <tr>
                          <th>Loại</th>
                          <th>Số tiền</th>
                          <th>Cách thức thanh toán</th>
                          <th>Ngày</th>
                          <th>Trạng Thái</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="10" className="text-center">
                              Đang tải...
                            </td>
                          </tr>
                        ) : error ? (
                          <tr>
                            <td colSpan="10" className="text-center text-danger">
                              {error}
                            </td>
                          </tr>
                        ) : !Array.isArray(logs) || logs.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="text-center">
                              Không có giao dịch nào
                            </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                            <tr key={log._id}>
                              <td>{log.type}</td>
                              <td>{log.amount.toFixed(2)}đ</td>
                              <td>{log.paymentMethod || 'N/A'}</td>
                              <td>{new Date(log.createdAt).toLocaleString()}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="dropdown dropdown-action">
                                  <a
                                    href="javascript:void(0);"
                                    className="dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    <i className="fas fa-ellipsis-vertical"></i>
                                  </a>
                                  <div className="dropdown-menu dropdown-menu-end">
                                    <a
                                      className="dropdown-item"
                                      href="javascript:void(0);"
                                      data-bs-toggle="modal"
                                      data-bs-target={`#view_deposit_${log._id}`}
                                    >
                                      <i className="feather-eye"></i> Chi tiết
                                    </a>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div style={styles.pagination}>
                    <button
                      style={{
                        ...styles.paginationBtn,
                        ...(page === 0 ? styles.disabledBtn : {}),
                      }}
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                    >
                      Trang Trước
                    </button>
                    <button
                      style={{
                        ...styles.paginationBtn,
                        ...(logs.length < limit ? styles.disabledBtn : {}),
                      }}
                      onClick={() => handlePageChange(page + 1)}
                      disabled={logs.length < limit}
                    >
                      Trang Sau
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit Modal - SỬA LỖI */}
            <div
              className="modal new-modal fade"
              id="deposit_modal"
              data-bs-keyboard="false"
              data-bs-backdrop="static"
            >
              <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">Khoản Giao Dịch</h4>
                    <button
                      type="button"
                      className="close-btn"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        setAmount('');
                        setAmountError(null);
                        dispatch(clearTransactionState());
                      }}
                    >
                      <span>×</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleDepositSubmit}>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="modal-form-group">
                            <label>
                              Số tiền <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Nhập số tiền"
                              value={amount} // SỬA: từ withdrawAmount thành amount
                              onChange={handleAmountChange} // SỬA: sử dụng đúng handler
                              min="1"
                            />
                            {amountError && (
                              <small className="text-danger">{amountError}</small>
                            )}
                            {transactionError && (
                              <small className="text-danger">{transactionError}</small>
                            )}
                            {successMessage && (
                              <small className="text-success">{successMessage}</small>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="modal-btn modal-btn-sm">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                          onClick={() => {
                            setAmount('');
                            setAmountError(null);
                            dispatch(clearTransactionState());
                          }}
                        >
                          Thoát
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={transactionLoading}
                        >
                          {transactionLoading ? 'Xử lý...' : 'Nạp'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdraw Modal - SỬA LỖI */}
            <div
              className="modal new-modal fade"
              id="withdraw_modal"
              data-bs-keyboard="false"
              data-bs-backdrop="static"
            >
              <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content">
                  <div className="modal-header">
                    <h4 className="modal-title">Yêu Cầu Rút Tiền</h4>
                    <button
                      type="button"
                      className="close-btn"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        setWithdrawAmount('');
                        setWithdrawAmountError(null);
                        setPaymentMethod('BANK');
                        dispatch(clearTransactionState());
                      }}
                    >
                      <span>×</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleRequestWithdrawSubmit}>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="modal-form-group">
                            <label>
                              Số dư khả dụng: <strong>{technician.balance.toLocaleString('vi-VN')} VND</strong>
                            </label>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="modal-form-group">
                            <label>
                              Số tiền <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Nhập số tiền muốn rút"
                              value={withdrawAmount}
                              onChange={handleWithdrawAmountChange} // SỬA: sử dụng đúng handler
                              max={technician.balance}
                              min="1"
                            />
                            {withdrawAmountError && (
                              <small className="text-danger">{withdrawAmountError}</small>
                            )}
                            {transactionError && (
                              <small className="text-danger">{transactionError}</small>
                            )}
                            {successMessage && (
                              <small className="text-success">{successMessage}</small>
                            )}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="modal-form-group">
                            <label>
                              Phương thức thanh toán <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-control"
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                              <option value="BANK">Chuyển khoản ngân hàng</option>
                              <option value="MOMO">Ví MoMo</option>
                              <option value="ZALOPAY">ZaloPay</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="modal-btn modal-btn-sm">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                          onClick={() => {
                            setWithdrawAmount('');
                            setWithdrawAmountError(null);
                            setPaymentMethod('BANK');
                            dispatch(clearTransactionState());
                          }}
                        >
                          Thoát
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={transactionLoading}
                        >
                          {transactionLoading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* View Deposit Modals */}
            {Array.isArray(logs) && logs.map((log) => (
              <div
                key={log._id}
                className="modal new-modal fade"
                id={`view_deposit_${log._id}`}
                data-bs-keyboard="false"
                data-bs-backdrop="static"
              >
                <div className="modal-dialog modal-dialog-centered modal-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h4 className="modal-title">Chi tiết Giao Dịch</h4>
                      <button
                        type="button"
                        className="close-btn"
                        data-bs-dismiss="modal"
                      >
                        <span>×</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-12">
                          <p>
                            <strong>Mã giao dịch:</strong> {log.transactionCode || log._id}
                          </p>
                          <p>
                            <strong>Loại:</strong> {log.type}
                          </p>
                          <p>
                            <strong>Số tiền:</strong> {log.amount.toLocaleString('vi-VN')} VND {/* SỬA: format VND */}
                          </p>
                          <p>
                            <strong>Trạng thái:</strong> {log.status}
                          </p>
                          <p>
                            <strong>Cách thức:</strong> {log.paymentMethod || 'N/A'}
                          </p>
                          <p>
                            <strong>Trước giao dịch:</strong> {log.balanceBefore.toLocaleString('vi-VN')} VND {/* SỬA: format VND */}
                          </p>
                          <p>
                            <strong>Sau giao dịch:</strong>{' '}
                            {log.balanceAfter
                              ? `${log.balanceAfter.toLocaleString('vi-VN')} VND` /* SỬA: format VND */
                              : 'N/A'}
                          </p>
                          <p>
                            <strong>Ngày:</strong> {new Date(log.createdAt).toLocaleString()}
                          </p>
                          <p>
                            <strong>Note:</strong> {log.note || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="modal-btn modal-btn-sm">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          data-bs-dismiss="modal"
                        >
                          Tắt
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDeposit;