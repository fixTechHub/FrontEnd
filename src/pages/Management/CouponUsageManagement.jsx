import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCouponUsages,
  fetchCouponUsageById,
  resetState,
} from '../../features/couponusages/couponUsageSlice';
import dayjs from 'dayjs';

// Helper function to safely truncate ID
const truncateId = (id) => {
  if (!id) return 'N/A';
  return typeof id === 'string' ? `${id.substring(0, 8)}...` : id.toString();
};

const CouponUsageManagement = () => {
  const dispatch = useDispatch();
  const { usages, loading, error, success } = useSelector((state) => state.couponUsage);
  const [searchText, setSearchText] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUsage, setDetailUsage] = useState(null);

  useEffect(() => {
    dispatch(fetchCouponUsages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      console.error(error);
      dispatch(resetState());
    }
  }, [error, dispatch]);

  // Filter usages based on search text
  const filteredUsages = usages.filter(usage =>
    usage.couponId?.toLowerCase().includes(searchText.toLowerCase()) ||
    usage.userId?.toLowerCase().includes(searchText.toLowerCase()) ||
    usage.bookingId?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (id) => {
    dispatch(fetchCouponUsageById(id)).then((action) => {
      if (action.payload) {
        setDetailUsage(action.payload);
        setDetailModalOpen(true);
      } else {
        console.error('Không thể lấy chi tiết usage!');
      }
    });
  };

  return (
    <div className="page-wrapper">
      <div className="content me-4">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Coupon Usage</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Coupon Usage</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button className="btn btn-primary d-flex align-items-center">
                <i className="ti ti-plus me-2"></i>Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="top-search me-2">
            <div className="top-search-group">
              <span className="input-icon">
                <i className="ti ti-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
              placeholder="Search by Coupon ID, User ID, or Booking ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>COUPON ID</th>
                <th>USER ID</th>
                <th>BOOKING ID</th>
                <th>USED AT</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsages.map((usage) => (
                <tr key={usage.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar me-2 flex-shrink-0">
                        <div className="avatar-initial rounded-circle bg-primary">
                          <i className="ti ti-ticket"></i>
                        </div>
                      </div>
                      <h6 className="fs-14 fw-semibold">{truncateId(usage.id)}</h6>
                    </div>
                  </td>
                  <td>
                    <p className="text-gray-9">{truncateId(usage.couponId)}</p>
                  </td>
                  <td>
                    <p className="text-gray-9">{truncateId(usage.userId)}</p>
                  </td>
                  <td>
                    <p className="text-gray-9">{truncateId(usage.bookingId)}</p>
                  </td>
                  <td>
                    <p className="text-gray-9">
                      {usage.usedAt ? dayjs(usage.usedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
                    </p>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end p-2">
                        <li>
                          <button 
                            className="dropdown-item rounded-1" 
                            onClick={() => handleViewDetails(usage.id)}
                          >
                            <i className="ti ti-eye me-1"></i>View Details
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="footer d-sm-flex align-items-center justify-content-between bg-white p-3">
        <p className="mb-0">
          <a href="javascript:void(0);">Privacy Policy</a>
          <a href="javascript:void(0);" className="ms-4">Terms of Use</a>
        </p>
        <p>&copy; 2025 Dreamsrent, Made with <span className="text-danger">❤</span> by <a href="javascript:void(0);" className="text-secondary">Dreams</a></p>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">Usage Details</h5>
                <button type="button" className="btn-close" onClick={() => setDetailModalOpen(false)}></button>
              </div>
              <div className="modal-body">
        {detailUsage ? (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">ID</label>
                        <input type="text" className="form-control" value={detailUsage.id || 'N/A'} readOnly />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Coupon ID</label>
                        <input type="text" className="form-control" value={detailUsage.couponId || 'N/A'} readOnly />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">User ID</label>
                        <input type="text" className="form-control" value={detailUsage.userId || 'N/A'} readOnly />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Booking ID</label>
                        <input type="text" className="form-control" value={detailUsage.bookingId || 'N/A'} readOnly />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Used At</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={detailUsage.usedAt ? dayjs(detailUsage.usedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
        ) : (
                  <p>Loading...</p>
        )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setDetailModalOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponUsageManagement;