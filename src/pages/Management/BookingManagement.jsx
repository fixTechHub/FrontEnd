import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Spin, Badge } from 'antd';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import {
  setBookings,
  setLoading,
  setError,
  setSelectedBooking,
} from '../../features/bookings/bookingSlice';
import { selectPaginatedBookings } from '../../features/bookings/bookingSelectors';

const BookingManagement = () => {
  const dispatch = useDispatch();
  const bookings = useSelector(selectPaginatedBookings);
  const loading = useSelector(state => state.bookings.loading);
  const error = useSelector(state => state.bookings.error);
  const selectedBooking = useSelector(state => state.bookings.selectedBooking);

  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchBookings = async () => {
    try {
      dispatch(setLoading(true));
      const data = await bookingAPI.getAll();
      dispatch(setBookings(data));
    } catch (err) {
      dispatch(setError(err.toString()));
      message.error('Failed to load bookings.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [dispatch]);

  const handleViewDetail = (booking) => {
    dispatch(setSelectedBooking(booking));
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    dispatch(setSelectedBooking(null));
  };

  const statusColor = {
    'Active': 'green',
    'Inactive': 'red',
    'Pending': 'orange',
    // ...
  };

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Bookings</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/admin">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Bookings</li>
              </ol>
            </nav>
          </div>
        </div>

        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="custom-datatable-filter table-responsive">
            <table className="table datatable">
              <thead className="thead-light">
                <tr>
                  <th>ID</th>
                  <th>Booking Code</th>
                  <th>Customer ID</th>
                  <th>Service ID</th>
                  <th>Status</th>
                  <th>Booking Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(bookings) ? bookings : []).map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.bookingCode}</td>
                    <td>{booking.customerId}</td>
                    <td>{booking.serviceId}</td>
                    <td>
                      <Badge color={statusColor[booking.status] || 'gray'} text={booking.status} />
                    </td>
                    <td>{booking.schedule ? new Date(booking.schedule).toLocaleString() : '-'}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleViewDetail(booking)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xem chi tiết booking */}
      <Modal
        title="Booking Detail"
        open={showDetailModal}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedBooking ? (
          <div>
            <p><b>ID:</b> {selectedBooking.id}</p>
            <p><b>Booking Code:</b> {selectedBooking.bookingCode}</p>
            <p><b>Customer ID:</b> {selectedBooking.customerId}</p>
            <p><b>Service ID:</b> {selectedBooking.serviceId}</p>
            <p><b>Status:</b> {selectedBooking.status}</p>
            <p><b>Booking Date:</b> {selectedBooking.schedule ? new Date(selectedBooking.schedule).toLocaleString() : '-'}</p>
            {/* Thêm các trường khác nếu cần */}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default BookingManagement; 