import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import ApiBE from '../../services/ApiBE';
import { Modal, Button } from 'antd';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  const [searchText, setSearchText] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await bookingAPI.getAll();
      setBookings(data || []);
      // Lấy tất cả customerId và serviceId duy nhất
      const customerIds = Array.from(new Set((data || []).map(b => b.customerId)));
      const serviceIds = Array.from(new Set((data || []).map(b => b.serviceId)));
      // Lấy tên customer
      const userMapTemp = {};
      await Promise.all(customerIds.map(async (id) => {
        try {
          const user = await userAPI.getById(id);
          userMapTemp[id] = user.fullName || user.email || id;
        } catch {
          userMapTemp[id] = id;
        }
      }));
      setUserMap(userMapTemp);
      // Lấy tên service
      const serviceMapTemp = {};
      await Promise.all(serviceIds.map(async (id) => {
        try {
          const res = await ApiBE.get(`/Dashboard/services/${id}`);
          serviceMapTemp[id] = res.data.name || id;
        } catch {
          serviceMapTemp[id] = id;
        }
      }));
      setServiceMap(serviceMapTemp);
    };
    fetchData();
  }, []);

  const filteredBookings = bookings.filter(b =>
    (userMap[b.customerId] || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (serviceMap[b.serviceId] || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (b.status || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (b.id || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      <div className="content me-4">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Bookings</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Bookings</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="top-search me-2">
            <div className="top-search-group">
              <span className="input-icon">
                <i className="ti ti-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search bookings"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{userMap[b.customerId] || b.customerId}</td>
                  <td>{serviceMap[b.serviceId] || b.serviceId}</td>
                  <td>{b.status}</td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</td>
                  <td>
                    <Button size="small" onClick={() => { setSelectedBooking(b); setShowDetailModal(true); }}>
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showDetailModal && selectedBooking && (
        <Modal
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={null}
          title="Booking Detail"
        >
          <div><b>ID:</b> {selectedBooking.id}</div>
          <div><b>Customer:</b> {userMap[selectedBooking.customerId] || selectedBooking.customerId}</div>
          <div><b>Service:</b> {serviceMap[selectedBooking.serviceId] || selectedBooking.serviceId}</div>
          <div><b>Status:</b> {selectedBooking.status}</div>
          <div><b>Created At:</b> {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : ''}</div>
          
        </Modal>
      )}
    </div>
  );
};

export default BookingManagement; 