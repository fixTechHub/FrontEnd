import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTechnicianDepositLogs } from '../../features/technician/technicianSlice';
import { depositBalance, clearTransactionState } from '../../features/transactions/transactionSlice';

const TechnicianDeposit = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.technicianDeposit);
  const { depositURL, loading: transactionLoading, error: transactionError, successMessage } = useSelector((state) => state.transaction);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTechnicianDepositLogs());
    // Redirect to depositURL if available
    if (depositURL) {
      window.location.href = depositURL;
      dispatch(clearTransactionState());
    }
  }, [dispatch, depositURL]);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    // Validate amount as a positive number
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Hãy nhập số');
      return;
    }
    setAmountError(null);
    dispatch(depositBalance(parsedAmount)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowModal(false);
        setAmount('');
      }
    });
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setAmountError(null); // Clear error on change
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

  return (
    <div className="col-lg-12 d-flex">
      <div className="card book-card flex-fill mb-0">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-5">
              <h4>Lịch sử giao dịch <span>{logs.length}</span></h4>
            </div>
            <div className="col-md-7 text-md-end">
              <div className="table-search">
                <div id="tablefilter"></div>
                <button
                  className="btn btn-add"
                  onClick={() => setShowModal(true)}
                >
                  <i className="feather-plus-circle"></i> Nạp tiền
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive dashboard-table">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th>
                    <label className="custom_check w-100">
                      <input type="checkbox" name="selectAll" />
                      <span className="checkmark"></span>
                    </label>
                  </th>
                  <th>Mã giao dịch </th>
                  <th>Loại </th>
                  <th>Số tiền </th>
                  <th>Trạng thái</th>
                  <th>Cách thức thanh toán </th>
                  <th>Trước giao dịch </th>
                  <th>Sau giao dịch </th>
                  <th>Ngày </th>
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
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      Không có giao dịch nào 
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id}>
                      <td>
                        <label className="custom_check w-100">
                          <input type="checkbox" name="log" />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td>
                        <a href="#" data-bs-toggle="modal" data-bs-target={`#view_deposit_${log._id}`}>
                          {log.transactionCode || log._id}
                        </a>
                      </td>
                      <td>{log.type}</td>
                      <td>${log.amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{log.paymentMethod || 'N/A'}</td>
                      <td>${log.balanceBefore.toFixed(2)}</td>
                      <td>{log.balanceAfter ? `$${log.balanceAfter.toFixed(2)}` : 'N/A'}</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
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
        </div>
      </div>

      {/* Deposit Modal */}
      <div
        className="modal new-modal fade"
        id="deposit_modal"
        data-keyboard="false"
        data-backdrop="static"
        style={{ display: showModal ? 'block' : 'none' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Khoảng Giao dịch </h4>
              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
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
                        Số tiền  <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập số tiền "
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
                    onClick={() => {
                      setShowModal(false);
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
      {logs.map((log) => (
        <div
          key={log._id}
          className="modal new-modal fade"
          id={`view_deposit_${log._id}`}
          data-keyboard="false"
          data-backdrop="static"
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Chi tiết Giao dịch </h4>
                <button type="button" className="close-btn" data-bs-dismiss="modal">
                  <span>×</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <p><strong>Mã giao dịch:</strong> {log.transactionCode || log._id}</p>
                    <p><strong>Loại:</strong> {log.type}</p>
                    <p><strong>Số tiền:</strong> ${log.amount.toFixed(2)}</p>
                    <p><strong>Trạng thái:</strong> {log.status}</p>
                    <p><strong>Cách thức:</strong> {log.paymentMethod || 'N/A'}</p>
                    <p><strong>Trước giao dịch:</strong> ${log.balanceBefore.toFixed(2)}</p>
                    <p><strong>Sau giao dịch:</strong> {log.balanceAfter ? `$${log.balanceAfter.toFixed(2)}` : 'N/A'}</p>
                    <p><strong>Ngày:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                    <p><strong>Note:</strong> {log.note || 'N/A'}</p>
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
    </div>
  );
};

export default TechnicianDeposit;