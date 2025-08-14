import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button, Select, Descriptions, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import {
  setTechnicians,
  setLoading,
  setError,
  setFilters,
  updateTechnician,
} from '../../features/technicians/technicianSlice';
import {
  selectFilteredTechnicians,
  selectTechnicianFilters,
  selectTechnicianLoading,
  selectTechnicianError,
} from '../../features/technicians/technicianSelectors';
import { categoryAPI } from "../../features/categories/categoryAPI";
import { EyeOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";
import { createExportData, formatDateTime, formatCurrency } from '../../utils/exportUtils';
import { approveTechnicianThunk } from '../../features/admin/adminSlice';


const TechnicianManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const technicians = useSelector(selectFilteredTechnicians);
  const filters = useSelector(selectTechnicianFilters);
  const loading = useSelector(selectTechnicianLoading);
  const error = useSelector(selectTechnicianError);


  const [searchText, setSearchText] = useState(filters.search || '');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [statusData, setStatusData] = useState({ status: '', note: '' });
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const techniciansPerPage = 10;
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterAvailability, setFilterAvailability] = useState('');



  const filteredTechnicians = technicians.filter(tech => {
    // Filter by availability
    if (filterAvailability && tech.availability !== filterAvailability) {
      return false;
    }
    
    // Filter by status
    if (filters.status && tech.status !== filters.status) {
      return false;
    }
    
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
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
      { title: 'Họ và tên', dataIndex: 'fullName' },
      { title: 'Email', dataIndex: 'email' },
      { title: 'SĐT', dataIndex: 'phone' },
      { title: 'Trạng thái', dataIndex: 'status' },
      { title: 'Tình trạng', dataIndex: 'availability' },
      { title: 'Đánh giá', dataIndex: 'rating' },
      { title: 'Số công việc hoàn thành', dataIndex: 'jobsCompleted' },
      { title: 'Tổng thu nhập', dataIndex: 'totalEarning' },
      { title: 'Tổng phí hoa hồng', dataIndex: 'totalCommissionPaid' },
      { title: 'Tổng số tiền bị giữ lại', dataIndex: 'totalHoldingAmount' },
      { title: 'Tổng số tiền đã rút', dataIndex: 'totalWithdrawn' },
      { title: 'Thời gian tạo', dataIndex: 'createdAt' },
    ];

    const exportData = sortedTechnicians.map(technician => ({
      fullName: technician.fullName,
      email: technician.email,
      phone: technician.phone,
      status: technician.status,
      availability: technician.availability,
      rating: technician.ratingAverage || 0,
      jobsCompleted: technician.jobCompleted || 0,
      totalEarning: formatCurrency(technician.totalEarning || 0),
      totalCommissionPaid: formatCurrency(technician.totalCommissionPaid || 0),
      totalHoldingAmount: formatCurrency(technician.totalHoldingAmount || 0),
      totalWithdrawn: formatCurrency(technician.totalWithdrawn || 0),
      createdAt: formatDateTime(technician.createdAt),
      updatedAt: formatDateTime(technician.updatedAt),
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
  }, [technicians.length, filterAvailability, filters.status, searchText]);


  useEffect(() => {
    dispatch(setFilters({ search: searchText }));
  }, [searchText, dispatch]);


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

  // Thêm hàm chuyển đổi availability nếu chưa có
  const TECHNICIAN_AVAILABILITY_MAP = {
    1: 'FREE',
    2: 'BUSY',
    0: 'ONJOB',
  };
  function getTechnicianAvailability(availability) {
    return TECHNICIAN_AVAILABILITY_MAP[availability] || availability || 'Chưa cập nhật';
  }

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
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Select
              placeholder="Tình trạng"
              value={filterAvailability || undefined}
              onChange={value => setFilterAvailability(value)}
              style={{ width: 150, marginRight: 8 }}
              allowClear
            >
              <Select.Option value="ONJOB">ONJOB</Select.Option>
              <Select.Option value="FREE">FREE</Select.Option>
              <Select.Option value="BUSY">BUSY</Select.Option>
            </Select>
            <Select
              placeholder="Trạng thái"
              value={filters.status || undefined}
              onChange={value => dispatch(setFilters({ ...filters, status: value }))}
              style={{ width: 130, marginRight: 8 }}
              allowClear
            >
              <Select.Option value="PENDING">PENDING</Select.Option>
              <Select.Option value="APPROVED">APPROVED</Select.Option>
              <Select.Option value="REJECTED">REJECTED</Select.Option>
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
        {(filterAvailability || filters.status || searchText) && (
          <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
            <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
            {searchText && (
              <span className="badge bg-primary-transparent">
                <i className="ti ti-search me-1"></i>
                Tìm kiếm: "{searchText}"
              </span>
            )}
            {filterAvailability && (
              <span className="badge bg-info-transparent">
                <i className="ti ti-filter me-1"></i>
                Tình trạng: {getTechnicianAvailability(filterAvailability)}
              </span>
            )}
            {filters.status && (
              <span className="badge bg-warning-transparent">
                <i className="ti ti-filter me-1"></i>
                Trạng thái: {getTechnicianStatus(filters.status)}
              </span>
            )}
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchText('');
                setFilterAvailability('');
                dispatch(setFilters({ ...filters, status: undefined }));
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
                <th style={{ cursor: 'pointer' }} onClick={handleSortByRating}>
                  Đánh giá
                  {sortField === 'rating' && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={handleSortByJobs}>
                  Công việc
                  {sortField === 'jobs' && (
                    <span style={{ marginLeft: 4 }}>
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
                <th>Tình trạng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading && technicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center"><Spin /></td>
                </tr>
              ) : filteredTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    <div>
                      <i className="ti ti-users" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                      <p className="mb-0">Không có kỹ thuật viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : currentTechnicians.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
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
                          <img 
                            src={tech.avatar || tech.userInfo?.avatar || `https://i.pravatar.cc/150?u=${tech.id}`} 
                            className="rounded-circle" 
                            alt="" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        </p>
                        <h6><p className="fs-14 fw-semibold">{tech.fullName || "UNKNOWN"}</p></h6>
                      </div>
                    </td>
                    <td>{tech.email}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(getTechnicianStatus(tech.status))} text-dark`}>
                        {getTechnicianStatus(tech.status)}
                      </span>
                    </td>
                    <td>{tech.ratingAverage?.toFixed(1) ?? '-'}</td>
                    <td>{tech.jobCompleted ?? 0}</td>
                    <td>{getTechnicianAvailability(tech.availability)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Button className="management-action-btn" size="middle" onClick={() => handleOpenDetail(tech)}>
                          <EyeOutlined style={{ marginRight: 4 }} />Xem chi tiết
                        </Button>
                        {tech.status === "PENDING" ? (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatusWithAction('APPROVED', tech)}
                              disabled={loading}
                            >
                              <i className="ti ti-check me-1"></i>
                              Đồng ý
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenEditStatus(tech)}
                              disabled={loading}
                            >
                              <i className="ti ti-x me-1"></i>
                              Từ chối
                            </button>
                          </>
                        ) : null}
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
              Họ và tên: {selectedTechnician.fullName || 'Unknown'}
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