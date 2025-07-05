import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select } from 'antd';
import {
 fetchCoupons,
 createCoupon,
 updateCoupon,
 deleteCoupon,
 resetState,
 fetchDeletedCoupons,
} from '../../features/coupons/couponSlice';
import { couponAPI } from '../../features/coupons/couponAPI';


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


const CouponManagement = () => {
 const dispatch = useDispatch();
 const couponState = useSelector((state) => state.coupon) || {};
 const { coupons = [], loading = false, error = null, success = false, deletedCoupons = [] } = couponState;


 const [showAddModal, setShowAddModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showRestoreModal, setShowRestoreModal] = useState(false);
 const [selectedCoupon, setSelectedCoupon] = useState(null);
 const [formData, setFormData] = useState(initialFormState);
 const [searchText, setSearchText] = useState('');
 const [currentPage, setCurrentPage] = useState(1);
 const [sortField, setSortField] = useState('createdAt');
const [sortOrder, setSortOrder] = useState('desc');


 const [filterType, setFilterType] = useState();
const [filterStatus, setFilterStatus] = useState();



 const couponsPerPage = 10;


 const handleSortChange = (value) => {
   if (value === 'lasted') {
     setSortField('createdAt');
     setSortOrder('desc');
   } else if (value === 'oldest') {
     setSortField('createdAt');
     setSortOrder('asc');
   }
 };

 const handleSortByCode = () => {
   if (sortField === 'code') {
     setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
   } else {
     setSortField('code');
     setSortOrder('asc');
   }
 };

 const handleSortByValue = () => {
   if (sortField === 'value') {
     setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
   } else {
     setSortField('value');
     setSortOrder('asc');
   }
 };

 const filteredCoupons = coupons.filter(coupon =>
   coupon.code?.toLowerCase().includes(searchText.toLowerCase()) &&
   (!filterType || coupon.type === filterType) &&
   (!filterStatus || (filterStatus === 'ACTIVE' ? coupon.isActive : !coupon.isActive))
 );

 const sortedCoupons = [...filteredCoupons].sort((a, b) => {
   if (sortField === 'code') {
     if (!a.code) return 1;
     if (!b.code) return -1;
     if (sortOrder === 'asc') {
       return a.code.localeCompare(b.code);
     } else {
       return b.code.localeCompare(a.code);
     }
   } else if (sortField === 'value') {
     if (a.value == null) return 1;
     if (b.value == null) return -1;
     if (sortOrder === 'asc') {
       return a.value - b.value;
     } else {
       return b.value - a.value;
     }
   } else if (sortField === 'createdAt') {
     const dateA = new Date(a.createdAt);
     const dateB = new Date(b.createdAt);
     if (sortOrder === 'asc') {
       return dateA - dateB;
     } else {
       return dateB - dateA;
     }
   }
   return 0;
 });

 const indexOfLastCoupon = currentPage * couponsPerPage;
 const indexOfFirstCoupon = indexOfLastCoupon - couponsPerPage;
 const currentCoupons = sortedCoupons.slice(indexOfFirstCoupon, indexOfLastCoupon);


 const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);


 const handlePageChange = (page) => {
   setCurrentPage(page);
 };


 useEffect(() => {
   dispatch(fetchCoupons());
   dispatch(fetchDeletedCoupons());
 }, [dispatch]);


 useEffect(() => {
   if (error) {
     message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
     dispatch(resetState());
   }
   if (success) {
     message.success('Thao tác thành công!');
     setShowAddModal(false);
     setShowEditModal(false);
     setShowDeleteModal(false);
     dispatch(resetState());
     dispatch(fetchCoupons());
   }
 }, [error, success, dispatch]);






 const handleAddCoupon = () => {
   setFormData(initialFormState);
   setShowAddModal(true);
 };


 const handleEditCoupon = (coupon) => {
   setSelectedCoupon(coupon);
   setFormData({
     code: coupon.code || '',
     description: coupon.description || '',
     type: coupon.type || 'PERCENT',
     value: coupon.value || '',
     maxDiscount: coupon.maxDiscount || '',
     minOrderValue: coupon.minOrderValue || '',
     totalUsageLimit: coupon.totalUsageLimit || '',
     startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
     endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
     isActive: coupon.isActive ?? true,
     audience: coupon.audience || 'ALL',
     userIds: coupon.userIds || []
   });
   setShowEditModal(true);
 };


 const handleDeleteCoupon = (coupon) => {
   setSelectedCoupon(coupon);
   setShowDeleteModal(true);
 };


 const confirmDelete = () => {
   if (selectedCoupon) {
     console.log('Delete coupon id:', selectedCoupon.id);
     dispatch(deleteCoupon(selectedCoupon.id));
   }
 };


 const handleRestoreCoupon = async (id) => {
   try {
     await couponAPI.restore(id);
     message.success('Khôi phục coupon thành công!');
     dispatch(fetchDeletedCoupons());
     dispatch(fetchCoupons());
   } catch (err) {
     message.error('Khôi phục coupon thất bại!');
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
   if (showAddModal) {
     dispatch(createCoupon(formData));
   } else if (showEditModal && selectedCoupon) {
     dispatch(updateCoupon({ id: selectedCoupon.id, couponData: formData }));
   }
 };


 console.log('coupons:', coupons);
 console.log('deletedCoupons:', deletedCoupons);


 return (
   <div className="modern-page-wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Coupon Management</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Home</a></li>
               <li className="breadcrumb-item active">Coupons</li>
             </ol>
           </nav>
         </div>
         <div className="d-flex">
           <Button type="primary" onClick={handleAddCoupon} style={{ marginRight: 8 }}>Add coupon</Button>
           <Button type="success" onClick={() => setShowRestoreModal(true)}>Restore</Button>
         </div>
       </div>
       <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
         <div className="d-flex align-items-center gap-2">
           <div className="top-search">
             <div className="top-search-group">
               <span className="input-icon">
                 <i className="ti ti-search"></i>
               </span>
               <input
                 type="text"
                 className="form-control"
                 placeholder="Search Coupons"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
           <Select
             placeholder="Type"
             value={filterType || undefined}
             onChange={value => setFilterType(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="PERCENT">PERCENT</Select.Option>
             <Select.Option value="FIXED">FIXED</Select.Option>
           </Select>
           <Select
             placeholder="Status"
             value={filterStatus || undefined}
             onChange={value => setFilterStatus(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="ACTIVE">ACTIVE</Select.Option>
             <Select.Option value="INACTIVE">INACTIVE</Select.Option>
           </Select>
         </div>
         <div className="d-flex align-items-center" style={{ gap: 12 }}>
           <span style={{ marginRight: 8, fontWeight: 500 }}>Sort by:</span>
           <Select
             value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
             style={{ width: 120 }}
             onChange={handleSortChange}
             options={[
               { value: 'lasted', label: 'Lasted' },
               { value: 'oldest', label: 'Oldest' },
             ]}
           />
         </div>
       </div>
       {loading ? <Spin /> : (
         <div className="custom-datatable-filter table-responsive">
           <table className="table datatable">
             <thead className="thead-light">
               <tr>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByCode}>
                    CODE
                   {sortField === 'code' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>DESCRIPTION</th>
                 <th>TYPE</th>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByValue}>
                    VALUE
                   {sortField === 'value' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>STATUS</th>
                 <th>ACTION</th>
               </tr>
             </thead>
             <tbody>
               {currentCoupons.map((coupon) => (
                 <tr key={coupon.id}>
                   <td>{coupon.code}</td>
                   <td>{coupon.description}</td>
                   <td>{coupon.type}</td>
                   <td>{coupon.value}</td>
                   <td>
                     <span className={`badge ${coupon.isActive ? 'bg-success' : 'bg-danger'}`}>
                       {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                     </span>
                   </td>
                   <td>
                     <Button size="small" onClick={() => handleEditCoupon(coupon)} style={{ marginRight: 8 }}>Edit</Button>
                     <Button size="small" danger onClick={() => handleDeleteCoupon(coupon)}>Delete</Button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>




         </div>


       )}
       <div className="d-flex justify-content-end mt-3">
         <nav>
           <ul className="pagination mb-0">
             {[...Array(totalPages)].map((_, i) => (
               <li
                 key={i}
                 className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
               >
                 <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                   {i + 1}
                 </button>
               </li>
             ))}
           </ul>
         </nav>
       </div>
     </div>




     {/* Add Modal */}
     <Modal
       open={showAddModal}
       onCancel={() => setShowAddModal(false)}
       footer={null}
       title="Add coupon"
     >
       <form onSubmit={handleSubmit}>
         <div className="mb-3">
           <label className="form-label">Code</label>
           <input
             type="text"
             name="code"
             className="form-control"
             value={formData.code}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Description</label>
           <textarea
             name="description"
             className="form-control"
             value={formData.description}
             onChange={handleChange}
             rows="3"
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Type</label>
           <select
             name="type"
             className="form-control"
             value={formData.type}
             onChange={handleChange}
           >
             <option value="PERCENT">PERCENT</option>
             <option value="FIXED">FIXED</option>
           </select>
         </div>
         <div className="mb-3">
           <label className="form-label">Value</label>
           <input
             type="number"
             name="value"
             className="form-control"
             value={formData.value}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Max Discount</label>
           <input
             type="number"
             name="maxDiscount"
             className="form-control"
             value={formData.maxDiscount}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Min Order Value</label>
           <input
             type="number"
             name="minOrderValue"
             className="form-control"
             value={formData.minOrderValue}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Total Usage Limit</label>
           <input
             type="number"
             name="totalUsageLimit"
             className="form-control"
             value={formData.totalUsageLimit}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Start Date</label>
           <input
             type="date"
             name="startDate"
             className="form-control"
             value={formData.startDate}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">End Date</label>
           <input
             type="date"
             name="endDate"
             className="form-control"
             value={formData.endDate}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Status</label>
           <div>
             <input
               type="checkbox"
               name="isActive"
               checked={formData.isActive}
               onChange={handleChange}
               id="isActiveSwitch"
             />
             <label htmlFor="isActiveSwitch" style={{ marginLeft: 8 }}>{formData.isActive ? 'Active' : 'Inactive'}</label>
           </div>
         </div>
         <div className="d-flex justify-content-end">
           <button type="button" className="btn btn-light me-2" onClick={() => setShowAddModal(false)}>Cancel</button>
           <button type="submit" className="btn btn-primary">Save</button>
         </div>
       </form>
     </Modal>


     {/* Edit Modal */}
     <Modal
       open={showEditModal}
       onCancel={() => setShowEditModal(false)}
       footer={null}
       title="Update coupon"
     >
       <form onSubmit={handleSubmit}>
         <div className="mb-3">
           <label className="form-label">Code</label>
           <input
             type="text"
             name="code"
             className="form-control"
             value={formData.code}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Description</label>
           <textarea
             name="description"
             className="form-control"
             value={formData.description}
             onChange={handleChange}
             rows="3"
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Type</label>
           <select
             name="type"
             className="form-control"
             value={formData.type}
             onChange={handleChange}
           >
             <option value="PERCENT">PERCENT</option>
             <option value="FIXED">FIXED</option>
           </select>
         </div>
         <div className="mb-3">
           <label className="form-label">Value</label>
           <input
             type="number"
             name="value"
             className="form-control"
             value={formData.value}
             onChange={handleChange}
             required
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Max Discount</label>
           <input
             type="number"
             name="maxDiscount"
             className="form-control"
             value={formData.maxDiscount}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Min Order Value</label>
           <input
             type="number"
             name="minOrderValue"
             className="form-control"
             value={formData.minOrderValue}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Total Usage Limit</label>
           <input
             type="number"
             name="totalUsageLimit"
             className="form-control"
             value={formData.totalUsageLimit}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Start Date</label>
           <input
             type="date"
             name="startDate"
             className="form-control"
             value={formData.startDate}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">End Date</label>
           <input
             type="date"
             name="endDate"
             className="form-control"
             value={formData.endDate}
             onChange={handleChange}
           />
         </div>
         <div className="mb-3">
           <label className="form-label">Status</label>
           <div>
             <input
               type="checkbox"
               name="isActive"
               checked={formData.isActive}
               onChange={handleChange}
               id="isActiveSwitchEdit"
             />
             <label htmlFor="isActiveSwitchEdit" style={{ marginLeft: 8 }}>{formData.isActive ? 'Active' : 'Inactive'}</label>
           </div>
         </div>
         <div className="d-flex justify-content-end">
           <button type="button" className="btn btn-light me-2" onClick={() => setShowEditModal(false)}>Cancel</button>
           <button type="submit" className="btn btn-primary">Save</button>
         </div>
       </form>
     </Modal>


     {/* Delete Modal */}
     <Modal
       open={showDeleteModal}
       onCancel={() => setShowDeleteModal(false)}
       footer={null}
       title="Delete coupon"
     >
       <div className="modal-body text-center">
         <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
         <h4 className="mb-1">Delete coupon</h4>
         <p className="mb-3">Bạn có chắc muốn xóa coupon này?</p>
         <div className="d-flex justify-content-center">
           <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>Cancel</button>
           <button type="button" className="btn btn-danger" onClick={confirmDelete}>Delete</button>
         </div>
       </div>
     </Modal>


     {/* Restore Modal */}
     <Modal
       open={showRestoreModal}
       onCancel={() => setShowRestoreModal(false)}
       footer={null}
       title="Restore coupon"
       width={800}
     >
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>CODE</th>
               <th>DESCRIPTION</th>
               <th>TYPE</th>
               <th>VALUE</th>
               <th>ACTION</th>
             </tr>
           </thead>
           <tbody>
             {deletedCoupons.map((coupon) => (
               <tr key={coupon.id}>
                 <td>{coupon.code}</td>
                 <td>{coupon.description}</td>
                 <td>{coupon.type}</td>
                 <td>{coupon.value}</td>
                 <td>
                   <Button size="small" type="primary" onClick={() => handleRestoreCoupon(coupon.id)}>
                     Restore
                   </Button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
       <div className="d-flex justify-content-end mt-3">
         <button type="button" className="btn btn-light" onClick={() => setShowRestoreModal(false)}>Close</button>
       </div>
     </Modal>
   </div>
 );
};


export default CouponManagement;

