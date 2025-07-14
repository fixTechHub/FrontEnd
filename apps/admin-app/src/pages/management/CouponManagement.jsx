import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, DatePicker, InputNumber, Switch } from 'antd';
import dayjs from 'dayjs';
import {
 fetchCoupons,
 createCoupon,
 updateCoupon,
 deleteCoupon,
 resetState,
 fetchDeletedCoupons,
} from '../../features/coupons/couponSlice';
import { couponAPI } from '../../features/coupons/couponAPI';
import { userAPI } from '../../features/users/userAPI';


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
const [users, setUsers] = useState([]);
const [allUsers, setAllUsers] = useState([]);
const [loadingUsers, setLoadingUsers] = useState(false);



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

 const handleSortByMaxDiscount = () => {
   if (sortField === 'maxDiscount') {
     setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
   } else {
     setSortField('maxDiscount');
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
   } else if (sortField === 'maxDiscount') {
     if (a.maxDiscount == null) return 1;
     if (b.maxDiscount == null) return -1;
     if (sortOrder === 'asc') {
       return a.maxDiscount - b.maxDiscount;
     } else {
       return b.maxDiscount - a.maxDiscount;
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
   setFormData(prev => {
     let newForm = {
       ...prev,
       [name]: type === 'checkbox' ? checked : value
     };
     // Nếu đổi type thì reset trường không liên quan
     if (name === 'type') {
       if (value === 'PERCENT') {
         newForm.value = '';
       } else if (value === 'FIXED') {
         newForm.maxDiscount = '';
       }
     }
     // Nếu đổi audience thì reset userIds
     if (name === 'audience' && value !== 'SPECIFIC_USERS') {
       newForm.userIds = [];
     }
     return newForm;
   });
 };

 // Khi audience là SPECIFIC_USERS, lấy toàn bộ user về 1 lần
 useEffect(() => {
   if (formData.audience === 'SPECIFIC_USERS') {
     setLoadingUsers(true);
     userAPI.getAll().then(data => {
       setAllUsers(data);
       setUsers(data);
     }).finally(() => setLoadingUsers(false));
   }
 }, [formData.audience]);

 // Sửa lại handleUserSearch: chỉ filter trên allUsers
 const handleUserSearch = (searchText) => {
   if (!searchText) {
     setUsers(allUsers);
     return;
   }
   const filtered = allUsers.filter(user =>
     (user.fullName && user.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
     (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()))
   );
   setUsers(filtered);
 };

 const handleUserSelect = (selectedUserIds) => {
   setFormData(prev => ({
     ...prev,
     userIds: selectedUserIds
   }));
 };


 const handleSubmit = (e) => {
   e.preventDefault();
   let dataToSend = {
     ...formData,
     value: formData.value !== '' ? Number(formData.value) : null,
     maxDiscount: formData.maxDiscount !== '' ? Number(formData.maxDiscount) : null,
     minOrderValue: formData.minOrderValue !== '' ? Number(formData.minOrderValue) : null,
     totalUsageLimit: formData.totalUsageLimit !== '' ? Number(formData.totalUsageLimit) : null,
   };

   // Luôn gửi userIds, nếu không phải SPECIFIC_USERS thì là mảng rỗng
   if (dataToSend.audience !== 'SPECIFIC_USERS') {
     dataToSend.userIds = [];
   } else if (!dataToSend.userIds || dataToSend.userIds.length === 0) {
     message.error('Bạn phải chọn ít nhất 1 user khi audience là SPECIFIC_USERS');
     return;
   }

   console.log('Data gửi lên BE:', dataToSend);

   if (showAddModal) {
     dispatch(createCoupon(dataToSend)).then((action) => {
       if (action.error && action.error.message) {
         const err = action.error;
         if (err && err.response && err.response.data) {
           console.error('API error detail:', err.response.data);
           message.error(err.response.data.title || JSON.stringify(err.response.data));
         } else {
           message.error(err.message);
         }
       }
     });
   } else if (showEditModal && selectedCoupon) {
     dispatch(updateCoupon({ id: selectedCoupon.id, couponData: dataToSend })).then((action) => {
       if (action.error && action.error.message) {
         const err = action.error;
         if (err && err.response && err.response.data) {
           console.error('API error detail:', err.response.data);
           message.error(err.response.data.title || JSON.stringify(err.response.data));
         } else {
           message.error(err.message);
         }
       }
     });
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
           <Button type="default" onClick={() => setShowRestoreModal(true)}>Restore</Button>
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
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByMaxDiscount}>
                   MAX DISCOUNT
                   {sortField === 'maxDiscount' && (
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
                   <td>{coupon.maxDiscount}</td>
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
       title="Add Coupon"
       width={800}
     >
       <Form layout="vertical" onSubmit={handleSubmit}>
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Code" required>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Enter coupon code"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Type">
               <Select
                 name="type"
                 value={formData.type}
                 onChange={(value) => handleChange({ target: { name: 'type', value } })}
               >
                 <Select.Option value="PERCENT">PERCENT</Select.Option>
                 <Select.Option value="FIXED">FIXED</Select.Option>
               </Select>
             </Form.Item>
           </Col>
         </Row>

         <Form.Item label="Description">
           <Input.TextArea
             name="description"
             value={formData.description}
             onChange={handleChange}
             rows={3}
             placeholder="Enter description"
           />
         </Form.Item>

         <Row gutter={16}>
           {formData.type === 'PERCENT' && (
             <>
               <Col span={12}>
                 <Form.Item label="Value (%)" required>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     min={1}
                     max={100}
                     style={{ width: '100%' }}
                     placeholder="Enter percentage"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Max Discount (VND)" required>
                   <InputNumber
                     name="maxDiscount"
                     value={formData.maxDiscount}
                     onChange={(value) => handleChange({ target: { name: 'maxDiscount', value: value?.toString() || '' } })}
                     min={1}
                     style={{ width: '100%' }}
                     placeholder="Enter max discount"
                   />
                 </Form.Item>
               </Col>
             </>
           )}
           {formData.type === 'FIXED' && (
             <Col span={12}>
               <Form.Item label="Value (VND)" required>
                 <InputNumber
                   name="value"
                   value={formData.value}
                   onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                   min={1}
                   style={{ width: '100%' }}
                   placeholder="Enter fixed amount"
                 />
               </Form.Item>
             </Col>
           )}
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Min Order Value">
               <InputNumber
                 name="minOrderValue"
                 value={formData.minOrderValue}
                 onChange={(value) => handleChange({ target: { name: 'minOrderValue', value: value?.toString() || '' } })}
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="Enter min order value"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Total Usage Limit">
               <InputNumber
                 name="totalUsageLimit"
                 value={formData.totalUsageLimit}
                 onChange={(value) => handleChange({ target: { name: 'totalUsageLimit', value: value?.toString() || '' } })}
                 min={1}
                 style={{ width: '100%' }}
                 placeholder="Enter usage limit"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Start Date">
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select start date"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="End Date">
               <DatePicker
                 value={formData.endDate ? dayjs(formData.endDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'endDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select end date"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Audience">
               <Select
                 name="audience"
                 value={formData.audience}
                 onChange={(value) => handleChange({ target: { name: 'audience', value } })}
               >
                 <Select.Option value="ALL">Tất cả người dùng (ALL)</Select.Option>
                 <Select.Option value="NEW_USER">Chỉ user chưa có booking nào (NEW_USER)</Select.Option>
                 <Select.Option value="EXISTING_USER">Chỉ user đang hoạt động (EXISTING_USER)</Select.Option>
                 <Select.Option value="SPECIFIC_USERS">Chỉ user được chọn (SPECIFIC_USERS)</Select.Option>
               </Select>
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Status">
               <Switch
                 name="isActive"
                 checked={formData.isActive}
                 onChange={(checked) => handleChange({ target: { name: 'isActive', type: 'checkbox', checked } })}
                 checkedChildren="Active"
                 unCheckedChildren="Inactive"
               />
             </Form.Item>
           </Col>
         </Row>

         {formData.audience === 'SPECIFIC_USERS' && (
           <Form.Item label="Select Users">
             <Select
               mode="multiple"
               placeholder="Search and select users"
               value={formData.userIds}
               onChange={handleUserSelect}
               onSearch={handleUserSearch}
               loading={loadingUsers}
               filterOption={false}
               showSearch
               style={{ width: '100%' }}
             >
               {users.map(user => (
                 <Select.Option key={user.id} value={user.id}>
                   {user.fullName} ({user.email})
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>
         )}

         <div className="d-flex justify-content-end">
           <Button onClick={() => setShowAddModal(false)} style={{ marginRight: 8 }}>
             Cancel
           </Button>
           <Button type="primary" onClick={handleSubmit}>
             Save
           </Button>
         </div>
       </Form>
     </Modal>

     {/* Edit Modal */}
     <Modal
       open={showEditModal}
       onCancel={() => setShowEditModal(false)}
       footer={null}
       title="Update Coupon"
       width={800}
     >
       <Form layout="vertical" onSubmit={handleSubmit}>
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Code" required>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Enter coupon code"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Type">
               <Select
                 name="type"
                 value={formData.type}
                 onChange={(value) => handleChange({ target: { name: 'type', value } })}
               >
                 <Select.Option value="PERCENT">PERCENT</Select.Option>
                 <Select.Option value="FIXED">FIXED</Select.Option>
               </Select>
             </Form.Item>
           </Col>
         </Row>

         <Form.Item label="Description">
           <Input.TextArea
             name="description"
             value={formData.description}
             onChange={handleChange}
             rows={3}
             placeholder="Enter description"
           />
         </Form.Item>

         <Row gutter={16}>
           {formData.type === 'PERCENT' && (
             <>
               <Col span={12}>
                 <Form.Item label="Value (%)" required>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     min={1}
                     max={100}
                     style={{ width: '100%' }}
                     placeholder="Enter percentage"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Max Discount (VND)" required>
                   <InputNumber
                     name="maxDiscount"
                     value={formData.maxDiscount}
                     onChange={(value) => handleChange({ target: { name: 'maxDiscount', value: value?.toString() || '' } })}
                     min={1}
                     style={{ width: '100%' }}
                     placeholder="Enter max discount"
                   />
                 </Form.Item>
               </Col>
             </>
           )}
           {formData.type === 'FIXED' && (
             <Col span={12}>
               <Form.Item label="Value (VND)" required>
                 <InputNumber
                   name="value"
                   value={formData.value}
                   onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                   min={1}
                   style={{ width: '100%' }}
                   placeholder="Enter fixed amount"
                 />
               </Form.Item>
             </Col>
           )}
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Min Order Value">
               <InputNumber
                 name="minOrderValue"
                 value={formData.minOrderValue}
                 onChange={(value) => handleChange({ target: { name: 'minOrderValue', value: value?.toString() || '' } })}
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="Enter min order value"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Total Usage Limit">
               <InputNumber
                 name="totalUsageLimit"
                 value={formData.totalUsageLimit}
                 onChange={(value) => handleChange({ target: { name: 'totalUsageLimit', value: value?.toString() || '' } })}
                 min={1}
                 style={{ width: '100%' }}
                 placeholder="Enter usage limit"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Start Date">
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select start date"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="End Date">
               <DatePicker
                 value={formData.endDate ? dayjs(formData.endDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'endDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select end date"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Audience">
               <Select
                 name="audience"
                 value={formData.audience}
                 onChange={(value) => handleChange({ target: { name: 'audience', value } })}
               >
                 <Select.Option value="ALL">Tất cả người dùng (ALL)</Select.Option>
                 <Select.Option value="NEW_USER">Chỉ user chưa có booking nào (NEW_USER)</Select.Option>
                 <Select.Option value="EXISTING_USER">Chỉ user đang hoạt động (EXISTING_USER)</Select.Option>
                 <Select.Option value="SPECIFIC_USERS">Chỉ user được chọn (SPECIFIC_USERS)</Select.Option>
               </Select>
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Status">
               <Switch
                 name="isActive"
                 checked={formData.isActive}
                 onChange={(checked) => handleChange({ target: { name: 'isActive', type: 'checkbox', checked } })}
                 checkedChildren="Active"
                 unCheckedChildren="Inactive"
               />
             </Form.Item>
           </Col>
         </Row>

         {formData.audience === 'SPECIFIC_USERS' && (
           <Form.Item label="Select Users">
             <Select
               mode="multiple"
               placeholder="Search and select users"
               value={formData.userIds}
               onChange={handleUserSelect}
               onSearch={handleUserSearch}
               loading={loadingUsers}
               filterOption={false}
               showSearch
               style={{ width: '100%' }}
             >
               {users.map(user => (
                 <Select.Option key={user.id} value={user.id}>
                   {user.fullName} ({user.email})
                 </Select.Option>
               ))}
             </Select>
           </Form.Item>
         )}

         <div className="d-flex justify-content-end">
           <Button onClick={() => setShowEditModal(false)} style={{ marginRight: 8 }}>
             Cancel
           </Button>
           <Button type="primary" onClick={handleSubmit}>
             Save
           </Button>
         </div>
       </Form>
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

