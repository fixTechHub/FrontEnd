import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, DatePicker, TimePicker, InputNumber, Switch, Table } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
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
import "../../../public/css/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';


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
const [showUserFilterModal, setShowUserFilterModal] = useState(false);
const [userFilterCriteria, setUserFilterCriteria] = useState({
    isNewUser: null,
    isIntermissionUser: null,
    minTotalBookingValue: null,
    maxTotalBookingValue: null,
    bookingTimeFrom: null,
    bookingTimeTo: null,
    minBookingCountInMonth: null,
    maxBookingCountInMonth: null,
    rank: null,
});
const [filteredUsers, setFilteredUsers] = useState([]);
const [loadingFilteredUsers, setLoadingFilteredUsers] = useState(false);
const [selectedFilteredUserIds, setSelectedFilteredUserIds] = useState([]);
 
const [validationErrors, setValidationErrors] = useState({});
const [activeKey, setActiveKey] = useState('active');


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
   if (success) {
     setValidationErrors({});
     message.success('Thao tác thành công!');
     setShowAddModal(false);
     setShowEditModal(false);
     setShowDeleteModal(false);
     dispatch(resetState());
     dispatch(fetchCoupons());
   }
   if (error) {
     message.error(error.title || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
     dispatch(resetState());
     // KHÔNG reset validationErrors ở đây!
   }
 }, [error, success, dispatch]);






 const handleAddCoupon = () => {
   setFormData(initialFormState);
   setValidationErrors({});
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
   setValidationErrors({});
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
    setFilteredUsers(allUsers);
    return;
  }
  setFilteredUsers(
    allUsers.filter(
      u =>
        (u.fullName && u.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchText.toLowerCase()))
    )
  );
};
useEffect(() => {
  if (showUserFilterModal && allUsers.length === 0) {
    setLoadingUsers(true);
    userAPI.getAll().then(data => {
      setAllUsers(data);
      setFilteredUsers(data);
    }).finally(() => setLoadingUsers(false));
  } else if (showUserFilterModal) {
    setFilteredUsers(allUsers);
  }
}, [showUserFilterModal]);

 const handleUserSelect = (selectedUserIds) => {
   setFormData(prev => ({
     ...prev,
     userIds: selectedUserIds
   }));
 };

 const handleOpenUserFilterModal = () => {
    setShowUserFilterModal(true);
    setFilteredUsers([]);
    // Đặt selectedFilteredUserIds = formData.userIds để giữ trạng thái đã chọn
    setSelectedFilteredUserIds(formData.userIds || []);
    const defaultCriteria = {
        isNewUser: null,
        isIntermissionUser: null,
        minTotalBookingValue: null,
        rank: null,
    };
    setUserFilterCriteria(defaultCriteria);
    handleApplyUserFilter(defaultCriteria);
};

const handleUserFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFilterCriteria(prev => {
        const newCriteria = {
            ...prev,
            [name]: type === 'checkbox' ? (checked ? true : null) : (value || null)
        };
        handleApplyUserFilter(newCriteria); // Gọi API ngay khi thay đổi filter
        return newCriteria;
    });
};

