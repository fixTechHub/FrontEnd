import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { fetchUserReceipts } from '../../features/receipts/receiptSlice'; // Removed selectReceipts, selectReceiptStatus, selectReceiptError as they are destructured from the state directly
import { formatCurrency, maskTransactionId } from '../../utils/formatDuration';
import handlePrintPDF from '../../utils/pdf';
import './ReceiptPage.css';

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
   padding: '20px 25px',
    margin: '0 5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const ReceiptPage = () => {
  const dispatch = useDispatch();
  // Destructure directly from state.receipt for cleaner access
  const { receipts, status, error } = useSelector((state) => state.receipt);

  const [showModal, setShowModal] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState(null);
  const [page, setPage] = useState(0); // Current page, starts at 0
  const limit = 5;

  useEffect(() => {
    dispatch(fetchUserReceipts({ limit, skip: page * limit }));
  }, [dispatch, page, limit]);

  const handleShowModal = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handlePageChange = (newPage) => {
    if (newPage >= 0) {
      setPage(newPage);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'BANK':
        return 'badge-light-warning';
      case 'CASH':
        return 'badge-light-success';
      default:
        return 'badge-light-secondary';
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : 'N/A');

  return (
    <div className="content">
      <div className="container">
        {/* <div className="row">
          <div className="col-lg-12">
            <div className="sorting-info">
              <div className="row d-flex align-items-center">
                <div className="col-lg-12">
                  <div className="filter-group">
                    <Dropdown className="sort-week sort">
                      <Dropdown.Toggle variant="light">
                        This Week <i className="fas fa-chevron-down"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>This Week</Dropdown.Item>
                        <Dropdown.Item>This Month</Dropdown.Item>
                        <Dropdown.Item>Last 30 Days</Dropdown.Item>
                        <Dropdown.Item>Custom</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown className="sort-relevance sort">
                      <Dropdown.Toggle variant="light">
                        Sort By Relevance <i className="fas fa-chevron-down"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>Sort By Relevance</Dropdown.Item>
                        <Dropdown.Item>Sort By Ascending</Dropdown.Item>
                        <Dropdown.Item>Sort By Descending</Dropdown.Item>
                        <Dropdown.Item>Sort By Alphabet</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        <div className="row">
          <div className="col-lg-12 d-flex">
            <div className="card book-card flex-fill mb-0">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <h4>Hóa đơn </h4>
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
                        <th>Mã Đơn</th>
                        <th>Service Name</th>
                        <th>Ngày</th>
                        <th>Tổng</th>
                        <th>Thanh Toán</th>
                        <th className="text-end"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Conditional rendering for loading, error, and no data states */}
                      {status === 'loading' ? (
                        <tr>
                          <td colSpan="6" className="text-center custom-loading-text">
                            Đang tải...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="6" className="text-center text-danger">
                            {error}
                          </td>
                        </tr>
                      ) : !Array.isArray(receipts) || receipts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            Không có hóa đơn nào
                          </td>
                        </tr>
                      ) : (
                        receipts.map((receipt) => (
                          <tr key={receipt._id}>
                            <td>
                              <a href="#" onClick={() => handleShowModal(receipt)}>
                                {receipt.bookingId?.bookingCode || 'N/A'}
                              </a>
                            </td>
                            <td>
                              <div className="table-avatar">
                                <div className="table-head-name flex-grow-1">
                                  {receipt.bookingId?.serviceId?.serviceName || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td>{formatDate(receipt.issuedDate)}</td>
                            <td><p className="text-darker">{formatCurrency(receipt.totalAmount)}</p></td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(receipt.paymentMethod)}`}>{receipt.paymentMethod || 'N/A'}</span>
                            </td>
                            <td className="text-end">
                              <Dropdown className="dropdown-action">
                                <Dropdown.Toggle variant="light" className="dropdown-toggle">
                                  <i className="fas fa-ellipsis-vertical"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                  <Dropdown.Item onClick={() => handleShowModal(receipt)}>
                                    <i className="feather-file-plus"></i> View Invoice
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>




                {/* Pagination buttons */}
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
                      ...(receipts.length < limit ? styles.disabledBtn : {}),
                    }}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={receipts.length < limit}
                  >
                    Trang Sau
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="xl"
          backdrop="static"
          keyboard={false}
          className="new-modal"
          id="view_invoice"
        >
          <Modal.Header closeButton className="border-0 p-2"></Modal.Header>
          <Modal.Body>
            <div className="invoice-details">
              <div className="invoice-items">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="invoice-logo">
                      <img src="/img/logo.png" alt="logo" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="invoice-info-text">
                      <h4>Invoice</h4>
                      <p>Mã hóa đơn : <span>{selectedReceipt?.receiptCode || 'N/A'}</span></p>
                      <p>Mã đơn : <span>{selectedReceipt?.bookingId?.bookingCode || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-item-bills">
                <div className="row align-items-center">
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info">
                      <h6>Khách Hàng</h6>
                      <p>
                        {selectedReceipt?.bookingId?.customerId?.fullName || 'Customer Name'} <br />
                        {selectedReceipt?.bookingId?.customerId?.phone || 'N/A'} <br />
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info">
                      <h6>Hệ Thống</h6>
                      <p>
                        FixTechHub <br />
                        0814035790 <br />
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info border-0">
                      <p>Thời gian: {formatDate(selectedReceipt?.issuedDate)}</p>
                      <p>Thanh Toán: {formatCurrency(selectedReceipt?.paidAmount)}</p>
                      <p className="mb-0">Mã : {selectedReceipt?.receiptCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payment-details-info">
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-terms">
                      <h6>Thông tin </h6>
                      <div className="invocie-note">
                        <p>
                          {selectedReceipt?.paymentMethod || 'N/A'} <br />
                          {selectedReceipt?.paymentGatewayTransactionId && (
                            <>
                              <br />
                              {maskTransactionId(selectedReceipt.paymentGatewayTransactionId)}
                            </>
                          )}
                        </p>
                        <p>Trạng Thái: {selectedReceipt?.paymentStatus || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-total-box">
                      <div className="invoice-total-inner">
                        <p>Phí Kiểm Tra <span> {formatCurrency(selectedReceipt?.bookingId.technicianId.rates.inspectionFee)}</span></p>
                        <p>Giảm <span> {formatCurrency(selectedReceipt?.discountAmount)}</span></p>
                        <p>Phí dịch vụ <span> {formatCurrency(selectedReceipt?.serviceAmount)}</span></p>
                        {selectedReceipt?.bookingId?.quote?.items?.length > 0 && (
                          <>
                            <hr />
                            {selectedReceipt.bookingId.quote.items.map((item, index) => (
                              <div key={index} className="invoice-item" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '6px',
                                padding: '4px 0',
                                borderBottom: '1px dashed #eee'
                              }}>
                                <div>
                                  <span style={{ fontWeight: '500' }}>{item.name}</span>
                                  {item.quantity >= 1 && (
                                    <span style={{ color: '#888', marginLeft: '6px' }}>x{item.quantity}</span>
                                  )}
                                </div>
                                <div style={{ fontWeight: '500' }}>{formatCurrency(item.price)}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-total">
                <h4>Tổng <span>{formatCurrency(selectedReceipt?.totalAmount)}</span></h4>
              </div>
              <div className="invoice-note-footer">
                <div className="row align-items-center">
                  <div className="col-lg-6 col-md-12">
                    <div className="invocie-note">
                      <h6>Mô Tả</h6>
                      <p>{selectedReceipt?.bookingId?.description || 'Enter customer notes or any other details'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-sign">
                      <span className="d-block">FixTechHub</span>
                    </div>
                  </div>
                </div>

                <div className="invoice-btns w-100 d-flex justify-content-end mt-3">
                  <Button variant="light" className="me-2" onClick={() => handlePrintPDF(selectedReceipt)}>
                    <i className="feather-printer"></i> Print
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default ReceiptPage;