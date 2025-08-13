import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTechnicianDepositLogs, fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { depositBalance, clearTransactionState, withdrawBalance, subscriptionBalance, extendSubscription } from '../../features/transactions/transactionSlice';
import { fetchCurrentSubscription, getAllPackages } from '../../features/package/packageSlice';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import { Link } from 'react-router-dom';

const styles = {
  // ===== Pagination =====
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '6px',
  },
  paginationBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    color: '#495057',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeBtn: {
    backgroundColor: '#0d6efd',
    color: '#fff',
    borderColor: '#0d6efd',
    boxShadow: '0 2px 6px rgba(13,110,253,0.3)',
  },
  hoverBtn: {
    backgroundColor: '#e9ecef',
    borderColor: '#ced4da',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  }
};


const TechnicianDeposit = () => {
  const dispatch = useDispatch();
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('vi-VN'); // kết quả dạng dd/mm/yyyy
  };
  const { loading: transactionLoading, error: transactionError, successMessage } = useSelector((state) => state.transaction);
  const { currentSubscription, status: subscriptionStatus, error: subscriptionError } = useSelector(
    (state) => state.technicianSubscription
  );
  const packages = useSelector((state) => state.technicianSubscription.all);
  const status = useSelector((state) => state.technicianSubscription.status);
  console.log("package", currentSubscription);
  console.log("pac", packages);


  // States for Deposit
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);

  // States for Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAmountError, setWithdrawAmountError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const [months, setMonths] = useState(1);
  const { technician } = useSelector((state) => state.auth);
  const technicianId = technician._id;
  console.log(technician);

  const [page, setPage] = useState(0);
  const limit = 5;
  const { logs, loading, error, profile } = useSelector((state) => state.technician);

  const [showPackages, setShowPackages] = useState(false);

  // useEffect(() => {
  //   dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
  //   dispatch(fetchCurrentSubscription(technicianId));
  // }, [dispatch, page, technicianId]);
  useEffect(() => {
    if (technicianId) {
      dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
      dispatch(fetchCurrentSubscription(technicianId));
    }
  }, [dispatch, page, technicianId]);

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
        console.error('❌ Lỗi tạo link thanh toán gia hạn:', error);
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

  const handleSubscriptionSubmit = async (selectedPackage) => {
    if (!selectedPackage || !selectedPackage.price) {
      toast.error('Gói không hợp lệ!');
      return;
    }

    try {
      const packagePrice = selectedPackage.price;
      console.log('Submitting subscription with amount:', packagePrice);

      // Gọi API qua Redux thunk hoặc trực tiếp axios/fetch
      const resultAction = await dispatch(subscriptionBalance({
        amount: packagePrice,
        packageId: selectedPackage._id, // Gửi kèm ID gói!
      })).unwrap();
      const depositURL = resultAction;

      if (depositURL) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');

        // Nếu đang ở trong modal, có thể đóng modal lại
        const modalElement = document.getElementById('upgradePackageModal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        } else {
          console.warn('Không tìm thấy instance của modal để đóng');
        }

        console.log('Redirecting to:', depositURL);
        window.location.href = depositURL;
      } else {
        console.error('Không có URL thanh toán trả về');
        toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Subscription error:', err, {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'No response data'
      });
      toast.error(err.message || 'Có lỗi xảy ra khi xử lý nâng cấp. Vui lòng thử lại.');
    }
  };

  const handleExtendSubmit = async () => {
    const pkg = currentSubscription?.data?.package;

    if (!pkg || !pkg.price || !pkg._id) {
      toast.error('Gói không hợp lệ!');
      return;
    }
    console.log("👨‍🔧 technicianId:", technicianId);
    console.log("📦 packageId:", pkg._id);
    console.log("📆 months:", months);

    try {
      const resultAction = await dispatch(extendSubscription({
        technicianId: technicianId,
        packageId: pkg._id,
        days: months * 30,
      })).unwrap();

      const checkoutUrl = resultAction;
      console.log('✅ resultAction:', resultAction);
      if (checkoutUrl) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');
        const modalElement = document.getElementById('extendPackageModal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        window.location.href = checkoutUrl;
      } else {
        toast.error('Không thể tạo link thanh toán');
      }
    } catch (err) {
      console.error('Extend subscription error:', err);
      toast.error(err.message || 'Có lỗi khi xử lý gia hạn. Vui lòng thử lại.');
    }
  };

  const handleExtendClick = () => {
    const modalElement = document.getElementById('extendPackageModal');
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
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
      console.log("te", technicianId);


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

  const handleUpgradeClick = () => {
    dispatch(getAllPackages());

    const modal = new bootstrap.Modal(document.getElementById("upgradePackageModal"));
    modal.show();
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
                    <Link to={`/technician`} >
                      <img src="/public/img/icons/dashboard-icon.svg" alt="Icon" />
                      <span>Bảng điểu khiển</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/booking`} >
                      <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                      <span>Đơn hàng</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/feedback">
                      <img src="/public/img/icons/review-icon.svg" alt="Icon" />
                      <span>Đánh giá</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/${technicianId}/certificate`}>
                      <img style={{ height: '28px' }} src="/public/img/cer.png" alt="Icon" />
                      <span>Chứng chỉ</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/schedule">
                      <img src="/public/img/icons/booking-icon.svg" alt="Icon" />
                      <span>Lịch trình</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/deposit" className="active">
                      <img src="/public/img/icons/wallet-icon.svg" alt="Icon" />
                      <span>Ví của tôi</span>
                    </Link>
                  </li>
                  {/* <li>
                    <Link to={`/technician/earning`}>
                      <img src="/public/img/icons/payment-icon.svg" alt="Icon" />
                      <span>Thu nhập</span>
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link to={`/profile`}>
                      <img src="/public/img/icons/settings-icon.svg" alt="Icon" />
                      <span>Cái đặt</span>
                    </Link>
                  </li> */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="container">
          <div className="content-header"> {/* SỬA: className thay vì class */}
            <h4>Ví của tôi</h4>
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
                  <div className="d-flex justify-content-end gap-2">
                    <div className="wallet-btn">
                      <button
                        className="btn"
                        data-bs-toggle="modal"
                        data-bs-target="#withdraw_modal"
                      >
                        Rút
                      </button>
                    </div>
                    {/* <div className="wallet-btn">
                      <a
                        href="#deposit_modal"
                        className="btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deposit_modal"
                      >
                        Nạp
                      </a>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 d-flex">
              <div className="card flex-fill shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Gói dịch vụ của bạn</h4>
                    <span className="badge bg-success">
                      {currentSubscription?.data?.status === "ACTIVE" ? "Đang hoạt động" : "Hết hạn"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-primary fw-bold">{currentSubscription?.data?.package?.name}</h5>
                    <p className="mb-1 text-muted">{currentSubscription?.data?.package?.description}</p>
                  </div>

                  <ul className="list-group mb-4">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Ngày bắt đầu</span>
                      <strong>{formatDate(currentSubscription?.data?.startDate)}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Ngày hết hạn</span>
                      <strong>{formatDate(currentSubscription?.data?.endDate)}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Giá</span>
                      <strong>
                        {currentSubscription?.data?.package?.price.toLocaleString("vi-VN")}đ/tháng
                      </strong>
                    </li>
                  </ul>

                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-primary" onClick={handleUpgradeClick}>Nâng cấp</button>
                    <button className="btn btn-primary" onClick={handleExtendClick}>Gia hạn</button>
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
                              {/* <option value="MOMO">Ví MoMo</option>
                              <option value="ZALOPAY">ZaloPay</option> */}
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

            {/* ✅ MODAL NÂNG CẤP GÓI */}
            <div
              className="modal fade"
              id="upgradePackageModal"
              tabIndex="-1"
              aria-labelledby="upgradeModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="upgradeModalLabel">
                      Chọn gói nâng cấp
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body">
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                      {packages.map((item) => (
                        <div
                          key={item._id}
                          className="card flex-fill text-center shadow-sm package-card"
                        >
                          <div className="card-body d-flex flex-column">
                            <h5 className="card-title">{item.name}</h5>
                            <p className="card-text flex-grow-1">{item.description}</p>
                            <p className="text-warning fw-bold mb-3">
                              {item.price.toLocaleString()}đ / tháng
                            </p>
                            <button
                              className="btn btn-success mt-auto align-self-center"
                              onClick={() => handleSubscriptionSubmit(item)}
                            >
                              Chọn gói
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <div className="modal fade" id="extendPackageModal" tabIndex="-1" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Gia hạn gói dịch vụ</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
                  </div>
                  <div className="modal-body">
                    <label className="form-label">Chọn thời gian gia hạn:</label>
                    <select
                      className="form-select"
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                    >
                      <option value={1}>1 tháng</option>
                      <option value={3}>3 tháng</option>
                      <option value={6}>6 tháng</option>
                      <option value={12}>1 năm (12 tháng)</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button
                      type="button" // tránh submit form gây reload
                      className="btn btn-primary"
                      onClick={handleExtendSubmit}
                    >
                      Xác nhận thanh toán
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Backdrop đẹp hơn một chút */
.modal-backdrop.show{
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(2px);
}

/* Khung modal */
.upgrade-modal{
  border: 1px solid #e6eaf2;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(2,6,23,.25);
}

/* Header modal */
.upgrade-modal__head{
  background: linear-gradient(180deg, #fff, #f9fbff);
  border-bottom: 1px solid #edf0f6;
}
.upgrade-modal__head .modal-title{
  font-weight: 800;
  letter-spacing: .2px;
  color: #0f172a;
}
.upgrade-close{
  filter: grayscale(100%);
  opacity: .7;
}
.upgrade-close:hover{ opacity: 1; }

/* Body modal */
.upgrade-modal__body{
  background: #fff;
}

/* Card gói */

.package-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(2,6,23,.12);
  border-color: #dbe4ff;
}
  .package-card {
  min-width: 220px;
  max-width: 250px;
  display: flex;
  flex-direction: column;
}

.package-card .card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.package-card button {
  width: 100px;
}

/* Ribbon “Phổ biến” */
.package-ribbon{
  position: absolute;
  top: 10px; right: -12px;
  background: #111827; color: #fff;
  font-weight: 800; font-size: 12px;
  padding: 6px 10px; border-radius: 999px;
  box-shadow: 0 6px 16px rgba(0,0,0,.15);
}
.package-card.is-popular{ border-color: #111827; }

/* Giá */
.price-tag{
  display: inline-flex; align-items: baseline; gap: 6px;
  background: #f4f7ff; border: 1px solid #e3e9ff;
  padding: 8px 12px; border-radius: 12px;
}
.price{ font-size: 20px; font-weight: 900; color: #111827; }
.per{ color: #64748b; font-weight: 700; }

/* Nút chọn gói */
.btn-upgrade{
  --btn-bg: #111827;
  --btn-bg-hover: #0b1220;
  --btn-border: #111827;
  background: var(--btn-bg);
  color: #fff; border: 1px solid var(--btn-border);
  border-radius: 12px; padding: 10px 14px; font-weight: 800;
}
.btn-upgrade:hover{ background: var(--btn-bg-hover); color: #fff; }

/* Responsive */
@media (max-width: 576px){
  .package-ribbon{ right: 10px; }
  .price{ font-size: 18px; }
} thêm phần css này vào 
const styles = {
  // ===== Pagination =====
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap',
    gap: '6px',
  },
  paginationBtn: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    color: '#495057',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeBtn: {
    backgroundColor: '#0d6efd',
    color: '#fff',
    borderColor: '#0d6efd',
    boxShadow: '0 2px 6px rgba(13,110,253,0.3)',
  },
  hoverBtn: {
    backgroundColor: '#e9ecef',
    borderColor: '#ced4da',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  }
};

      `}</style>
    </div>
  );
};

export default TechnicianDeposit;