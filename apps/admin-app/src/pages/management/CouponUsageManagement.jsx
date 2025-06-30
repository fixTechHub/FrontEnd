import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCouponUsages } from '../../features/couponusages/couponUsageSlice';
import { userAPI } from '../../features/users/userAPI';
import { couponAPI } from '../../features/coupons/couponAPI';
import { Modal, Button } from 'antd';

const CouponUsageManagement = () => {
  const dispatch = useDispatch();
  const { usages = [], loading = false, error = null } = useSelector(state => state.couponUsage) || {};
  const [userMap, setUserMap] = useState({});
  const [couponMap, setCouponMap] = useState({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState(null);

  useEffect(() => {
    dispatch(fetchCouponUsages());
  }, [dispatch]);

  useEffect(() => {
    // Lấy thông tin user và coupon cho tất cả usage
    const fetchDetails = async () => {
      const userIds = Array.from(new Set(usages.map(u => u.userId)));
      const couponIds = Array.from(new Set(usages.map(u => u.couponId)));
      const userMapTemp = {};
      const couponMapTemp = {};
      await Promise.all([
        Promise.all(userIds.map(async (id) => {
          try {
            const user = await userAPI.getById(id);
            userMapTemp[id] = user.fullName || user.email || id;
          } catch {
            userMapTemp[id] = id;
          }
        })),
        Promise.all(couponIds.map(async (id) => {
          try {
            const coupon = await couponAPI.getById(id);
            couponMapTemp[id] = coupon.code || id;
          } catch {
            couponMapTemp[id] = id;
          }
        }))
      ]);
      setUserMap(userMapTemp);
      setCouponMap(couponMapTemp);
    };
    if (usages.length > 0) fetchDetails();
  }, [usages]);

  return (
    <div className="page-wrapper">
      <div className="content me-4">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Coupon Usages</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Coupon Usages</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>USER</th>
                <th>COUPON</th>
                <th>BOOKING ID</th>
                <th>USED AT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {usages.map((usage) => (
                <tr key={usage.id}>
                  <td>{userMap[usage.userId] || usage.userId}</td>
                  <td>{couponMap[usage.couponId] || usage.couponId}</td>
                  <td>{usage.bookingId}</td>
                  <td>{usage.usedAt ? new Date(usage.usedAt).toLocaleString() : ''}</td>
                  <td>
                    <Button size="small" onClick={() => { setSelectedUsage(usage); setShowDetailModal(true); }}>
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showDetailModal && selectedUsage && (
        <Modal
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
          footer={null}
          title="Coupon Usage Detail"
        >
          <div><b>ID:</b> {selectedUsage.id}</div>
          <div><b>User:</b> {userMap[selectedUsage.userId] || selectedUsage.userId}</div>
          <div><b>Coupon:</b> {couponMap[selectedUsage.couponId] || selectedUsage.couponId}</div>
          <div><b>Booking ID:</b> {selectedUsage.bookingId}</div>
          <div><b>Used At:</b> {selectedUsage.usedAt ? new Date(selectedUsage.usedAt).toLocaleString() : ''}</div>
          
        </Modal>
      )}
    </div>
  );
};

export default CouponUsageManagement; 