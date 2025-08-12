import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Spin, Select, Row, Col, Form, Input, Switch, DatePicker, InputNumber, Table } from 'antd';
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
 restoreCoupon,
} from '../../features/coupons/couponSlice';  
import { couponAPI } from '../../features/coupons/couponAPI';
import { userAPI } from '../../features/users/userAPI';
import "../../../public/css/ManagementTableStyle.css";
import { EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons';
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';


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
 userIds: [],
 fontFamily: 'Arial',
 fontSize: '14',
 textAlign: 'left',
 images: []
};



const CouponManagement = () => {
const dispatch = useDispatch();
const couponState = useSelector((state) => state.coupon) || {};
const { coupons = [], loading = false, error = null, success = false, deletedCoupons = [] } = couponState;


const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showRestoreModal, setShowRestoreModal] = useState(false);
const [showDetailModal, setShowDetailModal] = useState(false);
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

// Set export data và columns
useEffect(() => {
  const exportColumns = [
    { title: 'Mã', dataIndex: 'code' },
    { title: 'Mô tả', dataIndex: 'description' },
    { title: 'Loại', dataIndex: 'type' },
    { title: 'Giá trị', dataIndex: 'value' },
    { title: 'Giảm tối đa', dataIndex: 'maxDiscount' },
    { title: 'Giá trị đơn hàng tối thiểu', dataIndex: 'minOrderValue' },
    { title: 'Số lượng mã giảm giá', dataIndex: 'totalUsageLimit' },
    { title: 'Số lượng mã đã sử dụng', dataIndex: 'usedCount' },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
    { title: 'Ngày kết thúc', dataIndex: 'endDate' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Loại người dùng', dataIndex: 'audience' },
    { title: 'Thời gian tạo', dataIndex: 'createdAt' },
  ];

  const exportData = sortedCoupons.map(coupon => ({
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: coupon.type === 'PERCENT' ? `${coupon.value}%` : formatCurrency(coupon.value),
    maxDiscount: formatCurrency(coupon.maxDiscount),
    minOrderValue: formatCurrency(coupon.minOrderValue),
    totalUsageLimit: coupon.totalUsageLimit,
    usedCount: coupon.usedCount || 0,
    startDate: formatDateTime(coupon.startDate),
    endDate: formatDateTime(coupon.endDate),
    status: coupon.isActive ? 'ACTIVE' : 'INACTIVE',
    audience: coupon.audience,
    createdAt: formatDateTime(coupon.createdAt),
    updatedAt: formatDateTime(coupon.updatedAt),
  }));

  createExportData(exportData, exportColumns, 'coupons_export', 'Coupons');
}, [sortedCoupons]);

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
     userIds: coupon.userIds || [],
     fontFamily: coupon.fontFamily || 'Arial',
     fontSize: coupon.fontSize || '14',
     textAlign: coupon.textAlign || 'left',
     images: coupon.images || []
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
     // Use DELETE endpoint which now properly handles soft delete
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

 const handleViewDetail = async (coupon) => {
   try {
     // Lấy thông tin chi tiết coupon từ API
     const detailedCoupon = await couponAPI.getById(coupon.id);
     setSelectedCoupon(detailedCoupon);
     setShowDetailModal(true);
   } catch (error) {
     console.error('Lỗi khi lấy thông tin chi tiết coupon:', error);
     message.error('Không thể lấy thông tin chi tiết coupon');
     // Fallback: sử dụng thông tin cơ bản
     setSelectedCoupon(coupon);
     setShowDetailModal(true);
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

 const handleFontChange = (property, value) => {
  setFormData(prev => ({
    ...prev,
    [property]: value
  }));
};

const handleImageUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));
        // Thêm image tag vào description
        const imageTag = `\n[IMAGE:${imageUrl}]\n`;
        setFormData(prev => ({
          ...prev,
          description: prev.description + imageTag
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
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
   
   // Validation cho code không quá 30 ký tự
   if (formData.code && formData.code.length > 30) {
     setValidationErrors({ Code: ['Mã không được dài quá 30 ký tự'] });
     message.error('Mã không được dài quá 30 ký tự');
     return;
   }
   
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
     setValidationErrors({ UserIds: ['Bạn phải chọn ít nhất 1 user khi loại người dùng là SPECIFIC USERS'] });
     message.error('Bạn phải chọn ít nhất 1 user khi loại người dùng là SPECIFIC USERS');
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
       // Ưu tiên lấy lỗi từ action.payload nếu có
       if (action.payload && action.payload.errors) {
         const apiErrors = action.payload.errors;
         const processed = processErrors(apiErrors);
         setValidationErrors(processed);
       } else if (action.error && action.error.message) {
         // fallback cho các lỗi khác
         const err = action.error;
         message.error(err.message);
       }
     });
   } else if (showEditModal && selectedCoupon) {
     dispatch(updateCoupon({ id: selectedCoupon.id, couponData: dataToSend })).then((action) => {
       // Ưu tiên lấy lỗi từ action.payload nếu có
       if (action.payload && action.payload.errors) {
         const apiErrors = action.payload.errors;
         // Xử lý lỗi kỹ thuật giống như create
         const processed = processErrors(apiErrors);
         setValidationErrors(processed);
       } else if (action.error && action.error.message) {
         // fallback cho các lỗi khác
         const err = action.error;
         message.error(err.message);
       }
     });
   }
 };

 const renderFormattedDescription = (description) => {
  if (!description) return '';
  
  // Xử lý image tags
  let formattedText = description.replace(/\[IMAGE:(.*?)\]/g, (match, imageUrl) => {
    return `<img src="${imageUrl}" style="max-width: 100px; max-height: 60px; margin: 5px;" alt="coupon image" />`;
  });
  
  return formattedText;
};

 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
         <div className="my-auto mb-2">
           <h4 className="mb-1">Quản lý mã giảm giá</h4>
           <nav>
             <ol className="breadcrumb mb-0">
               <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
               <li className="breadcrumb-item active">Mã giảm giá</li>
             </ol>
           </nav>
         </div>
         <div className="d-flex">
           <Button type="primary" onClick={handleAddCoupon} style={{ marginRight: 8 }}>Thêm</Button>
           <Button type="default" onClick={() => setShowRestoreModal(true)}>Khôi phục</Button>
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
                 placeholder="Tìm kiếm mã giảm giá"
                 value={searchText}
                 onChange={e => setSearchText(e.target.value)}
               />
             </div>
           </div>
           <Select
             placeholder="Phân loại"
             value={filterType || undefined}
             onChange={value => setFilterType(value)}
             style={{ width: 130 }}
             allowClear
           >
             <Select.Option value="PERCENT">PERCENT</Select.Option>
             <Select.Option value="FIXED">FIXED</Select.Option>
           </Select>
           <Select
             placeholder="Trạng thái"
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
           <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
           <Select
             value={sortField === 'createdAt' && sortOrder === 'desc' ? 'lasted' : 'oldest'}
             style={{ width: 120 }}
             onChange={handleSortChange}
             options={[
               { value: 'lasted', label: 'Mới nhất' },
               { value: 'oldest', label: 'Cũ nhất' },
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
                    Mã
                   {sortField === 'code' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>Phân loại</th>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByValue}>
                    Giá trị
                   {sortField === 'value' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th style={{ cursor: 'pointer' }} onClick={handleSortByMaxDiscount}>
                   Giảm tối đa
                   {sortField === 'maxDiscount' && (
                     <span style={{ marginLeft: 4 }}>
                       {sortOrder === 'asc' ? '▲' : '▼'}
                     </span>
                   )}
                 </th>
                 <th>Số lần sử dụng</th>
                 <th>Giới hạn sử dụng</th>
                 <th>Trạng thái</th>
                 <th>Hành động</th>
               </tr>
             </thead>
             <tbody>
               {currentCoupons.map((coupon) => (
                 <tr key={coupon.id}>
                   <td>{coupon.code}</td>
                   {/* <td style={{
                      maxWidth: 260,
                      minWidth: 120,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                      title={coupon.description}
                    >
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: renderFormattedDescription(coupon.description) 
                        }}
                        style={{
                          fontFamily: coupon.fontFamily || 'Arial',
                          fontSize: `${coupon.fontSize || 14}px`,
                          textAlign: coupon.textAlign || 'left'
                        }}
                      />
                    </td> */}
                   <td>{coupon.type}</td>
                   <td>{coupon.value}</td>
                   <td>{coupon.maxDiscount}</td>
                   <td>
                     <span className={`badge ${(coupon.usedCount || 0) >= (coupon.totalUsageLimit || 1) ? 'bg-warning-transparent' : 'bg-info-transparent'} text-dark`}>
                       {coupon.usedCount || 0}
                     </span>
                   </td>
                   <td>{coupon.totalUsageLimit || 0}</td>
                   <td>
                     <span className={`badge ${coupon.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                       {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                     </span>
                   </td>
                   <td>
                     {/* <Button className="management-action-btn" type="default" icon={<EyeOutlined />} onClick={() => handleViewDetail(coupon)} style={{ marginRight: 8 }}>
                        Xem chi tiết
                      </Button> */}
                     <Button className="management-action-btn" type="default" icon={<EditOutlined />} onClick={() => handleEditCoupon(coupon)} style={{ marginRight: 8 }}>
                        Chỉnh sửa
                      </Button>
                     <Button className="management-action-btn" size="middle" danger onClick={() => { setSelectedCoupon(coupon); setShowDeleteModal(true); }} style={{ marginRight: 8 }}>
                       Xóa
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
       title="Thêm mã giảm giá"
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
             <Form.Item label="Mã" required validateStatus={validationErrors.Code ? 'error' : ''} help={validationErrors.Code ? validationErrors.Code.join(', ') : ''}>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Nhập mã giảm giá (tối đa 30 ký tự)"
                 required
                 style={{ 
                   borderColor: formData.code.length > 30 ? '#ff4d4f' : '#d9d9d9',
                   backgroundColor: formData.code.length > 30 ? '#fff2f0' : '#fff'
                 }}
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Phân loại" required validateStatus={validationErrors.Type ? 'error' : ''} help={validationErrors.Type ? validationErrors.Type.join(', ') : ''}>
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

         <Form.Item label="Mô tả" required validateStatus={validationErrors.Description ? 'error' : ''} help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}>
           <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '8px' }}>
             <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
               <Select
                 placeholder="Font Family"
                 style={{ width: 120 }}
                 onChange={(value) => handleFontChange('fontFamily', value)}
                 defaultValue="Arial"
               >
                 <Select.Option value="Arial">Arial</Select.Option>
                 <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                 <Select.Option value="Courier New">Courier New</Select.Option>
                 <Select.Option value="Georgia">Georgia</Select.Option>
                 <Select.Option value="Verdana">Verdana</Select.Option>
               </Select>
               <Select
                 placeholder="Font Size"
                 style={{ width: 80 }}
                 onChange={(value) => handleFontChange('fontSize', value)}
                 defaultValue="14"
               >
                 <Select.Option value="12">12px</Select.Option>
                 <Select.Option value="14">14px</Select.Option>
                 <Select.Option value="16">16px</Select.Option>
                 <Select.Option value="18">18px</Select.Option>
                 <Select.Option value="20">20px</Select.Option>
               </Select>
               <Button.Group size="small">
                 <Button 
                   type={formData.textAlign === 'left' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'left')}
                 >
                   <i className="ti ti-align-left"></i>
                 </Button>
                 <Button 
                   type={formData.textAlign === 'center' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'center')}
                 >
                   <i className="ti ti-align-center"></i>
                 </Button>
                 <Button 
                   type={formData.textAlign === 'right' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'right')}
                 >
                   <i className="ti ti-align-right"></i>
                 </Button>
               </Button.Group>
               <Button 
                 size="small"
                 onClick={() => handleImageUpload()}
                 icon={<i className="ti ti-photo"></i>}
               >
                 Thêm ảnh
               </Button>
             </div>
             <Input.TextArea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={4}
               placeholder="Nhập các mô tả cho mã giảm giá..."
               required
               style={{
                 fontFamily: formData.fontFamily || 'Arial',
                 fontSize: `${formData.fontSize || 14}px`,
                 textAlign: formData.textAlign || 'left',
                 border: 'none',
                 resize: 'none'
               }}
             />
           </div>
         </Form.Item>

         <Row gutter={16}>
           {formData.type === 'PERCENT' && (
             <>
               <Col span={12}>
                 <Form.Item label="Giá trị (%)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     style={{ width: '100%' }}
                     placeholder="Nhập phần trăm giảm giá"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Giảm tối đa (VND)" required validateStatus={validationErrors.MaxDiscount ? 'error' : ''} help={validationErrors.MaxDiscount ? validationErrors.MaxDiscount.join(', ') : ''}>
                   <InputNumber
                     name="maxDiscount"
                     value={formData.maxDiscount}
                     onChange={(value) => handleChange({ target: { name: 'maxDiscount', value: value?.toString() || '' } })}
                     min={1}
                     style={{ width: '100%' }}
                     placeholder="Nhập số tiền giảm tối đa"
                   />
                 </Form.Item>
               </Col>
             </>
           )}
           {formData.type === 'FIXED' && (
             <Col span={12}>
               <Form.Item label="Giá trị (VND)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                 <InputNumber
                   name="value"
                   value={formData.value}
                   onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                   min={1}
                   style={{ width: '100%' }}
                   placeholder="Nhập sô tiền giảm"
                 />
               </Form.Item>
             </Col>
           )}
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Giá trị đơn hàng tối thiểu" required validateStatus={validationErrors.MinOrderValue ? 'error' : ''} help={validationErrors.MinOrderValue ? validationErrors.MinOrderValue.join(', ') : ''}>
               <InputNumber
                 name="minOrderValue"
                 value={formData.minOrderValue}
                 onChange={(value) => handleChange({ target: { name: 'minOrderValue', value: value?.toString() || '' } })}
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="Nhập giá trị đơn hàng tối thiểu"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Số lượng mã giảm giá">
               <InputNumber
                 name="totalUsageLimit"
                 value={formData.totalUsageLimit}
                 onChange={(value) => handleChange({ target: { name: 'totalUsageLimit', value: value?.toString() || '' } })}
                 min={1}
                 style={{ width: '100%' }}
                 placeholder="Nhập số lượng mã giảm giá"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Ngày bắt đầu" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Chọn ngày bắt đầu"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Ngày kết thúc" required validateStatus={validationErrors.EndDate ? 'error' : ''} help={validationErrors.EndDate ? validationErrors.EndDate.join(', ') : ''}>
               <DatePicker
                 value={formData.endDate ? dayjs(formData.endDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'endDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Chọn ngày kết thúc"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Loại người dùng" validateStatus={validationErrors.Audience ? 'error' : ''} help={validationErrors.Audience ? validationErrors.Audience.join(', ') : ''}>
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
             <Form.Item label="Trạng thái">
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
            <Form.Item label={<span>Chọn người dùng <Button icon={<FilterOutlined />} size="small" style={{ marginLeft: 8 }} onClick={handleOpenUserFilterModal}>Lọc người dùng</Button></span>} required validateStatus={validationErrors.UserIds ? 'error' : ''} help={validationErrors.UserIds ? validationErrors.UserIds.join(', ') : ''}>
                <Select
                    mode="multiple"
                    placeholder="Tìm kiếm người dùng"
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
             Hủy
           </Button>
           <Button type="primary" onClick={handleSubmit}>
             Thêm
           </Button>
         </div>
       </Form>
     </Modal>

     {/* Edit Modal */}
     <Modal
       open={showEditModal}
       onCancel={() => setShowEditModal(false)}
       footer={null}
       title="Cập nhật mã giảm giá"
       width={800}
     >
       <Form layout="vertical" onSubmit={handleSubmit}>
         {validationErrors.general && (
           <div style={{ color: 'red', marginBottom: 8 }}>{validationErrors.general}</div>
         )}
         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Mã" required validateStatus={validationErrors.Code ? 'error' : ''} help={validationErrors.Code ? validationErrors.Code.join(', ') : ''}>
               <Input
                 name="code"
                 value={formData.code}
                 onChange={handleChange}
                 placeholder="Nhập mã giảm giá (tối đa 30 ký tự)"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Phân loại" required validateStatus={validationErrors.Type ? 'error' : ''} help={validationErrors.Type ? validationErrors.Type.join(', ') : ''}>
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

         <Form.Item label="Mô tả" required validateStatus={validationErrors.Description ? 'error' : ''} help={validationErrors.Description ? validationErrors.Description.join(', ') : ''}>
           <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '8px' }}>
             <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
               <Select
                 placeholder="Font Family"
                 style={{ width: 120 }}
                 onChange={(value) => handleFontChange('fontFamily', value)}
                 defaultValue="Arial"
               >
                 <Select.Option value="Arial">Arial</Select.Option>
                 <Select.Option value="Times New Roman">Times New Roman</Select.Option>
                 <Select.Option value="Courier New">Courier New</Select.Option>
                 <Select.Option value="Georgia">Georgia</Select.Option>
                 <Select.Option value="Verdana">Verdana</Select.Option>
               </Select>
               <Select
                 placeholder="Font Size"
                 style={{ width: 80 }}
                 onChange={(value) => handleFontChange('fontSize', value)}
                 defaultValue="14"
               >
                 <Select.Option value="12">12px</Select.Option>
                 <Select.Option value="14">14px</Select.Option>
                 <Select.Option value="16">16px</Select.Option>
                 <Select.Option value="18">18px</Select.Option>
                 <Select.Option value="20">20px</Select.Option>
               </Select>
               <Button.Group size="small">
                 <Button 
                   type={formData.textAlign === 'left' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'left')}
                 >
                   <i className="ti ti-align-left"></i>
                 </Button>
                 <Button 
                   type={formData.textAlign === 'center' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'center')}
                 >
                   <i className="ti ti-align-center"></i>
                 </Button>
                 <Button 
                   type={formData.textAlign === 'right' ? 'primary' : 'default'}
                   onClick={() => handleFontChange('textAlign', 'right')}
                 >
                   <i className="ti ti-align-right"></i>
                 </Button>
               </Button.Group>
               <Button 
                 size="small"
                 onClick={() => handleImageUpload()}
                 icon={<i className="ti ti-photo"></i>}
               >
                 Thêm ảnh
               </Button>
             </div>
             <Input.TextArea
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={4}
               placeholder="Nhập các mô tả cho mã giảm giá..."
               required
               style={{
                 fontFamily: formData.fontFamily || 'Arial',
                 fontSize: `${formData.fontSize || 14}px`,
                 textAlign: formData.textAlign || 'left',
                 border: 'none',
                 resize: 'none'
               }}
             />
           </div>
         </Form.Item>

         <Row gutter={16}>
           {formData.type === 'PERCENT' && (
             <>
               <Col span={12}>
                 <Form.Item label="Giá trị (%)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                   <InputNumber
                     name="value"
                     value={formData.value}
                     onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                     style={{ width: '100%' }}
                     placeholder="Nhập phần trăm giảm giá"
                   />
                 </Form.Item>
               </Col>
               <Col span={12}>
                 <Form.Item label="Giảm tối đa (VND)" required validateStatus={validationErrors.MaxDiscount ? 'error' : ''} help={validationErrors.MaxDiscount ? validationErrors.MaxDiscount.join(', ') : ''}>
                   <InputNumber
                     name="maxDiscount"
                     value={formData.maxDiscount}
                     onChange={(value) => handleChange({ target: { name: 'maxDiscount', value: value?.toString() || '' } })}
                     min={1}
                     style={{ width: '100%' }}
                     placeholder="Nhập số tiền giảm tối đa"
                   />
                 </Form.Item>
               </Col>
             </>
           )}
           {formData.type === 'FIXED' && (
             <Col span={12}>
               <Form.Item label="Giá trị (VND)" required validateStatus={validationErrors.Value ? 'error' : ''} help={validationErrors.Value ? validationErrors.Value.join(', ') : ''}>
                 <InputNumber
                   name="value"
                   value={formData.value}
                   onChange={(value) => handleChange({ target: { name: 'value', value: value?.toString() || '' } })}
                   min={1}
                   style={{ width: '100%' }}
                   placeholder="Nhập số tiền giảm"
                 />
               </Form.Item>
             </Col>
           )}
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Giá trị đơn hàng tối thiểu" required validateStatus={validationErrors.MinOrderValue ? 'error' : ''} help={validationErrors.MinOrderValue ? validationErrors.MinOrderValue.join(', ') : ''}>
               <InputNumber
                 name="minOrderValue"
                 value={formData.minOrderValue}
                 onChange={(value) => handleChange({ target: { name: 'minOrderValue', value: value?.toString() || '' } })}
                 min={0}
                 style={{ width: '100%' }}
                 placeholder="Nhập giá trị đơn hàng tối thiểu"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Số lượng mã giảm giá">
               <InputNumber
                 name="totalUsageLimit"
                 value={formData.totalUsageLimit}
                 onChange={(value) => handleChange({ target: { name: 'totalUsageLimit', value: value?.toString() || '' } })}
                 min={1}
                 style={{ width: '100%' }}
                 placeholder="Nhập số lượng mã giảm giá"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Ngày bắt đầu" required validateStatus={validationErrors.StartDate ? 'error' : ''} help={validationErrors.StartDate ? validationErrors.StartDate.join(', ') : ''}>
               <DatePicker
                 value={formData.startDate ? dayjs(formData.startDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'startDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Chọn ngày bắt đầu"
               />
             </Form.Item>
           </Col>
           <Col span={12}>
             <Form.Item label="Ngày kết thúc" required validateStatus={validationErrors.EndDate ? 'error' : ''} help={validationErrors.EndDate ? validationErrors.EndDate.join(', ') : ''}>
               <DatePicker
                 value={formData.endDate ? dayjs(formData.endDate) : null}
                 onChange={(date, dateString) => handleChange({ target: { name: 'endDate', value: dateString } })}
                 style={{ width: '100%' }}
                 placeholder="Chọn ngày kết thúc"
               />
             </Form.Item>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <Form.Item label="Loại người dùng" validateStatus={validationErrors.Audience ? 'error' : ''} help={validationErrors.Audience ? validationErrors.Audience.join(', ') : ''}>
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
             <Form.Item label="Trạng thái">
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
            <Form.Item label={<span>Chọn người dùng <Button icon={<FilterOutlined />} size="small" style={{ marginLeft: 8 }} onClick={handleOpenUserFilterModal}>Lọc người dùng</Button></span>} required validateStatus={validationErrors.UserIds ? 'error' : ''} help={validationErrors.UserIds ? validationErrors.UserIds.join(', ') : ''}>
                <Select
                    mode="multiple"
                    placeholder="Tìm kiếm người dùng"
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
             Hủy
           </Button>
           <Button type="primary" onClick={handleSubmit}>
             Lưu
           </Button>
         </div>
       </Form>
     </Modal>


     {/* Delete Modal */}
     <Modal
       open={showDeleteModal}
       onCancel={() => setShowDeleteModal(false)}
       footer={null}
       title="Xóa mã giảm giá"
     >
       <div className="modal-body text-center">
         <i className="ti ti-trash-x fs-26 text-danger mb-3 d-inline-block"></i>
         <h4 className="mb-1">Xóa mã giảm giá</h4>
         <p className="mb-3">Bạn có chắc muốn xóa coupon này?</p>
         <div className="d-flex justify-content-center">
           <button type="button" className="btn btn-light me-3" onClick={() => setShowDeleteModal(false)}>Hủy</button>
           <button type="button" className="btn btn-danger" onClick={confirmDelete}>Xóa</button>
         </div>
       </div>
     </Modal>


     {/* Restore Modal */}
     <Modal
       open={showRestoreModal}
       onCancel={() => setShowRestoreModal(false)}
       footer={null}
       title="Khôi phục mã giảm giá"
       width={800}
     >
       <div className="custom-datatable-filter table-responsive">
         <table className="table datatable">
           <thead className="thead-light">
             <tr>
               <th>Mã</th>
               <th>Phân loại</th>
               <th>Giá trị</th>
               <th>Hành động</th>
             </tr>
           </thead>
           <tbody>
             {deletedCoupons.map((coupon) => (
               <tr key={coupon.id}>
                 <td>{coupon.code}</td>
                 <td>{coupon.type}</td>
                 <td>{coupon.value}</td>
                 <td>
                   <Button size="small" type="primary" onClick={() => handleRestoreCoupon(coupon.id)}>
                     Khôi phục
                   </Button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
       <div className="d-flex justify-content-end mt-3">
         <button type="button" className="btn btn-light" onClick={() => setShowRestoreModal(false)}>Đóng</button>
       </div>
     </Modal>

     {/* User Filter Modal - moved to bottom and set zIndex */}
     <Modal
    open={showUserFilterModal}
    onCancel={() => setShowUserFilterModal(false)}
    title="Lọc người dùng"
    width={900}
    zIndex={2000}
    footer={[
        <Button key="back" onClick={() => setShowUserFilterModal(false)}>
            Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loadingFilteredUsers} onClick={handleConfirmUserSelection}>
            Xác nhận
        </Button>,
    ]}
>
    <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle" className="filter-row">
            <Col span={6}>
                <div className="filter-item">
                    <label>Tìm kiếm tên hoặc email</label>
                    <Input.Search
                        placeholder="Nhập tên hoặc email"
                        onSearch={handleUserSearch}
                        onChange={e => handleUserSearch(e.target.value)}
                        allowClear
                    />
                </div>
            </Col>
            <Col span={6}>
                <div className="switch-label-group">
                    <label>Người dùng mới</label>
                    <Switch
                        checked={userFilterCriteria.isNewUser}
                        onChange={checked => handleUserFilterChange({ target: { name: 'isNewUser', type: 'checkbox', checked } })}
                    />
                </div>
            </Col>
            <Col span={6}>
                <div className="switch-label-group">
                    <label>Người dùng cũ</label>
                    <Switch
                        checked={userFilterCriteria.isIntermissionUser}
                        onChange={checked => handleUserFilterChange({ target: { name: 'isIntermissionUser', type: 'checkbox', checked } })}
                    />
                </div>
            </Col>
            <Col span={6}>
                <div className="switch-label-group">
                    <label>Xếp hạng</label>
                    <Select
                        placeholder="Chọn hạng người dùng"
                        style={{ minWidth: 120 }}
                        value={userFilterCriteria.rank}
                        onChange={value => handleUserFilterChange({ target: { name: 'rank', value } })}
                        allowClear
                    >
                        <Select.Option value="Silver">Bạc</Select.Option>
                        <Select.Option value="Gold">Vàng</Select.Option>
                        <Select.Option value="Diamond">Kim cương</Select.Option>
                        <Select.Option value="VIP">VIP</Select.Option>
                    </Select>
                </div>
            </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Giá trị đơn hàng tối thiểu</label>
                <InputNumber
                    placeholder="Nhập giá trị tối thiểu"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.minTotalBookingValue}
                    onChange={value => handleUserFilterChange({ target: { name: 'minTotalBookingValue', value } })}
                />
            </Col>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Giá trị đơn hàng tối đa</label>
                <InputNumber
                    placeholder="Nhập giá trị tối đa"
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
                <label style={{ fontWeight: 500 }}>Số đơn tối thiểu (tháng)</label>
                <InputNumber
                    placeholder="Nhập số đơn tối thiểu"
                    style={{ width: '100%' }}
                    value={userFilterCriteria.minBookingCountInMonth}
                    onChange={value => handleUserFilterChange({ target: { name: 'minBookingCountInMonth', value } })}
                />
            </Col>
            <Col span={6}>
                <label style={{ fontWeight: 500 }}>Số đơn tối đa (tháng)</label>
                <InputNumber
                    placeholder="Nhập số đơn tối đa"
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
            { title: 'Họ và tên', dataIndex: 'fullName' },
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
        <b>Đã chọn:</b> {selectedFilteredUserIds.length} người dùng
    </div>
</Modal>

   {/* Detail Modal */}
   <Modal
     open={showDetailModal}
     onCancel={() => setShowDetailModal(false)}
     footer={null}
     title="Chi tiết mã giảm giá"
     width={800}
   >
     {selectedCoupon && (
       <div>
         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Mã:</label>
               <div style={{ fontSize: 16, fontWeight: 500, color: '#1890ff' }}>{selectedCoupon.code}</div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Phân loại:</label>
               <div style={{ fontSize: 16 }}>{selectedCoupon.type}</div>
             </div>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Giá trị:</label>
               <div style={{ fontSize: 16 }}>
                 {selectedCoupon.type === 'PERCENT' ? `${selectedCoupon.value}%` : `${formatCurrency(selectedCoupon.value)}`}
               </div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Giảm tối đa:</label>
               <div style={{ fontSize: 16 }}>{formatCurrency(selectedCoupon.maxDiscount)}</div>
             </div>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Giá trị đơn hàng tối thiểu:</label>
               <div style={{ fontSize: 16 }}>{formatCurrency(selectedCoupon.minOrderValue)}</div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Loại người dùng:</label>
               <div style={{ fontSize: 16 }}>{selectedCoupon.audience}</div>
             </div>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Số lần sử dụng:</label>
               <div style={{ fontSize: 16 }}>
                 <span className={`badge ${(selectedCoupon.usedCount || 0) >= (selectedCoupon.totalUsageLimit || 1) ? 'bg-warning-transparent' : 'bg-info-transparent'} text-dark`} style={{ fontSize: 14 }}>
                   {selectedCoupon.usedCount || 0}
                 </span>
               </div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Giới hạn sử dụng:</label>
               <div style={{ fontSize: 16 }}>{selectedCoupon.totalUsageLimit || 0}</div>
             </div>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Ngày bắt đầu:</label>
               <div style={{ fontSize: 16 }}>{formatDateTime(selectedCoupon.startDate)}</div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Ngày kết thúc:</label>
               <div style={{ fontSize: 16 }}>{formatDateTime(selectedCoupon.endDate)}</div>
             </div>
           </Col>
         </Row>

         <Row gutter={16}>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Trạng thái:</label>
               <div style={{ fontSize: 16 }}>
                 <span className={`badge ${selectedCoupon.isActive ? 'bg-success-transparent' : 'bg-danger-transparent'} text-dark`}>
                   {selectedCoupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                 </span>
               </div>
             </div>
           </Col>
           <Col span={12}>
             <div style={{ marginBottom: 16 }}>
               <label style={{ fontWeight: 600, color: '#666' }}>Thời gian tạo:</label>
               <div style={{ fontSize: 16 }}>{formatDateTime(selectedCoupon.createdAt)}</div>
             </div>
           </Col>
         </Row>

         <div style={{ marginBottom: 16 }}>
           <label style={{ fontWeight: 600, color: '#666' }}>Mô tả:</label>
           <div 
             style={{ 
               border: '1px solid #f0f0f0', 
               borderRadius: 6, 
               padding: 12, 
               backgroundColor: '#fafafa',
               fontFamily: selectedCoupon.fontFamily || 'Arial',
               fontSize: `${selectedCoupon.fontSize || 14}px`,
               textAlign: selectedCoupon.textAlign || 'left'
             }}
             dangerouslySetInnerHTML={{ 
               __html: renderFormattedDescription(selectedCoupon.description) 
             }}
           />
         </div>

         {selectedCoupon.audience === 'SPECIFIC_USERS' && selectedCoupon.userIds && selectedCoupon.userIds.length > 0 && (
           <div style={{ marginBottom: 16 }}>
             <label style={{ fontWeight: 600, color: '#666' }}>Người dùng được chọn:</label>
             <div style={{ fontSize: 16, color: '#666' }}>
               {selectedCoupon.userIds.length} người dùng
             </div>
           </div>
         )}

         <div style={{ marginTop: 24, textAlign: 'center' }}>
           <Button onClick={() => setShowDetailModal(false)}>Đóng</Button>
         </div>
       </div>
     )}
   </Modal>
 </div>
 );
};


export default CouponManagement;
  
