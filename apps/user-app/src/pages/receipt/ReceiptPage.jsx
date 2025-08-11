import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Dropdown, Form, Pagination } from 'react-bootstrap';
import { fetchUserReceipts } from '../../features/receipts/receiptSlice';
import { formatCurrency, maskTransactionId } from '../../utils/formatDuration';
import handlePrintPDF from '../../utils/pdf';
import './ReceiptPage.css';

// Custom debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

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
    padding: '8px 12px',
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
  const { receipts, status, error } = useSelector((state) => state.receipt);
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const limit = 5;

  // Debounced search handler using custom debounce
  const debouncedSearch = useDebounce((value) => {
    setSearchTerm(value);
    setPage(0);
  }, 500);

  useEffect(() => {
    const filters = {
      limit,
      skip: page * limit,
      searchTerm,
      paymentMethod: paymentMethodFilter,
      dateFilter,
      customStartDate,
      customEndDate,
    };
    dispatch(fetchUserReceipts(filters));
  }, [dispatch, page, searchTerm, paymentMethodFilter, dateFilter, customStartDate, customEndDate]);

  const handleShowModal = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReceipt(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handlePaymentMethodFilterChange = (method) => {
    setPaymentMethodFilter(method);
    setPage(0);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setCustomStartDate('');
    setCustomEndDate('');
    setPage(0);
  };

  const handleCustomDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
      if (customStartDate && new Date(value) < new Date(customStartDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
    }
    setDateFilter('custom');
    setPage(0);
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

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      : 'N/A';

  return (
    <div className="content">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="sorting-info">
              <div className="row d-flex align-items-center">
                <div className="col-lg-12">
                  <div className="filter-group d-flex gap-2 flex-wrap">
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm theo mã đơn, phương thức..."
                      onChange={handleSearchChange}
                      className="me-2"
                      style={{ maxWidth: '300px' }}
                    />
                    <Dropdown className="sort-week sort">
                      <Dropdown.Toggle variant="light">
                        {dateFilter === 'thisWeek'
                          ? 'Tuần Này'
                          : dateFilter === 'thisMonth'
                            ? 'Tháng Này'
                            : dateFilter === 'custom'
                              ? 'Tùy Chỉnh'
                              : 'Lọc Theo Ngày'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleDateFilterChange('')}>Tất cả</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDateFilterChange('thisWeek')}>
                          Tuần Này
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDateFilterChange('thisMonth')}>
                          Tháng Này
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleDateFilterChange('custom')}>
                          Tùy Chỉnh
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    {dateFilter === 'custom' && (
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="date"
                          value={customStartDate}
                          onChange={(e) => handleCustomDateChange('start', e.target.value)}
                          max={customEndDate || new Date().toISOString().split('T')[0]}
                          className="me-2"
                          style={{ maxWidth: '150px' }}
                        />
                        <Form.Control
                          type="date"
                          value={customEndDate}
                          onChange={(e) => handleCustomDateChange('end', e.target.value)}
                          min={customStartDate}
                          style={{ maxWidth: '150px' }}
                        />
                      </div>
                    )}
                    <Dropdown className="sort-relevance sort">
                      <Dropdown.Toggle variant="light">
                        {paymentMethodFilter === 'BANK'
                          ? 'Ngân hàng'
                          : paymentMethodFilter === 'CASH'
                            ? 'Tiền mặt'
                            : 'Lọc Theo Thanh Toán'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handlePaymentMethodFilterChange('')}>
                          Tất cả
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePaymentMethodFilterChange('BANK')}>
                          Ngân hàng
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handlePaymentMethodFilterChange('CASH')}>
                          Tiền mặt
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 d-flex">
            <div className="card book-card flex-fill mb-0">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <h4>Hóa Đơn</h4>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive dashboard-table">
                  <table className="table datatable">
                    <thead className="thead-light">
                      <tr>
                        <th>Mã Đơn</th>
                        <th>Dịch Vụ</th>
                        <th>Ngày</th>
                        <th>Tổng</th>
                        <th>Thanh Toán</th>
                        <th className="text-end"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {status === 'loading' ? (
                        <tr>
                          <td colSpan="6" className="text-center">
                            <div className="spinner-border" role="status">
                              <span className="visually-hidden">Đang tải...</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="6" className="text-center text-danger">
                            Lỗi: {error}
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
                            <td>
                              <p className="text-darker">{formatCurrency(receipt.paidAmount || 0)}</p>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(receipt.paymentMethod)}`}>
                                {receipt.paymentMethod || 'N/A'}
                              </span>
                            </td>
                            <td className="text-end">
                              <Dropdown className="dropdown-action">
                                <Dropdown.Toggle variant="light" className="dropdown-toggle">
                                  <i className="fas fa-ellipsis-vertical"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-end">
                                  <Dropdown.Item onClick={() => handleShowModal(receipt)}>
                                    <i className="feather-file-plus"></i> Xem Hóa Đơn
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

                <Pagination style={styles.pagination}>
                  <Pagination.Prev
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                    style={page === 0 ? { ...styles.paginationBtn, ...styles.disabledBtn } : styles.paginationBtn}
                  >
                    Trang Trước
                  </Pagination.Prev>
                  <Pagination.Next
                    onClick={() => handlePageChange(page + 1)}
                    disabled={receipts.length < limit}
                    style={
                      receipts.length < limit
                        ? { ...styles.paginationBtn, ...styles.disabledBtn }
                        : styles.paginationBtn
                    }
                  >
                    Trang Sau
                  </Pagination.Next>
                </Pagination>
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
                      <h4>Hóa Đơn</h4>
                      <p>
                        Mã hóa đơn: <span>{selectedReceipt?.receiptCode || 'N/A'}</span>
                      </p>
                      <p>
                        Mã đơn: <span>{selectedReceipt?.bookingId?.bookingCode || 'N/A'}</span>
                      </p>
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
                        {selectedReceipt?.customer?.fullName || 'N/A'} <br />
                        {selectedReceipt?.customer?.phone || 'N/A'} <br />
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
                      <p>Thanh Toán: {formatCurrency(selectedReceipt?.paidAmount || 0)}</p>
                      <p className="mb-0">Mã: {selectedReceipt?.receiptCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="payment-details-info">
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-terms">
                      <h6>Thông Tin</h6>
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
                        <p>
                          Phí dịch vụ{' '}
                          <span>{formatCurrency(selectedReceipt?.serviceAmount || 0)}</span>
                        </p>
                        <p>
                          Giảm{' '}
                          <span>{formatCurrency(selectedReceipt?.discountAmount || 0)}</span>
                        </p>

                        {selectedReceipt?.bookingId?.quote?.items?.length > 0 && (
                          <>
                            <hr />
                            {selectedReceipt.bookingId.quote.items.map((item, index) => (
                              <div
                                key={index}
                                className="invoice-item"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '6px',
                                  padding: '4px 0',
                                  borderBottom: '1px dashed #eee',
                                }}
                              >
                                <div>
                                  <span style={{ fontWeight: '500' }}>{item.name || 'N/A'}</span>
                                  {item.quantity >= 1 && (
                                    <span style={{ color: '#888', marginLeft: '6px' }}>
                                      x{item.quantity}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontWeight: '500' }}>
                                  {formatCurrency(item.price || 0)}
                                </div>
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
                <h4>
                  Tổng <span>{formatCurrency(selectedReceipt?.totalAmount || 0)}</span>
                </h4>
              </div>
              <div className="invoice-note-footer">
                <div className="row align-items-center">
                  <div className="col-lg-6 col-md-12">
                    <div className="invocie-note">
                      <h6>Mô Tả</h6>
                      <p>{selectedReceipt?.bookingId?.description || 'Không có mô tả'}</p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-sign">
                      <span className="d-block">FixTechHub</span>
                    </div>
                  </div>
                </div>

                <div className="invoice-btns w-100 d-flex justify-content-end mt-3">
                  <Button
                    variant="light"
                    className="me-2"
                    onClick={() => handlePrintPDF(selectedReceipt)}
                  >
                    <i className="feather-printer"></i> In
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