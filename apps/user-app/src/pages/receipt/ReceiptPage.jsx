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
    <>
    <div className="receipts-list-modern">
      <style jsx>{`
        .receipts-list-modern {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .receipts-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .receipts-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        
        .receipts-subtitle {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .filters-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          align-items: end;
        }
        
        .filter-group {
          position: relative;
        }
        
        .filter-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
          font-size: 0.875rem;
        }
        
        .filter-input, .filter-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
          background: #ffffff;
          color: #374151;
        }
        
        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .date-range {
          display: flex;
          gap: 0.5rem;
        }
        
        .date-range input {
          flex: 1;
        }
        
        .receipts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .receipt-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          border-left: 4px solid #3b82f6;
        }
        
        .receipt-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .receipt-code {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .booking-code {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .payment-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .badge-bank {
          background: #fef3c7;
          color: #92400e;
        }
        
        .badge-cash {
          background: #d1fae5;
          color: #065f46;
        }
        
        .receipt-details {
          display: grid;
          gap: 0.75rem;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-row:last-child {
          border-bottom: none;
          font-weight: 600;
          color: #1f2937;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .detail-value {
          color: #1f2937;
          font-weight: 500;
          font-size: 0.875rem;
        }
        
        .amount-value {
          color: #059669;
          font-weight: 700;
          font-size: 1rem;
        }
        
        .receipt-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        
        .view-btn {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .view-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }
        
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          margin-top: 2rem;
        }
        
        .empty-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }
        
        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .empty-text {
          color: #6b7280;
          font-size: 1rem;
        }
        
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .pagination-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div className="container">
        <div className="receipts-header">
          <h1 className="receipts-title">Hóa đơn thanh toán</h1>
          <p className="receipts-subtitle">Quản lý và theo dõi các hóa đơn thanh toán</p>
        </div>
        
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Tìm kiếm</label>
              <input
                      type="text"
                className="filter-input"
                placeholder="Mã đơn, phương thức..."
                      onChange={handleSearchChange}
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Thời gian</label>
              <select 
                className="filter-select"
                value={dateFilter}
                onChange={(e) => handleDateFilterChange(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="thisWeek">Tuần này</option>
                <option value="thisMonth">Tháng này</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>
            
                    {dateFilter === 'custom' && (
              <div className="filter-group">
                <label className="filter-label">Khoảng thời gian</label>
                <div className="date-range">
                  <input
                          type="date"
                    className="filter-input"
                          value={customStartDate}
                          onChange={(e) => handleCustomDateChange('start', e.target.value)}
                          max={customEndDate || new Date().toISOString().split('T')[0]}
                        />
                  <input
                          type="date"
                    className="filter-input"
                          value={customEndDate}
                          onChange={(e) => handleCustomDateChange('end', e.target.value)}
                          min={customStartDate}
                        />
                </div>
                      </div>
                    )}
            
            <div className="filter-group">
              <label className="filter-label">Phương thức thanh toán</label>
              <select 
                className="filter-select"
                value={paymentMethodFilter}
                onChange={(e) => handlePaymentMethodFilterChange(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="BANK">Ngân hàng</option>
                <option value="CASH">Tiền mặt</option>
              </select>
            </div>
          </div>
        </div>

        {status === 'loading' && (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải hóa đơn...</p>
          </div>
        )}
        
        {error && (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3 className="empty-title">Đã xảy ra lỗi</h3>
            <p className="empty-text">{error}</p>
          </div>
        )}

        {!status === 'loading' && !error && (!Array.isArray(receipts) || receipts.length === 0) && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3 className="empty-title">Chưa có hóa đơn</h3>
            <p className="empty-text">Bạn chưa có hóa đơn thanh toán nào.</p>
          </div>
        )}

        {!status === 'loading' && !error && Array.isArray(receipts) && receipts.length > 0 && (
          <>
            <div className="receipts-grid">
              {receipts.map((receipt) => (
                <div className="receipt-card" key={receipt._id}>
                  <div className="receipt-header">
                    <div>
                      <div className="receipt-code">
                        {receipt.receiptCode || `HD-${receipt._id?.slice(-6)}`}
                      </div>
                      <div className="booking-code">
                        Mã đơn: {receipt.bookingId?.bookingCode || 'N/A'}
                  </div>
                </div>
                    <div className={`payment-badge ${receipt.paymentMethod === 'BANK' ? 'badge-bank' : 'badge-cash'}`}>
                      {receipt.paymentMethod === 'BANK' ? 'Ngân hàng' : 'Tiền mặt'}
              </div>
                            </div>
                  
                  <div className="receipt-details">
                    <div className="detail-row">
                      <span className="detail-label">Dịch vụ</span>
                      <span className="detail-value">
                                  {receipt.bookingId?.serviceId?.serviceName || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Khách hàng</span>
                      <span className="detail-value">
                        {receipt.customer?.fullName || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Ngày xuất hóa đơn</span>
                      <span className="detail-value">
                        {formatDate(receipt.issuedDate)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Tổng tiền</span>
                      <span className="detail-value amount-value">
                        {formatCurrency(receipt.paidAmount || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="receipt-actions">
                    <button 
                      className="view-btn"
                      onClick={() => handleShowModal(receipt)}
                    >
                      <i className="feather-file-plus me-2"></i>
                      Xem chi tiết hóa đơn
                    </button>
                                </div>
                              </div>
              ))}
                </div>

            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
              >
                Trang trước
              </button>
              <button 
                className="pagination-btn" 
                disabled={receipts.length < limit}
                    onClick={() => handlePageChange(page + 1)}
              >
                Trang sau
              </button>
              </div>
          </>
        )}
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
                        <p>
                          Thuế{' '}
                          <span>{formatCurrency(selectedReceipt?.bookingId?.quote?.totalAmount*0.08 || 0)}</span>
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
    </>
  );
};

export default ReceiptPage;