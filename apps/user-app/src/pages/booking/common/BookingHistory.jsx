import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Dropdown, Table, Pagination, Card } from 'react-bootstrap';
import { fetchUserBookingHistory, cancelBooking } from '../../../features/bookings/bookingSlice';
import { requestWarrantyThunk, resetWarrantyState } from '../../../features/booking-warranty/warrantySlice';
import { formatBookingDate, formatDateOnly, formatTimeOnly } from '../../../utils/formatDate';
import { toast } from 'react-toastify';
import ImageUploader from './ImageUploader';
import { FaFileAlt, FaUser, FaClock, FaCalendar, FaTag, FaBan, FaMapMarkerAlt, FaDollarSign, FaUserCheck, FaHourglassHalf, FaSpinner } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/formatDuration';

// Status color mapping function
const getStatusColor = (status) => {
  const statusColors = {
    PENDING: '#ffc107',
    CONFIRMED: '#17a2b8',
    IN_PROGRESS: '#fd7e14',
    CONFIRM_ADDITIONAL: '#28a745',
    CANCELLED: '#dc3545',
    ACCEPTED: '#20c997',
    REJECTED: '#FF0000',
    WAITING_CUSTOMER_CONFIRM_ADDITIONAL: '#fd7e14',
    AWAITING_CONFIRM: '#0d6efd',
    AWAITING_DONE: '#e83e8c',
    DONE: '#198754',
  };
  return statusColors[status] || '#6c757d';
};

// Status label translation function
const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return 'Đang chờ';
    case 'CONFIRMED':
      return 'Xác nhận';
    case 'IN_PROGRESS':
      return 'Đang thực hiện';
    case 'CONFIRM_ADDITIONAL':
      return 'Chấp nhận thêm chi phí';
    case 'CANCELLED':
      return 'Hủy';
    case 'ACCEPTED':
      return 'Đồng ý';
    case 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL':
      return 'Chờ chấp nhận chi phí thêm';
    case 'AWAITING_CONFIRM':
      return 'Chờ chấp nhận';
    case 'AWAITING_DONE':
      return 'Chờ thanh toán';
    case 'DONE':
      return 'Đã thanh toán';
    default:
      return status;
  }
};

const BookingHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookingHistories, total, status, error } = useSelector((state) => state.booking);
  const { loading: warrantyLoading, error: warrantyError } = useSelector((state) => state.warranty);
  const { user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [warrantyImages, setWarrantyImages] = useState([]);
  const [warrantyReason, setWarrantyReason] = useState('');
  const [warrantyReasonError, setWarrantyReasonError] = useState(null);
  const [selectedWarrantyBookingId, setSelectedWarrantyBookingId] = useState(null);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  const limit = 5;

  const handleFilesSelect = (files) => {
    setWarrantyImages(files);
  };

  useEffect(() => {
    dispatch(fetchUserBookingHistory({ limit, skip: page * limit }));
  }, [dispatch, page]);

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
    if (newPage >= 0 && bookingHistories?.length === limit) {
      setPage(newPage);
    }
  };

  const isCustomer = user?.role?.name === 'CUSTOMER';
  const isTechnician = user?.role?.name === 'TECHNICIAN';

  return (
    <div className="content py-4">
      <div className="container">
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <h4 className="card-title mb-4">Lịch sử đặt dịch vụ</h4>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Dịch vụ</th>
                  <th>{isCustomer ? 'Kỹ thuật viên' : 'Khách hàng'}</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {status === 'loading' ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center text-danger">
                      {error}
                    </td>
                  </tr>
                ) : !Array.isArray(bookingHistories) || bookingHistories?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      Không có đặt lịch nào
                    </td>
                  </tr>
                ) : (
                  bookingHistories.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.bookingCode}</td>
                      <td>{booking.serviceId?.serviceName || 'N/A'}</td>
                      <td>
                        {isCustomer
                          ? booking.technicianId?.userId?.fullName || 'N/A'
                          : booking.customerId?.fullName || 'N/A'}
                      </td>
                      <td>{formatDateOnly(booking.schedule?.startTime) || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            backgroundColor: getStatusColor(booking.status),
                            color: 'white',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'inline-block',
                          }}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td className="text-end">
                        <Dropdown>
                          <Dropdown.Toggle variant="link" className="p-0">
                            <i className="fas fa-ellipsis-v"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => setShowDetailsModal(booking._id)}>
                              <FaFileAlt className="me-2" /> Chi tiết
                            </Dropdown.Item>
                            {isCustomer && booking.status === 'DONE' && (
                              <Dropdown.Item onClick={() => handleWarrantyModalOpen(booking._id)}>
                                <FaTag className="me-2" /> Yêu cầu bảo hành
                              </Dropdown.Item>
                            )}

                            {isCustomer && (
                              <Dropdown.Item
                                onClick={() => {
                                  if (['PENDING', 'AWAITING_CONFIRM'].includes(booking.status)) {
                                    navigate(`/booking/choose-technician?bookingId=${booking._id}`);
                                  } else if (booking.status !== 'CANCELLED') {
                                    navigate(`/booking/booking-processing?bookingId=${booking._id}`);
                                  }
                                }}
                                className="text-primary"
                              >
                                {['PENDING', 'AWAITING_CONFIRM'].includes(booking.status) && (
                                  <>
                                    <FaUserCheck className="me-2" /> Chọn thợ
                                  </>
                                )}
                                {!['DONE', 'CANCELLED', 'PENDING', 'AWAITING_CONFIRM'].includes(booking.status) && (
                                  <>
                                    <FaSpinner className="me-2" /> Xem tiến trình
                                  </>
                                )

                                }
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            <Pagination className="justify-content-center mt-4">
              <Pagination.Prev
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
              >
                Trang Trước
              </Pagination.Prev>
              <Pagination.Next
                onClick={() => handlePageChange(page + 1)}
                disabled={bookingHistories?.length < limit}
              >
                Trang Sau
              </Pagination.Next>
            </Pagination>
          </Card.Body>
        </Card>

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
    </div>
  );
};

export default BookingHistory;