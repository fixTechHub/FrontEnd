import React, { useState } from 'react';
import moment from 'moment';

const ReceiptTable = ({ receipts }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'badge badge-light-success';
      case 'PENDING':
        return 'badge badge-light-warning';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
        return 'badge badge-light-danger';
      default:
        return 'badge badge-light-secondary';
    }
  };

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'BANK':
        return 'badge badge-light-secondary';
      case 'CASH':
        return 'badge badge-light-info';
      default:
        return 'badge badge-light-dark';
    }
  };

  const openModal = (receipt) => {
    setSelectedReceipt(receipt);
    const modal = new window.bootstrap.Modal(document.getElementById('receiptDetailModal'));
    modal.show();
  };

  return (
    <div className="row">
      <div className="col-lg-12 d-flex">
        <div className="card book-card flex-fill mb-0">
          <div className="card-header">
            <div className="row align-items-center">
              <div className="col-md-5">
                <h4>Biên lai <span>{receipts?.length || 0}</span></h4>
              </div>
              <div className="col-md-7 text-md-end">
                <div className="table-search">
                  <div id="tablefilter" className="me-0"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive dashboard-table">
              <table className="table datatable">
                <thead className="thead-light">
                  <tr>
                    <th></th>
                    <th>Mã Biên lai</th>
                    <th>Mã Đơn</th>
                    <th>Ngày</th>
                    <th>Tổng</th>
                    <th>Phương Thức</th>
                    <th>Trạng Thái</th>
                    <th className="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  {receipts?.map((receipt) => (
                    <tr key={receipt._id}>
                      <td>
                        <label className="custom_check w-100">
                          <input type="checkbox" />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td>#{receipt.receiptCode}</td>
                      <td>{receipt.bookingId}</td>
                      <td>{moment(receipt.issuedDate).format('DD MMM YYYY, hh:mm A')}</td>
                      <td>
                        <p className="text-darker">${receipt.paidAmount}</p>
                      </td>
                      <td>
                        <span className={getPaymentMethodBadge(receipt.paymentMethod)}>
                          {receipt.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadge(receipt.paymentStatus)}>
                          {receipt.paymentStatus}
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
                            <button
                              className="dropdown-item"
                              onClick={() => openModal(receipt)}
                            >
                              <i className="feather-file-plus"></i> Chi tiết
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {receipts?.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Không có biên lai nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal for receipt details */}
            <div
              className="modal fade"
              id="receiptDetailModal"
              tabIndex="-1"
              aria-labelledby="receiptDetailModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="receiptDetailModalLabel">
                      Chi tiết Biên Lai
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {selectedReceipt ? (
                      <div>
                        <p><strong>Mã biên lai:</strong> {selectedReceipt.receiptCode}</p>
                        <p><strong>Mã đơn:</strong> {selectedReceipt.bookingId}</p>
                        <p><strong>Ngày phát hành:</strong> {moment(selectedReceipt.issuedDate).format('DD MMM YYYY, hh:mm A')}</p>
                        <p><strong>Tổng thanh toán:</strong> ${selectedReceipt.totalAmount}</p>
                        <p><strong>Số tiền đã trả:</strong> ${selectedReceipt.paidAmount}</p>
                        <p><strong>Chiết khấu:</strong> ${selectedReceipt.discountAmount}</p>
                        <p><strong>Phí dịch vụ:</strong> ${selectedReceipt.serviceAmount}</p>
                        <p><strong>Phương thức thanh toán:</strong> {selectedReceipt.paymentMethod}</p>
                        <p><strong>Trạng thái:</strong> {selectedReceipt.paymentStatus}</p>
                      </div>
                    ) : (
                      <p>Đang tải thông tin...</p>
                    )}
                  </div>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default ReceiptTable;
