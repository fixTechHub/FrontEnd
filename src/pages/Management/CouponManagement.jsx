import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, resetState } from '../../features/coupons/couponSlice';

const CouponManagement = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error, success } = useSelector((state) => state.coupon);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  const initialFormState = {
    code: '',
    description: '',
    type: 'PERCENT',
    value: '',
    maxDiscount: '',
    minOrderValue: '',
    totalUsageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true,
    audience: 'ALL',
    userIds: []
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error.title || 'An error occurred. Please try again.');
      dispatch(resetState());
    }
    if (success) {
      message.success('Operation successful!');
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      dispatch(resetState());
      dispatch(fetchCoupons());
    }
  }, [error, success, dispatch]);

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddCoupon = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };
  
  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      ...coupon,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDeleteCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCoupon) {
      dispatch(deleteCoupon(selectedCoupon.id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const couponData = {
      ...formData,
      value: parseFloat(formData.value),
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      minOrderValue: parseFloat(formData.minOrderValue),
      totalUsageLimit: parseInt(formData.totalUsageLimit, 10)
    };

    if (showAddModal) {
      dispatch(createCoupon(couponData));
    } else if (showEditModal && selectedCoupon) {
      dispatch(updateCoupon({ id: selectedCoupon.id, couponData }));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content me-4">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Coupons</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Coupons</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <div className="mb-2">
              <button className="btn btn-primary d-flex align-items-center" onClick={handleAddCoupon}>
                <i className="ti ti-plus me-2"></i>Add Coupon
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
                placeholder="Search coupons"
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
                <th>CODE</th>
                <th>DESCRIPTION</th>
                <th>DISCOUNT</th>
                <th>VALID PERIOD</th>
                <th>MIN ORDER</th>
                <th>USAGE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <h6><span className="fs-14 fw-semibold">{coupon.code}</span></h6>
                    </div>
                  </td>
                  <td><p className="text-gray-9">{coupon.description}</p></td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="fw-semibold">{coupon.value}</span>
                      <span className={`badge badge-sm ms-2 ${coupon.type === 'PERCENT' ? 'bg-primary' : 'bg-success'}`}>
                        {coupon.type === 'PERCENT' ? '%' : '$'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <small className="text-gray-6">From: {new Date(coupon.startDate).toLocaleDateString()}</small>
                      <small className="text-gray-6">To: {new Date(coupon.endDate).toLocaleDateString()}</small>
                    </div>
                  </td>
                  <td><p className="text-gray-9">${coupon.minOrderValue}</p></td>
                  <td>
                    <div className="d-flex flex-column">
                      <small className="text-gray-6">Used: {coupon.usedCount}</small>
                      <small className="text-gray-6">Limit: {coupon.totalUsageLimit}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-dark-transparent ${coupon.isActive ? 'text-success' : 'text-danger'}`}>
                      <i className={`ti ti-point-filled ${coupon.isActive ? 'text-success' : 'text-danger'} me-1`}></i>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-icon btn-sm" type="button" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end p-2">
                        <li>
                          <button className="dropdown-item rounded-1" onClick={() => handleEditCoupon(coupon)}>
                            <i className="ti ti-edit me-1"></i>Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item rounded-1" onClick={() => handleDeleteCoupon(coupon)}>
                            <i className="ti ti-trash me-1"></i>Delete
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="mb-0">Create Coupon</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                </div>
                <div className="modal-body pb-1">
                  {/* Form fields will be inserted here from the component */}
                  <div className="row">
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Coupon Code <span className="text-danger">*</span></label>
                        <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description <span className="text-danger">*</span></label>
                        <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Type <span className="text-danger">*</span></label>
                        <select name="type" className="form-select" value={formData.type} onChange={handleChange} required >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FIXED">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Value <span className="text-danger">*</span></label>
                        <input type="number" name="value" className="form-control" value={formData.value} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Max Discount</label>
                        <input type="number" name="maxDiscount" className="form-control" value={formData.maxDiscount} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Min Order Value <span className="text-danger">*</span></label>
                        <input type="number" name="minOrderValue" className="form-control" value={formData.minOrderValue} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Usage Limit <span className="text-danger">*</span></label>
                        <input type="number" name="totalUsageLimit" className="form-control" value={formData.totalUsageLimit} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                        <input type="date" name="startDate" className="form-control" value={formData.startDate} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">End Date <span className="text-danger">*</span></label>
                        <input type="date" name="endDate" className="form-control" value={formData.endDate} onChange={handleChange} required />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="mb-0">Edit Coupon</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body pb-1">
                  <div className="row">
                  <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Coupon Code <span className="text-danger">*</span></label>
                        <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">Description <span className="text-danger">*</span></label>
                        <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Type <span className="text-danger">*</span></label>
                        <select name="type" className="form-select" value={formData.type} onChange={handleChange} required >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FIXED">Fixed Amount ($)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Value <span className="text-danger">*</span></label>
                        <input type="number" name="value" className="form-control" value={formData.value} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Max Discount</label>
                        <input type="number" name="maxDiscount" className="form-control" value={formData.maxDiscount} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Min Order Value <span className="text-danger">*</span></label>
                        <input type="number" name="minOrderValue" className="form-control" value={formData.minOrderValue} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Usage Limit <span className="text-danger">*</span></label>
                        <input type="number" name="totalUsageLimit" className="form-control" value={formData.totalUsageLimit} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Start Date <span className="text-danger">*</span></label>
                        <input type="date" name="startDate" className="form-control" value={formData.startDate} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="mb-3">
                        <label className="form-label">End Date <span className="text-danger">*</span></label>
                        <input type="date" name="endDate" className="form-control" value={formData.endDate} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="form-check form-check-md form-switch">
                        <label className="form-check-label form-label mt-0 mb-0">
                          <input className="form-check-input me-2" type="checkbox" name="isActive" role="switch" checked={formData.isActive} onChange={handleChange}/>
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center">
                <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
                <h4 className="mb-1">Delete Coupon</h4>
                <p className="mb-3">Are you sure you want to delete this coupon?</p>
                <div className="d-flex justify-content-center">
                  <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="footer d-sm-flex align-items-center justify-content-between bg-white p-3">
        <p className="mb-0">
          <a href="#">Privacy Policy</a>
          <a href="#" className="ms-4">Terms of Use</a>
        </p>
        <p>&copy; 2025 Fix Tech, Made with <span className="text-danger">❤</span> by <a href="#" className="text-secondary">Fix Tech Team</a></p>
      </div>
    </div>
  );
};

export default CouponManagement; 