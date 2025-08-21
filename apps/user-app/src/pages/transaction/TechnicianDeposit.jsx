import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import {
  fetchTechnicianDepositLogs,
} from '../../features/technicians/technicianSlice';
import {
  depositBalance,
  clearTransactionState,
  withdrawBalance,
  subscriptionBalance,
  extendSubscription,
} from '../../features/transactions/transactionSlice';
import {
  fetchCurrentSubscription,
  getAllPackages,
} from '../../features/package/packageSlice';
import { Button } from 'react-bootstrap';

const styles = {
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
  },
};

const TechnicianDeposit = () => {
  const dispatch = useDispatch();
  const formatDate = (isoDate) => {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('vi-VN');
  };

  // store states
  const { loading: transactionLoading, error: transactionError, successMessage } =
    useSelector((s) => s.transaction);

  const { currentSubscription } = useSelector((s) => s.technicianSubscription);
  const packages = useSelector((s) => s.technicianSubscription.all);
  const allPackages = Array.isArray(packages) ? packages : [];

  const { technician } = useSelector((s) => s.auth);
  const technicianId = technician?._id;

  const { logs, loading, error } = useSelector((s) => s.technician);

  // alias để render an toàn khi chưa có gói
  const sub = currentSubscription?.data || null;
  const pkg = sub?.package || null;

  // local UI state
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAmountError, setWithdrawAmountError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK');

  const [months, setMonths] = useState(1);

  const [page, setPage] = useState(0);
  const limit = 5;

  // effects
  useEffect(() => {
    if (technicianId) {
      dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
      // nếu thunk cần object thì đổi thành: dispatch(fetchCurrentSubscription({ technicianId }))
      dispatch(fetchCurrentSubscription(technicianId));
    }
  }, [dispatch, page, technicianId]);

  // handlers
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setAmountError('Hãy nhập số tiền hợp lệ');
      return;
    }

    try {
      const depositURL = await dispatch(depositBalance(parsed)).unwrap();
      if (depositURL) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');
        const modalElement = document.getElementById('deposit_modal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
        window.location.href = depositURL;
      } else {
        toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Deposit error:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xử lý nạp tiền.');
    }
  };

  const handleSubscriptionSubmit = async (selectedPackage) => {
    if (!selectedPackage || !selectedPackage.price) {
      toast.error('Gói không hợp lệ!');
      return;
    }
    try {
      const depositURL = await dispatch(
        subscriptionBalance({
          amount: selectedPackage.price,
          packageId: selectedPackage._id,
        }),
      ).unwrap();

      if (depositURL) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');
        const el = document.getElementById('upgradePackageModal');
        const modal = window.bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();
        window.location.href = depositURL;
      } else {
        toast.error('Không thể lấy link thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xử lý nâng cấp.');
    }
  };

  const handleExtendSubmit = async () => {
    const curPkg = currentSubscription?.data?.package;
    if (!curPkg || !curPkg.price || !curPkg._id) {
      toast.error('Bạn chưa có gói để gia hạn. Hãy chọn gói trước!');
      return;
    }
    try {
      const checkoutUrl = await dispatch(
        extendSubscription({
          technicianId,
          packageId: curPkg._id,
          days: months * 30,
        }),
      ).unwrap();

      if (checkoutUrl) {
        toast.success('Đang chuyển hướng đến cổng thanh toán...');
        const el = document.getElementById('extendPackageModal');
        const modal = window.bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();
        window.location.href = checkoutUrl;
      } else {
        toast.error('Không thể tạo link thanh toán');
      }
    } catch (err) {
      console.error('Extend subscription error:', err);
      toast.error(err.message || 'Có lỗi khi xử lý gia hạn.');
    }
  };

  const handleExtendClick = () => {
    const el = document.getElementById('extendPackageModal');
    const modal = new window.bootstrap.Modal(el);
    modal.show();
  };

  const handleRequestWithdrawSubmit = async (e) => {
    e.preventDefault();

    // Tẩy mọi ký tự không phải số: chấm, phẩy, khoảng trắng…
    const raw = String(withdrawAmount || '');
    const amountNumber = Number(raw.replace(/[^\d]/g, ''));   // "1.234.567" -> 1234567
    const bal = Number(technician?.balance || 0);

    if (!amountNumber || amountNumber <= 0) {
      setWithdrawAmountError('Vui lòng nhập số tiền hợp lệ.');
      return;
    }
    if (amountNumber > bal) {
      setWithdrawAmountError('Số tiền vượt quá số dư khả dụng.');
      return;
    }
    setWithdrawAmountError(null);

    try {
      await dispatch(
        withdrawBalance({
          technicianId,
          amount: amountNumber,      // 👈 dùng số sạch
          paymentMethod,
        })
      ).unwrap();

      toast.success('Yêu cầu rút tiền đã được gửi đến admin');

      // Đóng modal an toàn
      const el = document.getElementById('withdraw_modal');
      if (el) {
        const instance = window.bootstrap?.Modal.getInstance(el) || new window.bootstrap.Modal(el);
        instance.hide();
      }

      // Reset form
      setWithdrawAmount('');
      setPaymentMethod('BANK');

      // Refresh logs (nếu page là 1-based thì dùng (page-1)*limit)
      dispatch(fetchTechnicianDepositLogs({ limit, skip: page * limit }));
    } catch (err) {
      console.error('Withdraw request error:', err);
      toast.error(err?.message || 'Có lỗi xảy ra khi gửi yêu cầu rút tiền.');
    }
  };


  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(null);
  };

  const handleWithdrawAmountChange = (e) => {
    setWithdrawAmount(e.target.value);
    setWithdrawAmountError(null);
  };

  const getStatusBadgeClass = (st) => {
    switch ((st || '').toUpperCase()) {
      case 'PENDING':
        return 'badge-light-warning';
      case 'APPROVED':
      case 'COMPLETED':
        return 'badge-light-success';
      case 'CANCELLED':
        return 'badge-light-danger';
      default:
        return 'badge-light-secondary';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Bị từ chối";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status; // fallback giữ nguyên
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0) setPage(newPage);
  };

  const handleUpgradeClick = () => {
    dispatch(getAllPackages());
    const el = document.getElementById('upgradePackageModal');
    const modal = new window.bootstrap.Modal(el);
    modal.show();
  };

  // --- helpers ---
  const digitsOnly = (s) => (s || '').replace(/[^\d]/g, ''); // bỏ mọi thứ không phải số
  const formatVND = (n) => Number(n).toLocaleString('vi-VN'); // 1.234.567

  // --- onChange: format khi gõ ---
  const onFormattedAmountChange = (e) => {
    const bal = Number(technician?.balance || 0);
    const rawDigits = digitsOnly(e.target.value);

    if (!rawDigits) {
      setWithdrawAmount('');
      setWithdrawAmountError(null);
      return;
    }

    let num = parseInt(rawDigits, 10);
    if (Number.isNaN(num)) num = 0;

    // Giới hạn tối đa theo số dư
    if (bal > 0 && num > bal) num = bal;

    setWithdrawAmount(formatVND(num));   // 👉 lưu dạng "1.234.567"
    setWithdrawAmountError(null);
  };

  // format "1.234.567"
  const formatThousands = (v) =>
    String(v).replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const onDepositAmountChange = (e) => {
    const formatted = formatThousands(e.target.value);
    setAmount(formatted);              // dùng state amount của deposit
    if (amountError) setAmountError(null);
  };



  return (
    <div className="main-wrapper">
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
                      <img src="/img/icons/dashboard-icon.svg" alt="Icon" />
                      <span>Bảng điều khiển</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/booking`}>
                      <img src="/img/icons/booking-icon.svg" alt="Icon" />
                      <span>Đơn hàng</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/feedback">
                      <img src="/img/icons/review-icon.svg" alt="Icon" />
                      <span>Đánh giá</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/${technicianId}/certificate`}>
                      <img style={{ height: '28px' }} src="/img/cer.png" alt="Icon" />
                      <span>Chứng chỉ</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/schedule">
                      <img src="/img/icons/booking-icon.svg" alt="Icon" />
                      <span>Lịch trình</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/technician/deposit" className="active">
                      <img src="/img/icons/wallet-icon.svg" alt="Icon" />
                      <span>Ví của tôi</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={`/technician/earning`}>
                      <img src="/img/icons/payment-icon.svg" alt="Icon" />
                      <span>Thu nhập</span>
                    </Link>
                  </li>
                  {/* <li>
                    <Link to={`/profile`}>
                      <img src="/img/icons/settings-icon.svg" alt="Icon" />
                      <span>Cài đặt</span>
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
          <div className="content-header">
            <h4>Ví của tôi</h4>
          </div>

          <div className="row">
            {/* Balance card */}
            <div className="col-lg-6 col-md-12 d-flex">
              <div className="card wallet-card flex-fill">
                <div className="card-body">
                  <div className="balance-info">
                    <div className="balance-grid">
                      <div className="balance-content">
                        <h6>Số dư khả dụng</h6>
                        <h4>{(technician?.balance || 0).toLocaleString('vi-VN')} VND</h4>
                      </div>
                    </div>

                    <div className="balance-list">
                      <div className="row">
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner credit-info">
                            <h6>{(technician?.totalEarning || 0).toLocaleString('vi-VN')} VND</h6>
                            <p>Tổng thu nhập</p>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner debit-info">
                            <h6>{(technician?.totalHoldingAmount || 0).toLocaleString('vi-VN')} VND</h6>
                            <p>Tổng tiền giữ lại</p>
                          </div>
                        </div>
                        <div className="col-lg-4 col-md-6 d-flex">
                          <div className="balance-inner transaction-info">
                            <h6>{(technician?.totalWithdrawn || 0).toLocaleString('vi-VN')} VND</h6>
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
                    <div className="wallet-btn">
                      <Button
                        className="btn"
                        onClick={handleDepositSubmit}
                        disabled={transactionLoading || technician.debBalance <= 0}
                      >
                        {transactionLoading ? 'Đang xử lý...' : 'Thanh toán nợ'}
                      </Button>
                    </div>
                  </div>
                  {transactionError && (
                    <small className="text-danger mt-2 d-block">{transactionError}</small>
                  )}
                  {successMessage && (
                    <small className="text-success mt-2 d-block">{successMessage}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription card */}
            <div className="col-lg-6 col-md-12 d-flex">
              <div className="card flex-fill shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Gói dịch vụ của bạn</h4>
                    <span className={`badge ${pkg ? 'bg-success' : 'bg-secondary'}`}>
                      {pkg ? 'Đang hoạt động' : 'Chưa có gói'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5 className="text-primary fw-bold">
                      {pkg?.name || 'Chưa đăng ký gói'}
                    </h5>

                    {/* Chỉ hiện khi chưa có gói */}
                    {!(pkg && (pkg._id || pkg.id || pkg.name)) && (
                      <p className="mb-1 text-primary">
                        Bạn chưa có gói nào. Hãy bấm “Chọn gói” để đăng ký.
                      </p>
                    )}
                  </div>

                  <ul className="list-group mb-4">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Ngày bắt đầu</span>
                      <strong>{formatDate(sub?.startDate)}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Ngày hết hạn</span>
                      <strong>{formatDate(sub?.endDate)}</strong>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Giá</span>
                      <strong>
                        {pkg?.price ? `${pkg.price.toLocaleString('vi-VN')}đ/tháng` : '-'}
                      </strong>
                    </li>
                  </ul>

                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-primary" onClick={handleUpgradeClick}>
                      {pkg ? 'Nâng cấp' : 'Chọn gói'}
                    </button>
                    <button className="btn btn-primary" onClick={handleExtendClick} disabled={!pkg}>
                      Gia hạn
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction table */}
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
                              <td colSpan="10" className="text-center">Đang tải...</td>
                            </tr>
                          ) : error ? (
                            <tr>
                              <td colSpan="10" className="text-center text-danger">{error}</td>
                            </tr>
                          ) : !Array.isArray(logs) || logs.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="text-center">Không có giao dịch nào</td>
                            </tr>
                          ) : (
                            logs.map((log) => (
                              <tr key={log._id}>
                                <td>{log.type}</td>
                                <td>{Number(log.amount || 0).toLocaleString('vi-VN')}đ</td>
                                <td>{log.paymentMethod || 'N/A'}</td>
                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                <td>
                                  <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                                    {translateStatus(log.status)}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <div className="dropdown dropdown-action">
                                    <a className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                      <i className="fas fa-ellipsis-vertical"></i>
                                    </a>
                                    <div className="dropdown-menu dropdown-menu-end">
                                      <a
                                        className="dropdown-item"
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
                        style={{ ...styles.paginationBtn, ...(page === 0 ? styles.disabledBtn : {}) }}
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                      >
                        Trang Trước
                      </button>
                      <button
                        style={{
                          ...styles.paginationBtn,
                          ...((Array.isArray(logs) ? logs.length : 0) < limit ? styles.disabledBtn : {}),
                        }}
                        onClick={() => handlePageChange(page + 1)}
                        disabled={(Array.isArray(logs) ? logs.length : 0) < limit}
                      >
                        Trang Sau
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deposit Modal */}
              <div className="modal new-modal fade" id="deposit_modal" data-bs-keyboard="false" data-bs-backdrop="static">
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
                              <label className="form-label">
                                Số tiền <span className="text-danger">*</span>
                              </label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  inputMode="numeric"        // gợi ý bàn phím số trên mobile
                                  pattern="\d*"              // chấp nhận chỉ số (cho trình duyệt hỗ trợ)
                                  className={`form-control ${withdrawAmountError || transactionError ? 'is-invalid' : ''}`}
                                  placeholder="Nhập số tiền muốn rút"
                                  value={withdrawAmount}
                                  onChange={onFormattedAmountChange}
                                  autoComplete="off"
                                />
                                <span className="input-group-text">VND</span>
                                {(withdrawAmountError || transactionError) && (
                                  <div className="invalid-feedback">
                                    {withdrawAmountError || transactionError}
                                  </div>
                                )}
                              </div>
                              <div className="form-text">
                                Tối đa: {(technician?.balance || 0).toLocaleString('vi-VN')} VND
                              </div>
                              {successMessage && <div className="form-text text-success">{successMessage}</div>}
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
                          <button type="submit" className="btn btn-primary" disabled={transactionLoading}>
                            {transactionLoading ? 'Xử lý...' : 'Nạp'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw Modal (đã sửa) */}
              <div
                className="modal fade new-modal"
                id="withdraw_modal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                aria-hidden="true"
                aria-labelledby="withdrawModalLabel"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content shadow-lg">
                    <div className="modal-header">
                      <h5 className="modal-title" id="withdrawModalLabel">Yêu Cầu Rút Tiền</h5>
                      <button
                        type="button"
                        className="btn-close"                // ✅ dùng nút chuẩn của Bootstrap
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        onClick={() => {
                          setWithdrawAmount('');
                          setWithdrawAmountError(null);
                          setPaymentMethod('BANK');
                          dispatch(clearTransactionState());
                        }}
                      />
                    </div>

                    <div className="modal-body">
                      {/* Số dư khả dụng */}
                      <div className="mb-3">
                        <div className="balance-box d-flex justify-content-between align-items-center">
                          <span>Số dư khả dụng</span>
                          <strong>{(technician?.balance || 0).toLocaleString('vi-VN')} VND</strong>
                        </div>
                      </div>

                      <form onSubmit={handleRequestWithdrawSubmit}>
                        {/* Số tiền */}
                        <div className="mb-3">
                          <label className="form-label">
                            Số tiền <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              className={`form-control ${amountError || transactionError ? 'is-invalid' : ''}`}
                              placeholder="Nhập số tiền muốn nạp"
                              value={amount}                          // ✅ dùng amount, KHÔNG dùng withdrawAmount
                              onChange={onDepositAmountChange}        // ✅ handler format dấu chấm
                              autoComplete="off"
                            />
                            <span className="input-group-text">VND</span>
                            {(amountError || transactionError) && (
                              <div className="invalid-feedback">
                                {amountError || transactionError}
                              </div>
                            )}
                          </div>
                          {successMessage && <div className="form-text text-success">{successMessage}</div>}
                        </div>

                        {/* Phương thức */}
                        <div className="mb-3">
                          <label className="form-label">
                            Phương thức thanh toán <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option value="BANK">Chuyển khoản ngân hàng</option>
                          </select>
                        </div>

                        {/* Footer nút */}
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
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
                          <button type="submit" className="btn btn-primary" disabled={transactionLoading}>
                            {transactionLoading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* CSS chỉ áp cho modal này */}
                <style>{`
    .new-modal .modal-dialog{
      max-width: 640px !important;      /* ✅ không quá rộng */
      margin: 1.75rem auto;
    }
    .new-modal .modal-content{
      border-radius: 14px;               /* bo góc nhẹ */
    }
    .new-modal .modal-header{
      padding: 12px 16px;
      border-bottom: 1px solid #eef2f7;
    }
    .new-modal .modal-body{ padding: 16px; }
    .new-modal .modal-footer{
      padding: 12px 16px;
      border-top: 1px solid #eef2f7;
    }
    .new-modal .balance-box{
      background:#f8fafc;
      border:1px solid #eef2f7;
      border-radius:10px;
      padding:10px 12px;
      font-weight:600;
    }
    @media (max-width: 576px){
      .new-modal .modal-dialog{ margin: 0 12px; }
    }
  `}</style>
              </div>


              {/* View Deposit Modals */}
              {Array.isArray(logs) &&
                logs.map((log) => (
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
                          <button type="button" className="close-btn" data-bs-dismiss="modal">
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
                                <strong>Số tiền:</strong>{' '}
                                {Number(log.amount || 0).toLocaleString('vi-VN')} VND
                              </p>
                              <p>
                                <strong>Trạng thái:</strong> {log.status}
                              </p>
                              <p>
                                <strong>Cách thức:</strong> {log.paymentMethod || 'N/A'}
                              </p>
                              <p>
                                <strong>Trước giao dịch:</strong>{' '}
                                {Number(log.balanceBefore || 0).toLocaleString('vi-VN')} VND
                              </p>
                              <p>
                                <strong>Sau giao dịch:</strong>{' '}
                                {log.balanceAfter
                                  ? `${Number(log.balanceAfter).toLocaleString('vi-VN')} VND`
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                              Tắt
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Upgrade Package Modal */}
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
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                      <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {allPackages.map((item) => (
                          <div key={item._id} className="card flex-fill text-center shadow-sm package-card">
                            <div className="card-body d-flex flex-column">
                              <h5 className="card-title">{item.name}</h5>
                              <p className="card-text flex-grow-1">{item.description}</p>
                              <p className="text-warning fw-bold mb-3">
                                {Number(item.price || 0).toLocaleString('vi-VN')}đ / tháng
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
                        {allPackages.length === 0 && (
                          <div className="text-muted">Hiện chưa có gói nào để hiển thị.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extend Package Modal */}
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
                      <button className="btn btn-secondary" data-bs-dismiss="modal">
                        Hủy
                      </button>
                      <button type="button" className="btn btn-primary" onClick={handleExtendSubmit}>
                        Xác nhận thanh toán
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* end modals */}
            </div>
          </div>
        </div>
      </div>

      {/* CSS thuần, KHÔNG để JS trong này */}
      <style>{`
        .modal-backdrop.show{ background: rgba(15,23,42,.55); backdrop-filter: blur(2px); }
        .upgrade-modal{ border:1px solid #e6eaf2; border-radius:16px; overflow:hidden; box-shadow:0 30px 80px rgba(2,6,23,.25); }
        .upgrade-modal__head{ background:linear-gradient(180deg,#fff,#f9fbff); border-bottom:1px solid #edf0f6; }
        .upgrade-modal__head .modal-title{ font-weight:800; letter-spacing:.2px; color:#0f172a; }
        .upgrade-close{ filter:grayscale(100%); opacity:.7; }
        .upgrade-close:hover{ opacity:1; }
        .upgrade-modal__body{ background:#fff; }

        .package-card:hover{ transform:translateY(-2px); box-shadow:0 14px 30px rgba(2,6,23,.12); border-color:#dbe4ff; }
        .package-card{ min-width:220px; max-width:250px; display:flex; flex-direction:column; }
        .package-card .card-body{ display:flex; flex-direction:column; justify-content:space-between; }
        .package-card button{ width:100px; }

        .package-ribbon{ position:absolute; top:10px; right:-12px; background:#111827; color:#fff; font-weight:800; font-size:12px; padding:6px 10px; border-radius:999px; box-shadow:0 6px 16px rgba(0,0,0,.15); }
        .package-card.is-popular{ border-color:#111827; }

        .price-tag{ display:inline-flex; align-items:baseline; gap:6px; background:#f4f7ff; border:1px solid #e3e9ff; padding:8px 12px; border-radius:12px; }
        .price{ font-size:20px; font-weight:900; color:#111827; }
        .per{ color:#64748b; font-weight:700; }

        .btn-upgrade{ --btn-bg:#111827; --btn-bg-hover:#0b1220; --btn-border:#111827; background:var(--btn-bg); color:#fff; border:1px solid var(--btn-border); border-radius:12px; padding:10px 14px; font-weight:800; }
        .btn-upgrade:hover{ background:var(--btn-bg-hover); color:#fff; }

        @media (max-width:576px){
          .package-ribbon{ right:10px; }
          .price{ font-size:18px; }
        }
      `}</style>
    </div>
  );
};

export default TechnicianDeposit;