const handleApplyUserFilter = async (criteria = userFilterCriteria) => {
    setLoadingFilteredUsers(true);
    try {
        const criteriaToSend = Object.entries(criteria).reduce((acc, [key, value]) => {
            if (value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {});
        let result = await userAPI.filter(criteriaToSend);

        // Nếu có filter bookingTimeFrom/To, filter lại ở FE theo giờ VN
        // if (criteria.bookingTimeFrom || criteria.bookingTimeTo) {
        //     result = result.filter(user => {
        //         // Giả sử user.bookings là mảng các booking của user
        //         if (!user.bookings || user.bookings.length === 0) return false;
        //         // Kiểm tra có ít nhất 1 booking thỏa mãn giờ
        //         return user.bookings.some(b => {
        //             if (!b.schedule || !b.schedule.startTime) return false;
        //             const bookingTimeVN = dayjs(b.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss');
        //             const from = criteria.bookingTimeFrom;
        //             const to = criteria.bookingTimeTo;
        //             if (from && to) {
        //                 return bookingTimeVN >= from && bookingTimeVN <= to;
        //             } else if (from) {
        //                 return bookingTimeVN >= from;
        //             } else if (to) {
        //                 return bookingTimeVN <= to;
        //             }
        //             return true;
        //         });
        //     });
        // }

        setFilteredUsers(result);
    } catch (error) {
        message.error("Lỗi khi lọc người dùng!");
    } finally {
        setLoadingFilteredUsers(false);
    }
};

const handleConfirmUserSelection = () => {
    const currentSelected = new Set(formData.userIds);
    selectedFilteredUserIds.forEach(id => currentSelected.add(id));
    setFormData(prev => ({ ...prev, userIds: Array.from(currentSelected) }));

    // Cập nhật lại danh sách users để hiển thị trong Select chính
    const updatedUsers = [...allUsers];
    filteredUsers.forEach(filteredUser => {
        if (!updatedUsers.some(u => u.id === filteredUser.id)) {
            updatedUsers.push(filteredUser);
        }
    });
    setUsers(updatedUsers);
    setAllUsers(updatedUsers);

    setShowUserFilterModal(false);
};


 const handleSubmit = (e) => {
   e.preventDefault();
   setValidationErrors({});
   let dataToSend = {
     ...formData,
     code: formData.code || '',
     description: formData.description || '',
     type: formData.type || 'PERCENT',
     value: formData.value !== '' ? Number(formData.value) : 0,
     maxDiscount: formData.maxDiscount !== '' ? Number(formData.maxDiscount) : 0,
     minOrderValue: formData.minOrderValue !== '' ? Number(formData.minOrderValue) : 0,
     totalUsageLimit: formData.totalUsageLimit !== '' ? Number(formData.totalUsageLimit) : 0,
     startDate: formData.startDate || '',
     endDate: formData.endDate || '',
     audience: formData.audience || 'ALL',
     userIds: formData.userIds || [],
     isActive: typeof formData.isActive === 'boolean' ? formData.isActive : true,
   };

   // Luôn gửi userIds, nếu không phải SPECIFIC_USERS thì là mảng rỗng
   if (dataToSend.audience !== 'SPECIFIC_USERS') {
     dataToSend.userIds = [];
   } else if (!dataToSend.userIds || dataToSend.userIds.length === 0) {
     setValidationErrors({ UserIds: ['Bạn phải chọn ít nhất 1 user khi audience là SPECIFIC_USERS'] });
     message.error('Bạn phải chọn ít nhất 1 user khi audience là SPECIFIC_USERS');
     return;
   }

   const fieldNames = [
     'Code', 'Description', 'Type', 'Value', 'MaxDiscount', 'MinOrderValue',
     'TotalUsageLimit', 'Audience', 'UserIds', 'IsActive', 'StartDate', 'EndDate'
   ];

   const mapErrorKey = (key) => {
     const lower = key.toLowerCase();
     if (lower.includes('code')) return 'Code';
     if (lower.includes('description')) return 'Description';
     if (lower.includes('type')) return 'Type';
     if (lower.includes('value')) return 'Value';
     if (lower.includes('maxdiscount')) return 'MaxDiscount';
     if (lower.includes('minordervalue')) return 'MinOrderValue';
     if (lower.includes('totalusagelimit')) return 'TotalUsageLimit';
     if (lower.includes('audience')) return 'Audience';
     if (lower.includes('userids') || lower.includes('userid')) return 'UserIds';
     if (lower.includes('isactive')) return 'IsActive';
     if (lower.includes('startdate')) return 'StartDate';
     if (lower.includes('enddate')) return 'EndDate';
     return key;
   };
   const processErrors = (apiErrors) => {
     const newErrors = {};
     const generalErrors = [];
     Object.entries(apiErrors).forEach(([key, msgs]) => {
       const mappedKey = mapErrorKey(key);
       // Nếu là lỗi kỹ thuật, chỉ đẩy vào general
       const isTechError = msgs.some(msg =>
         msg.includes('could not be converted') || msg.includes('System.DateTime')
       );
       if (isTechError) {
         generalErrors.push('Nhập vào các trường * bắt buộc');
       } else if ([
         'Code', 'Description', 'Type', 'Value', 'MaxDiscount', 'MinOrderValue',
         'TotalUsageLimit', 'Audience', 'UserIds', 'IsActive', 'StartDate', 'EndDate'
       ].includes(mappedKey)) {
         newErrors[mappedKey] = msgs;
       } else {
         generalErrors.push(...msgs);
       }
     });
     if (generalErrors.length > 0) {
       newErrors.general = generalErrors.join(', ');
     }
     return newErrors;
   };

   if (showAddModal) {
     dispatch(createCoupon(dataToSend)).then((action) => {
       console.log('ACTION RETURNED:', action);
       // Ưu tiên lấy lỗi từ action.payload nếu có
       if (action.payload && action.payload.errors) {
         const apiErrors = action.payload.errors;
         console.log('apiErrors:', apiErrors);
         const processed = processErrors(apiErrors);
         console.log('processed validationErrors:', processed);
         setValidationErrors(processed);
       } else if (action.error && action.error.message) {
         // fallback cho các lỗi khác
         const err = action.error;
         console.log('ERROR OBJECT:', err);
         message.error(err.message);
       }
     });
   } else if (showEditModal && selectedCoupon) {
     dispatch(updateCoupon({ id: selectedCoupon.id, couponData: dataToSend })).then((action) => {
       console.log('ACTION RETURNED:', action);
       // Ưu tiên lấy lỗi từ action.payload nếu có
       if (action.payload && action.payload.errors) {
         const apiErrors = action.payload.errors;
         // Xử lý lỗi kỹ thuật giống như create
         const processed = processErrors(apiErrors);
         console.log('processed validationErrors:', processed);
         setValidationErrors(processed);
       } else if (action.error && action.error.message) {
         // fallback cho các lỗi khác
         const err = action.error;
         console.log('ERROR OBJECT:', err);
         message.error(err.message);
       }
     });
   }
 };


 console.log('coupons:', coupons);
 console.log('deletedCoupons:', deletedCoupons);
 console.log('validationErrors:', validationErrors);


 // Trước khi render modal
 console.log('validationErrors trước khi render:', validationErrors);


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
                   <td style={{
                      maxWidth: 260,
                      minWidth: 120,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                      title={coupon.description}
                    >
                      {coupon.description}
                    </td>
                   <td>{coupon.type}</td>
                   <td>{coupon.value}</td>
                   <td>{coupon.maxDiscount}</td>
                   <td>
                     <span className={`badge ${coupon.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                       {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                     </span>
                   </td>
                   <td>
                     <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditCoupon(coupon)} style={{ marginRight: 8 }}>
                        Edit
                      </Button>
                     <Button className="management-action-btn" size="middle" danger onClick={() => { setSelectedCoupon(coupon); setShowDeleteModal(true); }} style={{ marginRight: 8 }}>
                       Delete
                     </Button>
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
         {validationErrors.general && (
           <div style={{ color: 'red', marginBottom: 8 }}>
             {validationErrors.general.includes('The dto field is required') ||
              validationErrors.general.includes('could not be converted') ||
              validationErrors.general.includes('System.DateTime')
               ? 'Nhập vào các trường * bắt buộc'
               : validationErrors.general}
           </div>
         )}
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Code" required validateStatus={validationErrors.Code ? 'error' : ''} help={validationErrors.Code ? validationErrors.Code.join(', ') : ''}>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Enter coupon code"
                 required
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Type" required validateStatus={validationErrors.Type ? 'error' : ''} help={validationErrors.Type ? validationErrors.Type.join(', ') : ''}>
               <Select
                 placeholder="Type"
                 name="type"
                 value={formData.type}
                 onChange={(value) => handleChange({ target: { name: 'type', value } })}
                 required
               >
                 <Select.Option value="PERCENT">PERCENT</Select.Option>
                 <Select.Option value="FIXED">FIXED</Select.Option>
               </Select>
             </Form.Item>
           </Col>
         </Row>

         <Form.Item label="Description" required validateStatus={validationErrors.Description ? 'error' : ''} help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}>
           <Input.TextArea
             name="description"
             value={formData.description}
             onChange={handleChange}
             rows={3}
             placeholder="Enter description"
             required
           />
         </Form.Item>

         <Row gutter={16}>
           {formData.type === 'PERCENT' && (
             <>
               <Col span={12}>
                 <Form.Item label="Value (%)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     style={{ width: '100%' }}
                     placeholder="Enter percentage"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Max Discount (VND)" required validateStatus={validationErrors.MaxDiscount ? 'error' : ''} help={validationErrors.MaxDiscount ? validationErrors.MaxDiscount.join(', ') : ''}>
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
               <Form.Item label="Value (VND)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
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
             <Form.Item label="Min Order Value" required validateStatus={validationErrors.MinOrderValue ? 'error' : ''} help={validationErrors.MinOrderValue ? validationErrors.MinOrderValue.join(', ') : ''}>
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
             <Form.Item label="Start Date" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select start date"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="End Date" required validateStatus={validationErrors.EndDate ? 'error' : ''} help={validationErrors.EndDate ? validationErrors.EndDate.join(', ') : ''}>
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
             <Form.Item label="Audience" validateStatus={validationErrors.Audience ? 'error' : ''} help={validationErrors.Audience ? validationErrors.Audience.join(', ') : ''}>
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
            <Form.Item label={<span>Select Users <Button icon={<FilterOutlined />} size="small" style={{ marginLeft: 8 }} onClick={handleOpenUserFilterModal}>Filter Users</Button></span>} required validateStatus={validationErrors.UserIds ? 'error' : ''} help={validationErrors.UserIds ? validationErrors.UserIds.join(', ') : ''}>
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
                    maxTagCount={2}
                    maxTagPlaceholder={omittedValues => `${omittedValues.length + 2} users selected`}
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
         {validationErrors.general && (
           <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
         )}
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Code" required validateStatus={validationErrors.Code ? 'error' : ''} help={validationErrors.Code ? validationErrors.Code.join(', ') : ''}>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Enter coupon code"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Type" required validateStatus={validationErrors.Type ? 'error' : ''} help={validationErrors.Type ? validationErrors.Type.join(', ') : ''}>
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

         <Form.Item label="Description" required validateStatus={validationErrors.Description ? 'error' : ''} help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}>
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
                 <Form.Item label="Value (%)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     style={{ width: '100%' }}
                     placeholder="Enter percentage"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Max Discount (VND)" required validateStatus={validationErrors.MaxDiscount ? 'error' : ''} help={validationErrors.MaxDiscount ? validationErrors.MaxDiscount.join(', ') : ''}>
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
               <Form.Item label="Value (VND)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
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
             <Form.Item label="Min Order Value" required validateStatus={validationErrors.MinOrderValue ? 'error' : ''} help={validationErrors.MinOrderValue ? validationErrors.MinOrderValue.join(', ') : ''}>
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
             <Form.Item label="Start Date" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Select start date"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="End Date" required validateStatus={validationErrors.EndDate ? 'error' : ''} help={validationErrors.EndDate ? validationErrors.EndDate.join(', ') : ''}>
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
             <Form.Item label="Audience" validateStatus={validationErrors.Audience ? 'error' : ''} help={validationErrors.Audience ? validationErrors.Audience.join(', ') : ''}>
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
            <Form.Item label={<span>Select Users <Button icon={<FilterOutlined />} size="small" style={{ marginLeft: 8 }} onClick={handleOpenUserFilterModal}>Filter Users</Button></span>} required validateStatus={validationErrors.UserIds ? 'error' : ''} help={validationErrors.UserIds ? validationErrors.UserIds.join(', ') : ''}>
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
                    maxTagCount={2}
                    maxTagPlaceholder={omittedValues => `${omittedValues.length + 2} users selected`}
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

     {/* User Filter Modal - moved to bottom and set zIndex */}
     <Modal
    open={showUserFilterModal}
    onCancel={() => setShowUserFilterModal(false)}
    title="Filter Users"
    width={900}
    zIndex={2000}
    footer={[
        <Button key="back" onClick={() => setShowUserFilterModal(false)}>
            Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loadingFilteredUsers} onClick={handleConfirmUserSelection}>
            Confirm Selection
        </Button>,
    ]}
>
    <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
            <Col span={8}>
                <label style={{ fontWeight: 500 }}>Tìm kiếm tên hoặc email</label>
                <Input.Search
                    placeholder="Nhập tên hoặc email"
                    onSearch={handleUserSearch}
                    onChange={e => handleUserSearch(e.target.value)}
                    allowClear
                />
            </Col>
            <Col span={4}>
                <label style={{ fontWeight: 500 }}>New User</label>
                <Switch
                    checked={userFilterCriteria.isNewUser}
                    onChange={checked => handleUserFilterChange({ target: { name: 'isNewUser', type: 'checkbox', checked } })}
                />
            </Col>
            <Col span={4}>
                <label style={{ fontWeight: 500 }}>Intermission User</label>
                <Switch
                    checked={userFilterCriteria.isIntermissionUser}
                    onChange={checked => handleUserFilterChange({ target: { name: 'isIntermissionUser', type: 'checkbox', checked } })}
                />
            </Col>
            <Col span={4}>
                <label style={{ fontWeight: 500 }}>Rank</label>
                <Select
                    placeholder="Chọn rank"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.rank}
                    onChange={value => handleUserFilterChange({ target: { name: 'rank', value } })}
                    allowClear
                >
                    <Select.Option value="Silver">Silver</Select.Option>
                    <Select.Option value="Gold">Gold</Select.Option>
                    <Select.Option value="Diamond">Diamond</Select.Option>
                    <Select.Option value="VIP">VIP</Select.Option>
                </Select>
            </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Min Total Booking Value</label>
                <InputNumber
                    placeholder="Tối thiểu"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.minTotalBookingValue}
                    onChange={value => handleUserFilterChange({ target: { name: 'minTotalBookingValue', value } })}
                />
            </Col>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Max Total Booking Value</label>
                <InputNumber
                    placeholder="Tối đa"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.maxTotalBookingValue}
                    onChange={value => handleUserFilterChange({ target: { name: 'maxTotalBookingValue', value } })}
                />
            </Col>
            {/* <Col span={6}>
                <label style={{ fontWeight: 500 }}>Booking Time From</label>
                <TimePicker
                    style={{ width: '100%' }}
                    value={
                        userFilterCriteria.bookingTimeFrom
                            ? dayjs.tz(userFilterCriteria.bookingTimeFrom, 'HH:mm:ss', 'Asia/Ho_Chi_Minh')
                            : null
                    }
                    onChange={time =>
                        handleUserFilterChange({
                            target: {
                                name: 'bookingTimeFrom',
                                value: time ? time.tz('Asia/Ho_Chi_Minh').format('HH:mm:ss') : null
                            }
                        })
                    }
                    format="HH:mm:ss"
                    placeholder="Chọn giờ bắt đầu"
                    allowClear
                />
            </Col>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Booking Time To</label>
                <TimePicker
                    style={{ width: '100%' }}
                    value={
                        userFilterCriteria.bookingTimeTo
                            ? dayjs.tz(userFilterCriteria.bookingTimeTo, 'HH:mm:ss', 'Asia/Ho_Chi_Minh')
                            : null
                    }
                    onChange={time =>
                        handleUserFilterChange({
                            target: {
                                name: 'bookingTimeTo',
                                value: time ? time.tz('Asia/Ho_Chi_Minh').format('HH:mm:ss') : null
                            }
                        })
                    }
                    format="HH:mm:ss"
                    placeholder="Chọn giờ kết thúc"
                    allowClear
                />
            </Col> */}
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Min Booking Count (month)</label>
                <InputNumber
                    placeholder="Tối thiểu"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.minBookingCountInMonth}
                    onChange={value => handleUserFilterChange({ target: { name: 'minBookingCountInMonth', value } })}
                />
            </Col>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Max Booking Count (month)</label>
                <InputNumber
                    placeholder="Tối đa"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.maxBookingCountInMonth}
                    onChange={value => handleUserFilterChange({ target: { name: 'maxBookingCountInMonth', value } })}
                />
            </Col>
        </Row>
    </div>
    <Table
        rowKey="id"
        columns={[
            { title: 'Họ tên', dataIndex: 'fullName' },
            { title: 'Email', dataIndex: 'email' },
        ]}
        dataSource={filteredUsers}
        rowSelection={{
            selectedRowKeys: selectedFilteredUserIds,
            onChange: setSelectedFilteredUserIds,
            selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        pagination={{ pageSize: 8 }}
        size="middle"
    />
    <div style={{ marginTop: 8 }}>
        <b>Đã chọn:</b> {selectedFilteredUserIds.length} user
    </div>
</Modal>
   </div>
 );
};


export default CouponManagement;
  
