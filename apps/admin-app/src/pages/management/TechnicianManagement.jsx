import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Select, Descriptions, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { userAPI } from '../../features/users/userAPI';
import {
  setTechnicians,
  setLoading,
  setError,
  setFilters,
  updateTechnician,
  clearFilters,
} from '../../features/technicians/technicianSlice';
import {
  selectFilteredTechnicians,
  selectTechnicianFilters,
  selectTechnicianLoading,
  selectTechnicianError,
} from '../../features/technicians/technicianSelectors';
import { categoryAPI } from "../../features/categories/categoryAPI";
import { EyeOutlined } from '@ant-design/icons';
import "../../styles/ManagementTableStyle.css";
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';
import { approveTechnicianThunk } from '../../features/admin/adminSlice';


const TechnicianManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const technicians = useSelector(selectFilteredTechnicians);
  const filters = useSelector(selectTechnicianFilters);
  const loading = useSelector(selectTechnicianLoading);
  const error = useSelector(selectTechnicianError);




  const [searchText, setSearchText] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [statusData, setStatusData] = useState({ status: '', note: '' });
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const techniciansPerPage = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterAvailability, setFilterAvailability] = useState('');



  const filteredTechnicians = technicians.filter(tech => {
    // Filter by availability - so sánh cả string và number
    if (filters.availability) {
      const techAvailability = tech.availability;
      if (filters.availability === '0' && techAvailability !== 0 && techAvailability !== 'ONJOB') return false;
      if (filters.availability === '1' && techAvailability !== 1 && techAvailability !== 'FREE') return false;
      if (filters.availability === '2' && techAvailability !== 2 && techAvailability !== 'BUSY') return false;
    }
    
    // Filter by status
    if (filters.status && tech.status !== filters.status) {
      return false;
    }
    
    // Filter by search text
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = (tech.fullName || '').toLowerCase();
      const email = (tech.email || '').toLowerCase();
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  const indexOfLastTechnician = currentPage * techniciansPerPage;
  const indexOfFirstTechnician = indexOfLastTechnician - techniciansPerPage;
  const sortedTechnicians = [...filteredTechnicians].sort((a, b) => {
    if (sortField === 'fullName') {
      if (!a.fullName) return 1;
      if (!b.fullName) return -1;
      if (sortOrder === 'asc') {
        return a.fullName.localeCompare(b.fullName);
      } else {
        return b.fullName.localeCompare(a.fullName);
      }
    } else if (sortField === 'email') {
      if (!a.email) return 1;
      if (!b.email) return -1;
      if (sortOrder === 'asc') {
        return a.email.localeCompare(b.email);
      } else {
        return b.email.localeCompare(a.email);
      }
    } else if (sortField === 'phone') {
      if (!a.phone) return 1;
      if (!b.phone) return -1;
      if (sortOrder === 'asc') {
        return a.phone.localeCompare(b.phone);
      } else {
        return b.phone.localeCompare(a.phone);
      }
    } else if (sortField === 'rating') {
      const aRating = Number(a.ratingAverage) || 0;
      const bRating = Number(b.ratingAverage) || 0;
      if (sortOrder === 'asc') {
        return aRating - bRating;
      } else {
        return bRating - aRating;
      }
    } else if (sortField === 'jobs') {
      const aJobs = Number(a.jobCompleted) || 0;
      const bJobs = Number(b.jobCompleted) || 0;
      if (sortOrder === 'asc') {
        return aJobs - bJobs;
      } else {
        return bJobs - aJobs;
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
  const currentTechnicians = sortedTechnicians.slice(indexOfFirstTechnician, indexOfLastTechnician);

  // Set export data và columns
  useEffect(() => {
    const exportColumns = [
      { title: 'Họ và tên', dataIndex: 'Họ và tên' },
      { title: 'Email', dataIndex: 'Email' },
      { title: 'SĐT', dataIndex: 'SĐT' },
      { title: 'Trạng thái', dataIndex: 'Trạng thái' },
      { title: 'Tình trạng', dataIndex: 'Tình trạng' },
      { title: 'Đánh giá', dataIndex: 'Đánh giá' },
      { title: 'Số công việc hoàn thành', dataIndex: 'Số công việc hoàn thành' },
      { title: 'Tổng thu nhập', dataIndex: 'Tổng thu nhập' },
      { title: 'Tổng phí hoa hồng', dataIndex: 'Tổng phí hoa hồng' },
      { title: 'Tổng số tiền bị giữ lại', dataIndex: 'Tổng số tiền bị giữ lại' },
      { title: 'Tổng số tiền đã rút', dataIndex: 'Tổng số tiền đã rút' },
      { title: 'Thời gian tạo', dataIndex: 'Thời gian tạo' },
    ];

    const exportData = sortedTechnicians.map(technician => ({
      'Họ và tên': technician.fullName,
      Email: technician.email,
      SĐT: technician.phone,
      'Trạng thái': statusMapping[technician.status] || technician.status,
      'Tình trạng': getTechnicianAvailability(technician.availability),
      'Đánh giá': technician.ratingAverage || 0,
      'Số công việc hoàn thành': technician.jobCompleted || 0,
      'Tổng thu nhập': formatCurrency(technician.totalEarning || 0),
      'Tổng phí hoa hồng': formatCurrency(technician.totalCommissionPaid || 0),
      'Tổng số tiền bị giữ lại': formatCurrency(technician.totalHoldingAmount || 0),
      'Tổng số tiền đã rút': formatCurrency(technician.totalWithdrawn || 0),
      'Thời gian tạo': formatDateTime(technician.createdAt),
    }));

    createExportData(exportData, exportColumns, 'technicians_export', 'Technicians');
  }, [sortedTechnicians]);

  const totalPages = Math.ceil(filteredTechnicians.length / techniciansPerPage);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const fetchTechnicians = async () => {
    try {
      dispatch(setLoading(true));
      const data = await technicianAPI.getAll();
      dispatch(setTechnicians(data || []));
      
      // Load user data for each technician
      if (data && data.length > 0) {
        const userPromises = data
          .filter(tech => tech.userId)
          .map(tech => userAPI.getById(tech.userId).catch(() => null));
        
        const users = await Promise.all(userPromises);
        const userMapData = {};
        
        data.forEach((tech, index) => {
          if (tech.userId && users[index]) {
            userMapData[tech.id] = users[index];
          }
        });
        
        setUserMap(userMapData);
      }
    } catch (err) {
      dispatch(setError(err.message || 'Tải các kỹ thuật viên thất bại.'));
      message.error('Tải các kỹ thuật viên thất bại.');
    } finally {
      dispatch(setLoading(false));
    }
  };


  useEffect(() => {
    fetchTechnicians();
  }, [dispatch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [technicians.length, filters.availability, filters.status, filters.search]);

  // Đồng bộ local state với Redux state khi component mount
  useEffect(() => {
    setFilterAvailability(filters.availability || '');
  }, [filters.availability]);

  // Đồng bộ searchText với Redux state khi component mount
  useEffect(() => {
    setSearchText(filters.search || '');
  }, [filters.search]);

  // Cleanup filters when component unmounts
  useEffect(() => {
    return () => {
      // Reset filters when leaving the page
      dispatch(clearFilters());
      // Reset local states
      setSearchText('');
      setFilterAvailability('');
      setCurrentPage(1);
    };
  }, [dispatch]);


  useEffect(() => {
    categoryAPI.getAll().then(data => {
      setCategories(data || []);
      const map = {};
      (data || []).forEach(cat => {
        const key = cat._id?.$oid || cat._id || cat.id;
        map[key] = cat.categoryName || cat.name;
      });
      setCategoryMap(map);
    });
  }, []);


  const handleOpenDetail = (technician) => {
    navigate(`/admin/technician-management/${technician.id}`);
  };


  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedTechnician(null);
  };


  const handleOpenEditStatus = (technician) => {
    setSelectedTechnician(technician);
    setStatusData({ status: technician.status || 'PENDING', note: technician.note || '' });
    setShowEditStatusModal(true);
  };


  const handleCloseEditStatus = () => {
    setShowEditStatusModal(false);
    setSelectedTechnician(null);
  };


  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
  };


  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTechnician) return;
    try {
      dispatch(setLoading(true));
      await technicianAPI.updateStatus(selectedTechnician.id, statusData.status, statusData.note);
      await fetchTechnicians();
      message.success('Cập nhật thành công!');
      handleCloseEditStatus();
    } catch (err) {
      console.error('Cập nhật thất bại:', err);
      dispatch(setError(err.message || 'Cập nhật thất bại.'));
      message.error('Cập nhật thất bại: ' + (err.message || 'Unknown error'));
    } finally {
      dispatch(setLoading(false));
    }
  };


  const handleUpdateStatusWithAction = async (action, technician = null) => {
    const targetTechnician = technician || selectedTechnician;

    if (action === 'REJECTED' && !statusData.note.trim()) {
      message.error('Hãy cung cấp lý do để từ chối đăng kí');
      return;
    }

    if (!targetTechnician) return;

    try {
      dispatch(setLoading(true));
      const note = action === 'REJECTED' ? statusData.note : '';
      await technicianAPI.updateStatus(targetTechnician.id, action, note);
      if (action === 'APPROVED') {
        try {
          await dispatch(approveTechnicianThunk(targetTechnician.id)).unwrap();
          // toast.success('Duyệt thợ thành công!');
          // if (onSuccess) onSuccess(); // Trigger callback to refresh technician list
        } catch (error) {
          // toast.error('Không thể duyệt thợ: ' + (error.message || 'Lỗi không xác định'));
        }
      }
      await fetchTechnicians();
      message.success(`Technician ${action === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
      if (technician) {
        // Nếu được gọi từ table, không cần đóng modal
      } else {
        handleCloseEditStatus();
      }
    } catch (err) {
      console.error('Cập nhật thất bại:', err);
      dispatch(setError(err.message || 'Cập nhật thất bại.'));
      message.error('Cập nhật thất bại: ' + (err.message || 'Unknown error'));
    } finally {
      dispatch(setLoading(false));
    }
  };


  const handleSortChange = (value) => {
    if (value === 'lasted') {
      setSortField('createdAt');
      setSortOrder('desc');
    } else if (value === 'oldest') {
      setSortField('createdAt');
      setSortOrder('asc');
    }
  };

  const handleSortByName = () => {
    if (sortField === 'fullName') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('fullName');
      setSortOrder('asc');
    }
  };

  const handleSortByEmail = () => {
    if (sortField === 'email') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('email');
      setSortOrder('asc');
    }
  };
  const handleSortByPhone = () => {
    if (sortField === 'phone') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('phone');
      setSortOrder('asc');
    }
  };

  const handleSortByRating = () => {
    if (sortField === 'rating') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('rating');
      setSortOrder('asc');
    }
  };
  const handleSortByJobs = () => {
    if (sortField === 'jobs') {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField('jobs');
      setSortOrder('asc');
    }
  };

  const TECHNICIAN_STATUS_MAP = {
    0: 'PENDING',
    1: 'APPROVED',
    2: 'REJECTED',
    3: 'INACTIVE',
    4: 'PENDING_DELETION',
    5: 'DELETED',
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
    'INACTIVE': 'INACTIVE',
    'PENDING_DELETION': 'PENDING_DELETION',
    'DELETED': 'DELETED'
  };

  function getTechnicianStatus(status) {
    return TECHNICIAN_STATUS_MAP[status] || status || 'Chưa cập nhật';
  }

  // Mapping availability từ tiếng Anh sang tiếng Việt
  const TECHNICIAN_AVAILABILITY_MAP = {
    1: 'Đang rảnh',
    2: 'Bận',
    0: 'Đang làm việc',
    'FREE': 'Đang rảnh',
    'BUSY': 'Bận',
    'ONJOB': 'Đang làm việc'
  };
  
  function getTechnicianAvailability(availability) {
    return TECHNICIAN_AVAILABILITY_MAP[availability] || availability || 'Chưa cập nhật';
  }

  // Function để lấy màu sắc cho availability
  const getAvailabilityColor = (availability) => {
    if (availability === 'FREE' || availability === 1 || availability === '1') {
      return '#198754'; // Xanh lá đậm - Rảnh rỗi
    } else if (availability === 'ONJOB' || availability === 0 || availability === '0') {
      return '#0d6efd'; // Xanh dương đậm - Đang làm việc
    } else if (availability === 'BUSY' || availability === 2 || availability === '2') {
      return '#dc3545'; // Đỏ đậm - Bận
    } else {
      return '#6c757d'; // Xám - Không xác định
    }
  };
  
  // Mapping status từ tiếng Anh sang tiếng Việt
  const statusMapping = {
    'APPROVED': 'Đã duyệt',
    'REJECTED': 'Từ chối',
    'PENDING': 'Đang chờ',
    'approved': 'Đã duyệt',
    'rejected': 'Từ chối',
    'pending': 'Đang chờ'
  };

  // Thêm hàm getStatusBadgeClass giống UserManagement
  const getStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':
        return 'bg-success-transparent';
      case 'REJECTED':
        return 'bg-danger-transparent';
      default:
        return 'bg-secondary-transparent';
    }
  };




  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
                 {/* Breadcrumb */}
         <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
           <div className="my-auto mb-2 d-flex align-items-center">
             
             <div>
               <h4 className="mb-1">Kỹ thuật viên</h4>
               <nav>
                 <ol className="breadcrumb mb-0">
                   <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                   <li className="breadcrumb-item active">Kỹ thuật viên</li>
                 </ol>
               </nav>
             </div>
           </div>
         </div>
        {/* Search & Filters */}
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
                   placeholder="Tìm kiếm tên, email"
                   value={filters.search || ''}
                   onChange={e => dispatch(setFilters({ ...filters, search: e.target.value }))}
                 />
              </div>
            </div>
                         <Select
               placeholder="Tình trạng"
               value={filters.availability || undefined}
               onChange={value => {
                 setFilterAvailability(value);
                 dispatch(setFilters({ ...filters, availability: value }));
               }}
               style={{ width: 160, marginRight: 8 }}
               allowClear
             >
              <Select.Option value="0">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: getAvailabilityColor('0')
                  }}></div>
                  <span style={{ 
                      color: getAvailabilityColor('0'),
                      fontWeight: '500',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                  }}>
                    Đang làm việc
                  </span>
                </div>
              </Select.Option>
              <Select.Option value="1">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: getAvailabilityColor('1')
                  }}></div>
                  <span style={{ 
                      color: getAvailabilityColor('1'),
                      fontWeight: '500',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                  }}>
                    Đang rảnh
                  </span>
                </div>
              </Select.Option>
              <Select.Option value="2">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%',
                      backgroundColor: getAvailabilityColor('2')
                  }}></div>
                  <span style={{ 
                      color: getAvailabilityColor('2'),
                      fontWeight: '500',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                  }}>
                    Bận
                  </span>
                </div>
              </Select.Option>
            </Select>
            <Select
              placeholder="Trạng thái"
              value={filters.status || undefined}
              onChange={value => dispatch(setFilters({ ...filters, status: value }))}
              style={{ width: 130, marginRight: 8 }}
              allowClear
            >
              <Select.Option value="PENDING">Đang chờ</Select.Option>
              <Select.Option value="APPROVED">Đã duyệt</Select.Option>
              <Select.Option value="REJECTED">Từ chối</Select.Option>
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
                 {/* Filter Info */}
         {(filters.search || filters.availability || filters.status) && (
           <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
             <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
             {filters.search && (
               <span className="badge bg-primary-transparent">
                 <i className="ti ti-search me-1"></i>
                 Tìm kiếm: "{filters.search}"
               </span>
             )}
             {filters.availability && (
               <span className="badge bg-info-transparent">
                 <i className="ti ti-filter me-1"></i>
                 Tình trạng: <span className="ms-1" style={{ 
                     color: getAvailabilityColor(filters.availability),
                     fontSize: '11px',
                     fontWeight: '600',
                     textTransform: 'uppercase',
                     letterSpacing: '0.5px'
                 }}>
                   <span className="d-inline-flex align-items-center">
                     <span className="me-2" style={{ 
                         width: '6px', 
                         height: '6px', 
                         borderRadius: '50%',
                         backgroundColor: getAvailabilityColor(filters.availability)
                     }}></span>
                     {getTechnicianAvailability(filters.availability)}
                   </span>
                 </span>
               </span>
             )}
             {filters.status && (
               <span className="badge bg-warning-transparent">
                 <i className="ti ti-filter me-1"></i>
                 Trạng thái: {statusMapping[filters.status] || filters.status}
               </span>
             )}
             <button 
               className="btn btn-sm btn-outline-secondary"
               onClick={() => {
                 dispatch(setFilters({ search: '', availability: undefined, status: undefined }));
                 setSearchText('');
                 setFilterAvailability('');
               }}
             >
               <i className="ti ti-x me-1"></i>
               Xóa tất cả
             </button>
           </div>
         )}
        {/* Table */}
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={handleSortByName}>
                  Họ và tên
                  {sortField === 'fullName' && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={handleSortByEmail}>
                  Email
                  {sortField === 'email' && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>Trạng thái</th>
                <th>Tình trạng</th>
                <th style={{ cursor: 'pointer' }} onClick={handleSortByRating}>
                  Đánh giá
                  {sortField === 'rating' && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && technicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center"><Spin /></td>
                </tr>
              ) : filteredTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    <div>
                      <i className="ti ti-users" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                      <p className="mb-0">Không có kỹ thuật viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : currentTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    <div>
                      <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                      <p className="mb-0">Không tìm thấy kỹ thuật viên nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTechnicians.map((tech) => (
                  <tr key={tech.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <p className="avatar me-2 flex-shrink-0">
                          {(tech.avatar || userMap[tech.id]?.avatar) ? (
                            <img 
                              src={tech.avatar || userMap[tech.id]?.avatar} 
                              className="rounded-circle" 
                              alt="" 
                            />
                          ) : (
                            <div className="rounded-circle" style={{width: 32, height: 32, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#888'}}>
                                {(tech.fullName || userMap[tech.id]?.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                           )}
                        </p>
                        <h6><p className="fs-14 fw-semibold" style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                          {tech.fullName && tech.fullName.length > 18 
                            ? `${tech.fullName.substring(0, 18)}...` 
                            : (tech.fullName || "")}
                        </p></h6>
                      </div>
                    </td>
                    <td>{tech.email}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(tech.status)} text-dark`}>
                        {statusMapping[tech.status] || tech.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%',
                            backgroundColor: getAvailabilityColor(tech.availability)
                        }}></div>
                        <span style={{ 
                            color: getAvailabilityColor(tech.availability),
                            fontWeight: '500',
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                          {getTechnicianAvailability(tech.availability)}
                        </span>
                      </div>
                    </td>
                    <td>
                     <div className="d-flex align-items-center gap-2">
                         <span className={`badge text-white ${
                           (tech.ratingAverage || 0) >= 4 ? 'bg-success' : 
                           (tech.ratingAverage || 0) >= 2 ? 'bg-warning' : 'bg-danger'
                         }`}>
                           {tech.ratingAverage?.toFixed(1) ?? '-'}
                         </span>
                        <div className="rating-stars">
                                                     {[1, 2, 3, 4, 5].map((star) => {
                             const rating = tech.ratingAverage || 0;
                             let starColor = '#d9d9d9'; // Mặc định xám
                             let starClass = 'ti ti-star-filled'; // Mặc định sao đầy
                             let starStyle = {
                               color: starColor,
                               fontSize: '14px',
                               marginRight: '2px'
                             };
                             
                             if (star <= Math.floor(rating)) {
                               // Sao hoàn chỉnh (phần nguyên)
                               starColor = '#ffc107';
                               starClass = 'ti ti-star-filled';
                               starStyle = {
                                 color: starColor,
                                 fontSize: '14px',
                                 marginRight: '2px'
                               };
                             } else if (star === Math.floor(rating) + 1 && rating % 1 > 0) {
                               // Sao một phần (có phần thập phân) - hiển thị nửa vàng nửa xám
                               starClass = 'ti ti-star-filled';
                               const fillPercentage = (rating % 1) * 100;
                               starStyle = {
                                 background: `linear-gradient(90deg, #ffc107 ${fillPercentage}%, #d9d9d9 ${fillPercentage}%)`,
                                 WebkitBackgroundClip: 'text',
                                 WebkitTextFillColor: 'transparent',
                                 fontSize: '14px',
                                 marginRight: '2px'
                               };
                             }
                             
                             return (
                               <i 
                                 key={star}
                                 className={starClass}
                                 style={starStyle}
                               />
                             );
                           })}
                        </div>
                      </div>
                     </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button className="management-action-btn" size="middle" onClick={() => handleOpenDetail(tech)}>
                          <EyeOutlined style={{ marginRight: 4 }} />Xem chi tiết
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-3">
            <div className="text-muted">
              Hiển thị {indexOfFirstTechnician + 1}-{Math.min(indexOfLastTechnician, filteredTechnicians.length)} trong tổng số {filteredTechnicians.length} kỹ thuật viên
            </div>
            {totalPages > 1 && (
              <div className="text-muted">
                Trang {currentPage} / {totalPages}
              </div>
            )}
            
          </div>
          {/* Always show pagination if there are technicians */}
          {filteredTechnicians.length > 0 && (
            <nav>
              <ul className="pagination mb-0" style={{ gap: '2px' }}>
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ 
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-left"></i>
                  </button>
                </li>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show all pages if total pages <= 7
                  if (totalPages <= 7) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  }
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={i} className="page-item disabled">
                        <span className="page-link" style={{ 
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          minWidth: '40px',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d'
                        }}>...</span>
                      </li>
                    );
                  }
                  return null;
                })}
                
                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ 
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>


      {/* Detail Modal */}
      
      
      {/* Edit Status Modal */}
      {showEditStatusModal && selectedTechnician && (
        <Modal
          open={showEditStatusModal}
          onCancel={handleCloseEditStatus}
          footer={null}
          title="Từ chối đăng kí kỹ thuật viên"
        >
          <hr></hr>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
              Họ và tên: {selectedTechnician.fullName && selectedTechnician.fullName.length > 25 
                ? `${selectedTechnician.fullName.substring(0, 25)}...` 
                : (selectedTechnician.fullName || '')}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Tình trạng hiện tại: {getTechnicianStatus(selectedTechnician.status)}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#d32f2f' }}>
              Lý do từ chối đăng kí kỹ thuật viên:
            </div>
            <textarea
              name="note"
              className="form-control"
              value={statusData.note}
              onChange={handleStatusChange}
              rows="4"
              placeholder="Hãy cung cấp lý do để từ chối đăng kí kỹ thuật viên..."
              style={{ borderColor: statusData.note ? '#d9d9d9' : '#ff4d4f' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={handleCloseEditStatus}>
              Hủy
            </Button>
            <Button
              danger
              onClick={() => handleUpdateStatusWithAction('REJECTED')}
              loading={loading}
              disabled={!statusData.note.trim()}
            >
              Xác nhận
            </Button>
          </div>
        </Modal>
      )}


    </div>
  );
};


export default TechnicianManagement;