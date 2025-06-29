import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTechnicianDepositLogs, fetchTechnicianProfile } from '../../features/technicians/technicianSlice';
import { depositBalance, clearTransactionState } from '../../features/transactions/transactionSlice';
import { toast } from 'react-toastify';

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
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);
  const { user,technician } = useSelector((state) => state.auth);
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

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Hãy nhập số');
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

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'badge-light-warning';
      case 'APPROVED':
        return 'badge-light-info';
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
    <div className="content">
      <div className="container">
        <div className="col-lg-12 d-flex">
          <div className="card book-card flex-fill mb-0">
            <div className="row">
              <div className="col-lg-5 col-md-12 d-flex">
                <div className="card wallet-card flex-fill">
                  <div className="card-body">
                    <div className="balance-info"></div>
                    <div className="wallet-btn">
                      <a className="btn">
                        Add Payment
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-7 col-md-12 d-flex">
                <div className="card your-card flex-fill">
                  <div className="card-body">
                    <div className="balance-info">
                      {/* <div className="balance-grid">
                        <div className="balance-content">
                          <h6>Tài khoản </h6>
                          
                        </div>
                        
                      </div> */}
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
                <div className="table-footer">
                  <div className="row">
                    <div className="col-md-6">
                      <div id="tablelength"></div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div id="tablepage"></div>
                    </div>
                  </div>
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

          {/* Deposit Modal */}
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
                            type="text"
                            className="form-control"
                            placeholder="Nhập số tiền"
                            value={amount}
                            onChange={handleAmountChange}
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
                          <strong>Số tiền:</strong> ${log.amount.toFixed(2)}
                        </p>
                        <p>
                          <strong>Trạng thái:</strong> {log.status}
                        </p>
                        <p>
                          <strong>Cách thức:</strong> {log.paymentMethod || 'N/A'}
                        </p>
                        <p>
                          <strong>Trước giao dịch:</strong> ${log.balanceBefore.toFixed(2)}
                        </p>
                        <p>
                          <strong>Sau giao dịch:</strong>{' '}
                          {log.balanceAfter
                            ? `$${log.balanceAfter.toFixed(2)}`
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
  );
};

export default TechnicianDeposit;