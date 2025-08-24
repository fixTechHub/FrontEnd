import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Dropdown, Table, Pagination, Card } from 'react-bootstrap';
import { fetchUserBookingHistory, cancelBooking } from '../../../features/bookings/bookingSlice';
import { requestWarrantyThunk, resetWarrantyState } from '../../../features/booking-warranty/warrantySlice';
import { formatBookingDate, formatDateOnly, formatTimeOnly } from '../../../utils/formatDate';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import { 
  FaFileAlt, FaUser, FaClock, FaCalendar, FaTag, FaBan, FaMapMarkerAlt, 
  FaDollarSign, FaUserCheck, FaHourglassHalf, FaSpinner 
} from 'react-icons/fa';
import {
  RiServiceFill as Service,
  RiTimeFill as Clock,
  RiSearchLine as Search,
  RiFilterLine as Filter,
  RiCloseLine as Close,
  RiEyeLine as Eye,
  RiCalendarFill as Calendar,
  RiUserFill as User,
  RiMapPinFill as Location,
  RiCheckboxCircleFill as Success,
  RiCloseCircleFill as Denied,
  RiTimeLine as Pending,
  RiLoader4Line as Loading,
  RiArrowLeftLine as ArrowLeft,
  RiArrowRightLine as ArrowRight,
  RiInboxLine as Empty,
  RiMoreFill as More,
  RiToolsFill as Tools
} from 'react-icons/ri';
import { formatCurrency } from '../../../utils/formatDuration';

const statusConfig = {
  PENDING: {
    label: 'Đang chờ',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: Pending
  },
  CONFIRMED: {
    label: 'Xác nhận',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: Success
  },
  IN_PROGRESS: {
    label: 'Đang thực hiện',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: Loading
  },
  CONFIRM_ADDITIONAL: {
    label: 'Chấp nhận thêm chi phí',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: Success
  },
  CANCELLED: {
    label: 'Hủy',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: Denied
  },
  ACCEPTED: {
    label: 'Đồng ý',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: Success
  },
  REJECTED: {
    label: 'Từ chối',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: Denied
  },
  WAITING_CUSTOMER_CONFIRM_ADDITIONAL: {
    label: 'Chờ chấp nhận chi phí thêm',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: Pending
  },
  AWAITING_CONFIRM: {
    label: 'Chờ chấp nhận',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: Pending
  },
  AWAITING_DONE: {
    label: 'Chờ thanh toán',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: Pending
  },
  DONE: {
    label: 'Đã thanh toán',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: Success
  }
};

const BookingHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingHistories, total, status, error } = useSelector((state) => state.booking);
  const { loading: warrantyLoading, error: warrantyError } = useSelector((state) => state.warranty);
  const { user } = useSelector((state) => state.auth);

  // Pagination and filters
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const limit = 6;

  // Modals
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [warrantyImages, setWarrantyImages] = useState([]);
  const [warrantyReason, setWarrantyReason] = useState('');
  const [warrantyReasonError, setWarrantyReasonError] = useState(null);
  const [selectedWarrantyBookingId, setSelectedWarrantyBookingId] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  const handleFilesSelect = (files) => {
    setWarrantyImages(files);
  };

  // Filtering logic
  const filtered = useMemo(() => {
    if (!Array.isArray(bookingHistories)) return [];
    
    return bookingHistories.filter(booking => {
      let ok = true;
      if (statusFilter !== 'ALL') ok &= booking.status === statusFilter;
      if (fromDate) ok &= new Date(booking.createdAt) >= new Date(fromDate);
      if (toDate) ok &= new Date(booking.createdAt) <= new Date(toDate + 'T23:59:59');
      if (search.trim()) {
        const key = search.trim().toLowerCase();
        const code = (booking.bookingCode || '').toLowerCase();
        const service = (booking.serviceId?.serviceName || '').toLowerCase();
        const technician = (booking.technicianId?.userId?.fullName || '').toLowerCase();
        ok &= code.includes(key) || service.includes(key) || technician.includes(key);
      }
      return ok;
    });
  }, [bookingHistories, statusFilter, fromDate, toDate, search]);

  const paginated = useMemo(() => {
    return filtered.slice(page * limit, (page + 1) * limit);
  }, [filtered, page]);

  useEffect(() => {
    setPage(0);
  }, [filtered]);

  useEffect(() => {
    dispatch(fetchUserBookingHistory({ limit: 50, skip: 0 })); // Load more for client-side filtering
  }, [dispatch]);

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy');
      return;
    }
    try {
      await dispatch(cancelBooking({ bookingId: selectedBookingId, reason: cancelReason })).unwrap();
      toast.success('Hủy đặt chỗ thành công');
      setCancelReason('');
      setShowCancelModal(false);
      setSelectedBookingId(null);
    } catch (error) {
      toast.error(`Lỗi: ${error}`);
    }
  };

  const handleWarrantyModalOpen = (bookingId) => {
    if (!bookingId) {
      toast.error('Booking ID is required');
      return;
    }
    setSelectedWarrantyBookingId(bookingId);
    setWarrantyReason('');
    setWarrantyReasonError(null);
    setWarrantyImages([]);
    dispatch(resetWarrantyState());
    setShowWarrantyModal(true);
  };

  const handleWarrantyModalClose = () => {
    setWarrantyReason('');
    setWarrantyReasonError(null);
    setSelectedWarrantyBookingId(null);
    setWarrantyImages([]);
    dispatch(resetWarrantyState());
    setShowWarrantyModal(false);
  };

  const handleWarrantyReasonChange = (e) => {
    setWarrantyReason(e.target.value);
    setWarrantyReasonError(null);
  };

  const handleWarrantySubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarrantyBookingId) {
      toast.error('Booking ID is required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('bookingId', selectedWarrantyBookingId);
      formData.append('reportedIssue', warrantyReason);
      for (const file of warrantyImages) {
        formData.append('images', file);
      }
      const warranty = await dispatch(requestWarrantyThunk(formData)).unwrap();

      toast.success('Yêu cầu bảo hành thành công, Vui lòng đợi trong vòng 24h để thợ phản hồi');
      handleWarrantyModalClose();
      navigate(`/warranty?bookingWarrantyId=${warranty._id}`)
    } catch (err) {
      const errorMessage = err?.error || 'Đã xảy ra lỗi khi yêu cầu bảo hành';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(filtered.length / limit)) {
      setPage(newPage);
    }
  };

  const isCustomer = user?.role?.name === 'CUSTOMER';
  const isTechnician = user?.role?.name === 'TECHNICIAN';

  return (
    <>
    <div className="booking-list-modern">
      <style jsx>{`
        .booking-list-modern {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .booking-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
          text-align: center;
          margin-top: 0;
        }
        
        .booking-subtitle {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
          text-align: center;
          margin-bottom: 3rem;
          margin-top: 0;
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
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
          font-size: 0.75rem;
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
        
        .search-wrapper {
          position: relative;
          min-width: 280px;
          grid-column: span 2;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
          background: #ffffff;
          color: #374151;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ef4444;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #ef4444;
          white-space: nowrap;
        }
        
        .filter-btn:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        
        .booking-grid {
          display: grid;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 107, 107, 0.1);
          border-radius: 20px;
          margin-bottom: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .booking-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .booking-card:hover {
          border-color: #ff6b6b;
          box-shadow: 0 8px 32px rgba(255, 107, 107, 0.15);
          transform: translateY(-2px);
        }
        
        .booking-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .booking-card:hover::before {
          opacity: 1;
        }
        
        .booking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .booking-code {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .booking-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }
        
        .booking-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .booking-detail {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .detail-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.025em;
        }
        
        .detail-value {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .booking-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(255, 107, 107, 0.3);
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, #ffa500, #ff8500);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
        }
        
        .action-btn.secondary {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }
        
        .action-btn.secondary:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
        }
        
        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          margin: 2rem 0;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          color: #ff6b6b;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .error-icon, .empty-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 1.5rem;
          color: #9ca3af;
        }
        
        .pagination-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }
        
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 12px;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          transform: translateY(-2px);
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          font-weight: 700;
          color: #374151;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 12px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .booking-title { font-size: 2rem; }
          .filters-grid { grid-template-columns: 1fr; }
          .booking-details { grid-template-columns: 1fr; }
          .booking-actions { flex-direction: column; }
          .action-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="container-xl">
        {/* Header */}
        <h1 className="booking-title">Đặt lịch của tôi</h1>
        <p className="booking-subtitle">Quản lý và theo dõi lịch sử đặt dịch vụ của bạn</p>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Trạng thái</label>
              <select 
                className="filter-select" 
                value={statusFilter} 
                onChange={e=>setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Từ ngày</label>
              <input 
                type="date" 
                className="filter-input"
                value={fromDate} 
                onChange={e=>setFromDate(e.target.value)} 
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Đến ngày</label>
              <input 
                type="date" 
                className="filter-input"
                value={toDate} 
                onChange={e=>setToDate(e.target.value)} 
              />
            </div>
            
            <div className="filter-group search-wrapper">
              <label className="filter-label">Tìm kiếm</label>
              <input 
                type="text"
                className="search-input"
                placeholder="Mã đơn, dịch vụ, kỹ thuật viên..."
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label" style={{opacity: 0}}>Action</label>
              <button 
                className="filter-btn"
                onClick={()=>{setStatusFilter('ALL');setFromDate('');setToDate('');setSearch('');}}
              >
                <Close size={12} />
                Xóa lọc
              </button>
            </div>
          </div>
        </div>
        {/* Loading State */}
        {status === 'loading' && (
          <div className="loading-state">
            <Loading size={48} className="loading-spinner" />
            <h3>Đang tải dữ liệu...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <Denied size={64} className="error-icon" />
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        {status !== 'loading' && !error && (
          <>
            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="empty-state">
                <Empty size={64} className="empty-icon" />
                <h3>Chưa có đặt lịch nào</h3>
                <p>Bạn chưa đặt lịch dịch vụ nào hoặc không có kết quả phù hợp với bộ lọc</p>
              </div>
            )}

            {/* Booking List */}
            {filtered.length > 0 && (
              <div className="booking-grid">
                {paginated.map(booking => {
                  const config = statusConfig[booking.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-card-header">
                        <div className="booking-code">
                          <Service size={20} style={{ color: '#ff6b6b' }} />
                          #{booking.bookingCode}
                        </div>
                        <div 
                          className="booking-status"
                          style={{
                            backgroundColor: config.bgColor,
                            color: config.color
                          }}
                        >
                          <StatusIcon size={14} />
                          {config.label}
                        </div>
                      </div>
                      
                      <div className="booking-details">
                        <div className="booking-detail">
                          <span className="detail-label">Dịch vụ</span>
                          <span className="detail-value">{booking.serviceId?.serviceName || 'N/A'}</span>
                        </div>
                        <div className="booking-detail">
                          <span className="detail-label">{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}</span>
                          <span className="detail-value">
                            {isCustomer
                              ? booking.technicianId?.userId?.fullName || 'Chưa phân công'
                              : booking.customerId?.fullName || 'N/A'}
                        </span>
                        </div>
                        <div className="booking-detail">
                          <span className="detail-label">Ngày đặt</span>
                          <span className="detail-value">
                            <Calendar size={14} style={{ color: '#ffa500', marginRight: '0.25rem' }} />
                            {formatDateOnly(booking.schedule?.startTime) || 'N/A'}
                          </span>
                        </div>
                        <div className="booking-detail">
                          <span className="detail-label">Giá tiền</span>
                          <span className="detail-value">{formatCurrency(booking.finalPrice)}</span>
                        </div>
                      </div>
                      
                      <div className="booking-actions">
                        <button
                          className="action-btn secondary"
                          onClick={() => setShowDetailsModal(booking._id)}
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                        
                            {isCustomer && booking.status === 'DONE' && (
                          <button
                            className="action-btn"
                            onClick={() => handleWarrantyModalOpen(booking._id)}
                          >
                            <Tools size={16} />
                            Bảo hành
                          </button>
                        )}

                        {isCustomer && ['PENDING', 'AWAITING_CONFIRM'].includes(booking.status) && (
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/booking/choose-technician?bookingId=${booking._id}`)}
                          >
                            <User size={16} />
                            Chọn thợ
                          </button>
                        )}
                        
                        {isCustomer && !['DONE', 'CANCELLED', 'PENDING', 'AWAITING_CONFIRM'].includes(booking.status) && (
                          <button
                            className="action-btn"
                            onClick={() => navigate(`/booking/booking-processing?bookingId=${booking._id}`)}
                          >
                            <Clock size={16} />
                            Tiến trình
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > limit && (
              <div className="pagination-section">
                <button 
                  className="pagination-btn"
                disabled={page === 0}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ArrowLeft size={16} />
                  Trước
                </button>
                
                <div className="pagination-info">
                  {page + 1} / {Math.ceil(filtered.length / limit)}
                </div>
                
                <button 
                  className="pagination-btn"
                  disabled={(page + 1) * limit >= filtered.length}
                onClick={() => handlePageChange(page + 1)}
                >
                  Sau
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

        {/* Cancel Booking Modal */}
        <Modal
          show={showCancelModal}
          onHide={() => {
            setCancelReason('');
            setShowCancelModal(false);
            setSelectedBookingId(null);
          }}
          centered
        >
          <Modal.Header closeButton style={{ background: '#007bff', color: 'white' }}>
            <Modal.Title>Hủy đặt dịch vụ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCancelBooking}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Lý do hủy <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy đặt lịch này"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="border rounded"
                  isInvalid={!!cancelReason && !cancelReason.trim()}
                />
                <Form.Control.Feedback type="invalid">
                  Vui lòng nhập lý do hủy
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCancelReason('');
                    setShowCancelModal(false);
                    setSelectedBookingId(null);
                  }}
                >
                  Thoát
                </Button>
                <Button variant="danger" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Xử lý...
                    </span>
                  ) : (
                    'Xác nhận hủy'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Warranty Modal */}
        <Modal show={showWarrantyModal} onHide={handleWarrantyModalClose} centered>
          <Modal.Header closeButton style={{ background: '#FFA633', color: 'white' }}>
            <Modal.Title>Yêu cầu bảo hành</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3" style={{ color: '#1e293b' }}>
              Vui lòng cung cấp thông tin chi tiết về vấn đề bạn gặp phải. Chúng tôi sẽ xử lý yêu cầu trong vòng 24 giờ.
            </div>
            <Form onSubmit={handleWarrantySubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Lý do bảo hành <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải (ví dụ: thiết bị không hoạt động, lỗi kỹ thuật, ...)"
                  value={warrantyReason}
                  onChange={handleWarrantyReasonChange}
                  className="border rounded"
                  isInvalid={!!warrantyReasonError}
                />
                <Form.Control.Feedback type="invalid">
                  {warrantyReasonError || 'Vui lòng nhập lý do bảo hành'}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <ImageUploader onFilesSelect={handleFilesSelect} />
                {warrantyImages.length > 0 && (
                  <div className="mt-2 text-muted">{warrantyImages.length} ảnh đã được chọn</div>
                )}
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={handleWarrantyModalClose}>
                  Thoát
                </Button>
                <Button variant="primary" type="submit" disabled={warrantyLoading}>
                  {warrantyLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Gửi yêu cầu...
                    </span>
                  ) : (
                    'Gửi yêu cầu'
                  )}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Details Modal */}
        {Array.isArray(bookingHistories) &&
          bookingHistories.map((booking) => (
            <Modal
              key={booking._id}
              show={showDetailsModal === booking._id}
              onHide={() => setShowDetailsModal(null)}
              centered
              size="lg"
              style={{
                animation: 'fadeInUp 0.4s ease-out',
              }}
            >
              <Modal.Header
                closeButton
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '25px 30px',
                  position: 'relative',
                  color: 'white',
                }}
              >
                <Modal.Title style={{ fontWeight: 600, fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Chi tiết đặt dịch vụ
                </Modal.Title>
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    pointerEvents: 'none',
                  }}
                />
              </Modal.Header>
              <Modal.Body style={{ background: '#f8fafc', padding: 0 }}>
                <ul
                  className="nav nav-tabs"
                  role="tablist"
                  style={{
                    background: 'white',
                    border: 'none',
                    margin: 0,
                    padding: '0 30px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link active"
                      href="#solid-tab1"
                      data-bs-toggle="tab"
                      role="tab"
                      style={{
                        border: 'none',
                        padding: '20px 25px',
                        fontWeight: 500,
                        color: '#64748b',
                        background: 'transparent',
                        borderBottom: '3px solid transparent',
                      }}
                    >
                      Thông tin đặt dịch vụ
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      className="nav-link"
                      href="#solid-tab2"
                      data-bs-toggle="tab"
                      role="tab"
                      style={{
                        border: 'none',
                        padding: '20px 25px',
                        fontWeight: 500,
                        color: '#64748b',
                        background: 'transparent',
                        borderBottom: '3px solid transparent',
                      }}
                    >
                      Lịch sử
                    </a>
                  </li>
                </ul>
                <div className="tab-content" style={{ padding: '30px' }}>
                  <div className="tab-pane active show" id="solid-tab1" role="tabpanel" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    {/* Service Card */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '25px',
                        color: 'white',
                        marginBottom: '25px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div className="row align-items-center">
                        <div className="col-8">
                          <div className="d-flex align-items-center">
                            <span
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '15px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '10px',
                                backdropFilter: 'blur(10px)',
                                flexShrink: 0,
                                marginRight: '15px',
                              }}
                            >
                              <img src={booking.serviceId?.icon} alt="Service" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </span>
                            <div>
                              <p style={{ opacity: 0.9, marginBottom: '5px', fontSize: '0.9rem' }}>Dịch vụ</p>
                              <h6 style={{ fontWeight: 600, marginBottom: 0 }}>{booking.serviceId?.serviceName || 'N/A'}</h6>
                            </div>
                          </div>
                        </div>
                        <div className="col-4 text-end">
                          <p style={{ opacity: 0.9, marginBottom: '5px', fontSize: '0.9rem' }}>Giá</p>
                          <h6 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 0 }}>{formatCurrency(booking.finalPrice)}</h6>
                        </div>
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                          transform: 'translate(30px, -30px)',
                        }}
                      />
                    </div>

                    {/* Customer and Technician Info */}
                    <div
                      style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '20px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div className="row">
                        <div className="col-md-6">
                          <h6
                            style={{
                              color: '#1e293b',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              marginBottom: '20px',
                              paddingBottom: '10px',
                              borderBottom: '2px solid #f1f5f9',
                            }}
                          >
                            Khách hàng
                          </h6>
                          <div
                            className="d-flex align-items-center"
                            style={{
                              padding: '15px',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              marginBottom: '15px',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginRight: '15px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            >
                              {booking?.customerId?.avatar ? (
                                <img
                                  src={booking.customerId.avatar}
                                  alt="Customer Avatar"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = booking?.customerId?.fullName?.charAt(0) || 'N';
                                  }}
                                />
                              ) : (
                                booking?.customerId?.fullName?.charAt(0) || 'N'
                              )}
                            </div>
                            <div>
                              <h6 style={{ marginBottom: '5px', color: '#1e293b', fontWeight: 600 }}>
                                {booking.customerId?.fullName || 'N/A'}
                              </h6>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                {booking.customerId?.phoneNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6
                            style={{
                              color: '#1e293b',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              marginBottom: '20px',
                              paddingBottom: '10px',
                              borderBottom: '2px solid #f1f5f9',
                            }}
                          >
                            Kỹ thuật viên
                          </h6>
                          <div
                            className="d-flex align-items-center"
                            style={{
                              padding: '15px',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              marginBottom: '15px',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <div
                              style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                marginRight: '15px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            >
                              {booking?.technicianId?.userId?.avatar ? (
                                <img
                                  src={booking.technicianId.userId.avatar}
                                  alt="Technician Avatar"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = booking?.technicianId?.userId?.fullName?.charAt(0) || 'T';
                                  }}
                                />
                              ) : (
                                booking?.technicianId?.userId?.fullName?.charAt(0) || 'T'
                              )}
                            </div>
                            <div>
                              <h6 style={{ marginBottom: '5px', color: '#1e293b', fontWeight: 600 }}>
                                {booking.technicianId?.userId?.fullName || 'Chưa phân công'}
                              </h6>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                {booking.technicianId?.userId?.phoneNumber || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Details */}
                    <div
                      style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        marginBottom: '20px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h6
                        style={{
                          color: '#1e293b',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          marginBottom: '20px',
                          paddingBottom: '10px',
                          borderBottom: '2px solid #f1f5f9',
                        }}
                      >
                        Thông tin lịch hẹn
                      </h6>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#475569' }}>Ngày bắt đầu</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>
                          {formatDateOnly(booking.schedule?.startTime) || 'N/A'},{' '}
                          {formatTimeOnly(booking.schedule?.startTime) || 'N/A'}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#475569' }}>Ngày kết thúc dự kiến</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>
                          {formatDateOnly(booking.schedule?.expectedEndTime) || 'N/A'},{' '}
                          {formatTimeOnly(booking.schedule?.expectedEndTime) || 'N/A'}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 0',
                        }}
                      >
                        <span style={{ fontWeight: 500, color: '#475569' }}>Khẩn cấp</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>
                          {booking.isUrgent ? (
                            <span
                              style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '5px 12px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                boxShadow: '0 3px 10px rgba(239, 68, 68, 0.3)',
                              }}
                            >
                              Có
                            </span>
                          ) : (
                            'Không'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '20px',
                        marginTop: '15px',
                      }}
                    >
                      <h6 style={{ color: '#92400e', fontWeight: 600, marginBottom: '8px' }}>📍 Địa điểm</h6>
                      <p style={{ color: '#b45309', margin: 0 }}>{booking.location?.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="tab-pane" id="solid-tab2" role="tabpanel" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    {/* Service Card - History Tab */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        padding: '25px',
                        color: 'white',
                        marginBottom: '25px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div className="row align-items-center">
                        <div className="col-8">
                          <div className="d-flex align-items-center">
                            <span
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '15px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '10px',
                                backdropFilter: 'blur(10px)',
                                flexShrink: 0,
                                marginRight: '15px',
                              }}
                            >
                              <img src={booking.serviceId?.icon} alt="Service" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </span>
                            <div>
                              <p style={{ opacity: 0.9, marginBottom: '5px', fontSize: '0.9rem' }}>Dịch vụ</p>
                              <h6 style={{ fontWeight: 600, marginBottom: 0 }}>{booking.serviceId?.serviceName || 'N/A'}</h6>
                            </div>
                          </div>
                        </div>
                        <div className="col-4 text-end">
                          <p style={{ opacity: 0.9, marginBottom: '5px', fontSize: '0.9rem' }}>Giá</p>
                          <h6 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 0 }}>{formatCurrency(booking.finalPrice)}</h6>
                        </div>
                      </div>
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: '100px',
                          height: '100px',
                          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                          transform: 'translate(30px, -30px)',
                        }}
                      />
                    </div>

                    {/* History Timeline */}
                    <div
                      style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <h6
                        style={{
                          color: '#1e293b',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          marginBottom: '20px',
                          paddingBottom: '10px',
                          borderBottom: '2px solid #f1f5f9',
                        }}
                      >
                        📅 Lịch sử
                      </h6>
                      {/* Service Created */}
                      <div
                        className="d-flex align-items-center"
                        style={{
                          padding: '20px',
                          background: 'white',
                          borderRadius: '12px',
                          marginBottom: '15px',
                          boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                          borderLeft: '4px solid #667eea',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '15px',
                            textAlign: 'center',
                            marginRight: '20px',
                            minWidth: '80px',
                            boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                          }}
                        >
                          <h5 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                            {formatBookingDate(booking.createdAt).day}
                          </h5>
                          <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '5px', display: 'block' }}>
                            {formatBookingDate(booking.createdAt).monthYear}
                          </span>
                        </div>
                        <div>
                          <h6 style={{ color: '#1e293b', fontWeight: 600, marginBottom: '5px' }}>Dịch vụ được tạo</h6>
                          <span style={{ color: '#64748b' }}>{formatTimeOnly(booking.createdAt) || 'N/A'}</span>
                        </div>
                      </div>
                      {/* Service Completed */}
                      {booking.completedAt && (
                        <div
                          className="d-flex align-items-center"
                          style={{
                            padding: '20px',
                            background: 'white',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #667eea',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '15px',
                              textAlign: 'center',
                              marginRight: '20px',
                              minWidth: '80px',
                              boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                            }}
                          >
                            <h5 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                              {formatBookingDate(booking.completedAt).day}
                            </h5>
                            <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '5px', display: 'block' }}>
                              {formatBookingDate(booking.completedAt).monthYear}
                            </span>
                          </div>
                          <div>
                            <h6 style={{ color: '#1e293b', fontWeight: 600, marginBottom: '5px' }}>
                              Hoàn thành dịch vụ
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  display: 'inline-block',
                                  marginLeft: '8px',
                                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)',
                                }}
                              >
                                ✓ Hoàn thành
                              </span>
                            </h6>
                            <span style={{ color: '#64748b' }}>{formatTimeOnly(booking.completedAt) || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                      {/* Service Cancelled */}
                      {booking.status === 'CANCELLED' && booking.cancellationReason && (
                        <div
                          className="d-flex align-items-center"
                          style={{
                            padding: '20px',
                            background: 'white',
                            borderRadius: '12px',
                            marginBottom: '15px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                            borderLeft: '4px solid #667eea',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              borderRadius: '12px',
                              padding: '15px',
                              textAlign: 'center',
                              marginRight: '20px',
                              minWidth: '80px',
                              boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)',
                            }}
                          >
                            <h5 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                              {formatBookingDate(booking.completedAt).day}
                            </h5>
                            <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '5px', display: 'block' }}>
                              {formatBookingDate(booking.completedAt).monthYear}
                            </span>
                          </div>
                          <div>
                            <h6 style={{ color: '#1e293b', fontWeight: 600, marginBottom: '5px' }}>
                              Đã hủy
                              <span
                                style={{
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '20px',
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  display: 'inline-block',
                                  marginLeft: '8px',
                                  boxShadow: '0 3px 10px rgba(239, 68, 68, 0.3)',
                                }}
                              >
                                ✗ Đã hủy
                              </span>
                            </h6>
                            <span style={{ color: '#64748b' }}>{formatTimeOnly(booking.completedAt) || 'N/A'}</span>
                            <p style={{ marginTop: '8px', color: '#64748b', fontSize: '0.8rem' }}>
                              Lý do: {booking.cancellationReason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
          ))}
      </div>
    </>
  );
};

export default BookingHistory;