import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
 Table,
 Button,
 Input,
 Select,
 Card,
 Row,
 Col,
 Tag,
 message, 
 Space,
 Modal,
 Descriptions,
 Divider
} from 'antd';

const { TextArea } = Input;
import {
 SearchOutlined,
 EyeOutlined,
 FileTextOutlined,
 UserOutlined,
 CalendarOutlined,
 ExclamationCircleOutlined,
 SafetyOutlined,
 EditOutlined,
 CheckCircleOutlined,
 CloseCircleOutlined
} from '@ant-design/icons';
import { reportAPI } from '../../features/reports/reportAPI';
import { setReports, setSelectedReport, setFilters, clearFilters, setLoading, setError } from '../../features/reports/reportSlice';
import { selectFilteredReports, selectReportFilters, selectReportStats } from '../../features/reports/reportSelectors';
import { userAPI } from '../../features/users/userAPI';
import { createExportData, formatDateTime } from '../../utils/exportUtils';


const { Option } = Select;


const ReportManagement = () => {
 const dispatch = useDispatch();
 const navigate = useNavigate();
 const [selectedReport, setSelectedReport] = useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [userMap, setUserMap] = useState({});
 const [selectedUser, setSelectedUser] = useState(null);
 const [isUserModalVisible, setIsUserModalVisible] = useState(false);
 const [sortField, setSortField] = useState('createdAt');
 const [sortOrder, setSortOrder] = useState('desc');
 const [currentPage, setCurrentPage] = useState(1);
 const [reportsPerPage, setReportsPerPage] = useState(10);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isLockModalOpen, setIsLockModalOpen] = useState(false);
 const [lockReason, setLockReason] = useState('');
 const [isLocking, setIsLocking] = useState(false);
 const [showUnlockModal, setShowUnlockModal] = useState(false);
 const [updatingStatus, setUpdatingStatus] = useState(false);


 // Redux selectors
 const filteredReports = useSelector(selectFilteredReports);
 const filters = useSelector(selectReportFilters);
 const reportStats = useSelector(selectReportStats);
 const loading = useSelector(state => state.reports.loading);
 const error = useSelector(state => state.reports.error);

 // Pagination logic
 const indexOfLastReport = currentPage * reportsPerPage;
 const indexOfFirstReport = indexOfLastReport - reportsPerPage;
 const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

 // Sorted reports for current page
 const sortedReports = [...filteredReports].sort((a, b) => {
   if (sortField === 'createdAt') {
     return sortOrder === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt);
   }
   return 0;
 });

 const currentReports = sortedReports.slice(indexOfFirstReport, indexOfLastReport);

 const handlePageChange = (pageNumber) => {
   setCurrentPage(pageNumber);
 };

 const handleSortChange = (field) => {
   if (sortField === field) {
     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
   } else {
     setSortField(field);
     setSortOrder('desc');
   }
   setCurrentPage(1); // Reset to first page when sorting changes
 };


 // Load reports on component mount
 useEffect(() => {
   const fetchReports = async () => {
     try {
       dispatch(setLoading(true));
       const reports = await reportAPI.getAll();
       dispatch(setReports(reports));
     } catch (error) {
       dispatch(setError(error.message));
       message.error('Tải các báo cáo thất bại');
     } finally {
       dispatch(setLoading(false));
     }
   };


   fetchReports();
 }, [dispatch]);

 // Cleanup filters when component unmounts
 useEffect(() => {
   return () => {
     // Reset filters when leaving the page
     dispatch(clearFilters());
     // Reset local states
     setCurrentPage(1);
     setSortField('createdAt');
     setSortOrder('desc');
   };
 }, [dispatch]);


 useEffect(() => {
   let timeout;
   const fetchUserNames = async () => {
     const userIds = Array.from(new Set((filteredReports || []).flatMap(r => [r.reportedUserId, r.reporterId])));
     const userMapTemp = { ...userMap };
     await Promise.all(userIds.map(async (id) => {
       if (id && !userMapTemp[id]) {
         try {
           const user = await userAPI.getById(id);
           userMapTemp[id] = user.fullName || user.email || id;
         } catch {
           userMapTemp[id] = id;
         }
       }
     }));
     setUserMap(userMapTemp);
   };
   if (filteredReports.length > 0) {
     timeout = setTimeout(fetchUserNames, 100); // debounce 100ms
   }
   return () => clearTimeout(timeout);
   // eslint-disable-next-line
 }, [filteredReports]);


 const handleFilterChange = (filterType, value) => {
   dispatch(setFilters({ [filterType]: value }));
 };


 const handleClearFilters = () => {
   dispatch(clearFilters());
 };


 const handleViewReportDetails = (report) => {
   setSelectedReport(report);
   setIsModalVisible(true);
 };

 const handleViewUserDetails = (userId) => {
   // Kiểm tra userId có hợp lệ không
   if (!userId) {
     message.error('Không có thông tin người dùng');
     return;
   }
   
   // Dẫn đến trang UserDetail - sử dụng route đúng
   navigate(`/admin/user-management/${userId}`);
 };


   const handleStatusAction = (reportId, status) => {
    const actionText = status === 'RESOLVED' ? 'đồng ý' : 'từ chối';
    Modal.confirm({
      title: `Xác nhận ${actionText} báo cáo`,
      content: `Bạn có chắc chắn muốn ${actionText} báo cáo này không?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy bỏ',
      okType: status === 'RESOLVED' ? 'primary' : 'danger',
      onOk: () => {
        // Tự động set status và ghi chú mặc định
        const defaultNote = status === 'RESOLVED' 
          ? 'Báo cáo đã được xử lý và giải quyết thành công.' 
          : 'Báo cáo đã bị từ chối giải quyết.';
        
        handleUpdateStatus(reportId, status, defaultNote);
      }
    });
  };

 const handleUpdateStatus = async (reportId, status, note) => {
   try {
     setUpdatingStatus(true);
     
     // Tạo DTO theo đúng format Backend yêu cầu
     const statusData = {
       status: status,
       resolvedBy: 'admin',
       resolutionNote: note || 'Không có ghi chú'
     };

     console.log('Updating report status:', { reportId, status, statusData });
     
     // Sử dụng reportAPI thay vì fetch trực tiếp
     const updatedReport = await reportAPI.updateStatus(reportId, statusData);
     console.log('Updated report:', updatedReport);
     
     // Reload reports để cập nhật UI
     const reports = await reportAPI.getAll();
     dispatch(setReports(reports));
     
     message.success(`Cập nhật báo cáo thành công: ${status}`);
     
     // Nếu status là RESOLVED, hiển thị thông báo về việc kiểm tra khóa user
     if (status === 'RESOLVED') {
       message.info('Hệ thống sẽ tự động kiểm tra và khóa user nếu vi phạm nhiều lần');
     }
     
   } catch (error) {
     console.error('Update status error:', error);
     
     let errorMessage = 'Cập nhật báo cáo thất bại';
     if (error.response?.data?.message) {
       errorMessage = error.response.data.message;
     } else if (error.message) {
       errorMessage = `${errorMessage}: ${error.message}`;
     }
     
     message.error(errorMessage);
   } finally {
     setUpdatingStatus(false);
   }
 };


 const getTypeColor = (type) => {
   switch (type) {
     case 'BOOKING':
       return 'blue';
     case 'VIOLATION':
       return 'red';
     case 'WARRANTY':
       return 'green';
     default:
       return 'default';
   }
 };

 const getStatusColor = (status) => {
   switch (status) {
     case 'PENDING':
       return 'orange';
     case 'AWAITING_RESPONSE':
       return 'blue';
     case 'RESOLVED':
       return 'green';
     case 'REJECTED':
       return 'red';
     default:
       return 'default';
   }
 };

 const getTagColor = (tag) => {
   switch (tag) {
     case 'NO_SHOW':
       return 'red';
     case 'LATE':
       return 'yellow';
     case 'RUDE':
       return 'red';
     case 'ISSUE':
       return 'yellow';
     case 'OTHER':
       return 'default';
     case 'WARRANTY_DENIED':
       return 'green';
     case 'WARRANTY_DELAY':
       return 'green';
     case 'POOR_FIX':
       return 'orange';
     default:
       return 'default';
   }
 };


 const columns = [
   {
     title: 'Vấn đề',
     dataIndex: 'type',
     key: 'type',
     render: (type) => {
       return (
         <div className="d-flex align-items-center">
           <div className="me-2" style={{ 
               width: '8px', 
               height: '8px', 
               borderRadius: '50%',
               backgroundColor: getTypeColor(type) === 'blue' ? '#1890ff' : 
                              getTypeColor(type) === 'red' ? '#ff4d4f' : 
                              getTypeColor(type) === 'green' ? '#52c41a' : '#6c757d'
           }}></div>
           <span style={{ 
               color: getTypeColor(type) === 'blue' ? '#1890ff' : 
                      getTypeColor(type) === 'red' ? '#ff4d4f' : 
                      getTypeColor(type) === 'green' ? '#52c41a' : '#6c757d',
               fontWeight: '500',
               fontSize: '13px',
               textTransform: 'uppercase',
               letterSpacing: '0.5px'
           }}>
             {type === 'BOOKING' ? 'Đặt lịch' : 
              type === 'VIOLATION' ? 'Vi phạm' : 
              type === 'WARRANTY' ? 'Bảo hành' : type}
           </span>
         </div>
       );
     },
   },
   {
     title: 'Tag',
     dataIndex: 'tag',
     key: 'tag',
     render: (tag) => {
       if (!tag) return '-';
       
       return (
         <Tag color={getTagColor(tag)}>
           {tag === 'NO_SHOW' ? 'Không xuất hiện' :
            tag === 'LATE' ? 'Đến muộn' :
            tag === 'RUDE' ? 'Thô lỗ' :
            tag === 'ISSUE' ? 'Vấn đề' :
            tag === 'OTHER' ? 'Khác' :
            tag === 'WARRANTY_DENIED' ? 'Từ chối bảo hành' :
            tag === 'WARRANTY_DELAY' ? 'Chậm bảo hành' :
            tag === 'POOR_FIX' ? 'Sửa chữa kém' :
            tag.replace(/_/g, ' ')}
         </Tag>
       );
     },
   },
   {
     title: 'Mô tả',
     dataIndex: 'description',
     key: 'description',
     render: (text) => (
       <div style={{ maxWidth: 300 }}>
         {text?.length > 100 ? `${text.substring(0, 100)}...` : text}
       </div>
     ),
   },
   {
     title: 'Trạng thái',
     dataIndex: 'status',
     key: 'status',
     render: (status) => (
       <Tag color={getStatusColor(status)}>
         {status === 'PENDING' ? 'Đang chờ' : 
          status === 'AWAITING_RESPONSE' ? 'Chờ phản hồi' : 
          status === 'RESOLVED' ? 'Đã giải quyết' : 
          status === 'REJECTED' ? 'Đã từ chối' : 
          status?.replace(/_/g, ' ').toUpperCase()}
       </Tag>
     ),
   },
   {
    title: 'Người báo cáo',
    dataIndex: 'reporterId',
    key: 'reporterId',
    render: (userId) => (
      <Space>
        <UserOutlined />
        <span>{userMap[userId] || userId || ""}</span>
      </Space>
    ),
  },
   
   {
     title: 'Hành động',
     key: 'actions',
     render: (_, record) => (
       <Space>
        {record.status === 'PENDING' && (
          <>
            <Button 
              type="primary" 
              className="management-action-btn"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusAction(record.id, 'RESOLVED')}
              style={{ marginLeft: 8, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Đồng ý
            </Button>
            <Button 
              type="primary" 
              className="management-action-btn"
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusAction(record.id, 'REJECTED')}
              style={{ marginLeft: 8 }}
              danger
            >
              Từ chối
            </Button>
          </>
        )}
         <Button className="management-action-btn" size="middle" onClick={() => handleViewReportDetails(record)}>
           <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
         </Button>
         
       </Space>
     ),
   },
 ];


 const isUserMapReady = filteredReports.every(r => (!r.reportedUserId || userMap[r.reportedUserId]) && (!r.reporterId || userMap[r.reporterId]));


 // Set export data và columns
 useEffect(() => {
   const exportColumns = [
     { title: 'Loại báo cáo', dataIndex: 'Loại báo cáo' },
     { title: 'Tag', dataIndex: 'Tag' },
     { title: 'Trạng thái', dataIndex: 'Trạng thái' },
     { title: 'Người báo cáo', dataIndex: 'Người báo cáo' },
     { title: 'Người bị báo cáo', dataIndex: 'Người bị báo cáo' },
     { title: 'Số lần bị report', dataIndex: 'Số lần bị report' },
     { title: 'Thời gian tạo', dataIndex: 'Thời gian tạo' },
   ];

   const exportData = filteredReports.map((report) => {
     // Đếm số lần user này bị report
     const reportCount = filteredReports.filter(
       r => r.reportedUserId === report.reportedUserId
     ).length;
     
     return {
       'Loại báo cáo': report.type === 'BOOKING' ? 'Đặt lịch' : 
                       report.type === 'VIOLATION' ? 'Vi phạm' : 
                       report.type === 'WARRANTY' ? 'Bảo hành' : report.type || '',
       'Tag': report.tag === 'NO_SHOW' ? 'Không xuất hiện' :
              report.tag === 'LATE' ? 'Đến muộn' :
              report.tag === 'RUDE' ? 'Thô lỗ' :
              report.tag === 'ISSUE' ? 'Vấn đề' :
              report.tag === 'OTHER' ? 'Khác' :
              report.tag === 'WARRANTY_DENIED' ? 'Từ chối bảo hành' :
              report.tag === 'WARRANTY_DELAY' ? 'Chậm bảo hành' :
              report.tag === 'POOR_FIX' ? 'Sửa chữa kém' :
              report.tag || '',
       'Trạng thái': report.status === 'PENDING' ? 'Đang chờ' : 
                     report.status === 'AWAITING_RESPONSE' ? 'Chờ phản hồi' : 
                     report.status === 'RESOLVED' ? 'Đã giải quyết' : 
                     report.status === 'REJECTED' ? 'Đã từ chối' : report.status || '',
       'Người báo cáo': userMap[report.reporterId] || report.reporterId || '',
       'Người bị báo cáo': userMap[report.reportedUserId] || report.reportedUserId || '',
       'Số lần bị report': reportCount,
       'Thời gian tạo': formatDateTime(report.createdAt),
     };
   });

   createExportData(exportData, exportColumns, 'reports_export', 'Reports');
 }, [filteredReports, userMap]);


 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <Card>
         {/* Stats Cards */}
         <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Tổng báo cáo</h5>
                 <h3 style={{ color: '#1890ff', margin: 0 }}>{reportStats.total}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đang chờ</h5>
                 <h3 style={{ color: '#faad14', margin: 0 }}>{reportStats.pending}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đã giải quyết</h5>
                 <h3 style={{ color: '#52c41a', margin: 0 }}>{reportStats.resolved}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đã từ chối</h5>
                 <h3 style={{ color: '#ff4d4f', margin: 0 }}>{reportStats.rejected}</h3>
               </div>
             </Card>
           </Col>
         </Row>


         {/* Filter Controls */}
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
                   placeholder="Tìm kiếm theo các mô tả"
                   value={filters.search || ''}
                   onChange={e => handleFilterChange('search', e.target.value)}
                 />
               </div>
             </div>
             <Select
               placeholder="Vấn đề"
               value={filters.type || undefined}
               onChange={value => handleFilterChange('type', value)}
               style={{ width: 160 }}
               allowClear
             >
               <Option value="BOOKING">
                 <div className="d-flex align-items-center">
                   <div className="me-2" style={{ 
                       width: '8px', 
                       height: '8px', 
                       borderRadius: '50%',
                       backgroundColor: '#1890ff'
                   }}></div>
                   <span style={{ 
                       color: '#1890ff',
                       fontWeight: '500',
                       fontSize: '13px',
                       textTransform: 'uppercase',
                       letterSpacing: '0.5px'
                   }}>
                     Đặt lịch
                   </span>
                 </div>
               </Option>
               <Option value="VIOLATION">
                 <div className="d-flex align-items-center">
                   <div className="me-2" style={{ 
                       width: '8px', 
                       height: '8px', 
                       borderRadius: '50%',
                       backgroundColor: '#ff4d4f'
                   }}></div>
                   <span style={{ 
                       color: '#ff4d4f',
                       fontWeight: '500',
                       fontSize: '13px',
                       textTransform: 'uppercase',
                       letterSpacing: '0.5px'
                   }}>
                     Vi phạm
                   </span>
                 </div>
               </Option>
               <Option value="WARRANTY">
                 <div className="d-flex align-items-center">
                   <div className="me-2" style={{ 
                       width: '8px', 
                       height: '8px', 
                       borderRadius: '50%',
                       backgroundColor: '#52c41a'
                   }}></div>
                   <span style={{ 
                       color: '#52c41a',
                       fontWeight: '500',
                       fontSize: '13px',
                       textTransform: 'uppercase',
                       letterSpacing: '0.5px'
                   }}>
                     Bảo hành
                   </span>
                 </div>
               </Option>
             </Select>
             <Select
               placeholder="Trạng thái"
               value={filters.status || undefined}
               onChange={value => handleFilterChange('status', value)}
               style={{ width: 150 }}
               allowClear
             >
               <Option value="PENDING">Đang chờ</Option>
               <Option value="AWAITING_RESPONSE">Chờ phản hồi</Option>
               <Option value="RESOLVED">Đã giải quyết</Option>
               <Option value="REJECTED">Đã từ chối</Option>
             </Select>
           </div>
           <div className="d-flex align-items-center" style={{ gap: 12 }}>
             <span className="sort-label" style={{ marginRight: 8, fontWeight: 500, color: '#222', fontSize: 15 }}>Sắp xếp:</span>
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
         {(filters.search || filters.type || filters.status) && (
           <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
             <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
             {filters.search && (
               <span className="badge bg-primary-transparent">
                 <i className="ti ti-search me-1"></i>
                 Tìm kiếm: "{filters.search}"
               </span>
             )}
             {filters.type && (
               <span className="badge bg-info-transparent">
                 <i className="ti ti-alert-circle me-1"></i>
                 Vấn đề: <span className="ms-1" style={{ 
                     color: getTypeColor(filters.type) === 'blue' ? '#1890ff' : 
                            getTypeColor(filters.type) === 'red' ? '#ff4d4f' : 
                            getTypeColor(filters.type) === 'green' ? '#52c41a' : '#6c757d',
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
                         backgroundColor: getTypeColor(filters.type) === 'blue' ? '#1890ff' : 
                                        getTypeColor(filters.type) === 'red' ? '#ff4d4f' : 
                                        getTypeColor(filters.type) === 'green' ? '#52c41a' : '#6c757d'
                     }}></span>
                     {filters.type === 'BOOKING' ? 'Đặt lịch' : 
                      filters.type === 'VIOLATION' ? 'Vi phạm' : 
                      filters.type === 'WARRANTY' ? 'Bảo hành' : filters.type}
                   </span>
                 </span>
               </span>
             )}
             {filters.status && (
               <span className="badge bg-warning-transparent">
                 <i className="ti ti-filter me-1"></i>
                 Trạng thái: {filters.status === 'PENDING' ? 'Đang chờ' : 
                              filters.status === 'AWAITING_RESPONSE' ? 'Chờ phản hồi' : 
                              filters.status === 'RESOLVED' ? 'Đã giải quyết' : 
                              filters.status === 'REJECTED' ? 'Đã từ chối' : 
                              filters.status?.replace(/_/g, ' ').toUpperCase()}
               </span>
             )}
             <button 
               className="btn btn-sm btn-outline-secondary"
               onClick={() => {
                 dispatch(clearFilters());
               }}
             >
               <i className="ti ti-x me-1"></i>
               Xóa tất cả
             </button>
           </div>
         )}

         {/* Reports Table */}
         <Table
           columns={columns}
           dataSource={isUserMapReady ? currentReports : []}
           rowKey="id"
           loading={loading || !isUserMapReady}
           pagination={false}
         />

         {/* Custom Pagination */}
         <div className="d-flex justify-content-between align-items-center mt-3">
           <div className="d-flex align-items-center gap-3">
             <div className="text-muted">
               Hiển thị {indexOfFirstReport + 1}-{Math.min(indexOfLastReport, filteredReports.length)} trong tổng số {filteredReports.length} báo cáo
             </div>
           </div>
           {/* Pagination Controls - Always show if there are reports */}
           {filteredReports.length > 0 && (
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
       </Card>


       {/* Report Details Modal */}
        {isModalVisible && selectedReport && (
          <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            title={null}
            width={960}
            styles={{ body: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
          >
            <div style={{ background: '#fff', borderRadius: 16 }}>
              <div style={{
                background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
                padding: '20px 24px',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <div className="me-2" style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%',
                        backgroundColor: getTypeColor(selectedReport.type) === 'blue' ? '#1890ff' : 
                                       getTypeColor(selectedReport.type) === 'red' ? '#ff4d4f' : 
                                       getTypeColor(selectedReport.type) === 'green' ? '#52c41a' : '#6c757d'
                    }}></div>
                    <span style={{ 
                        color: getTypeColor(selectedReport.type) === 'blue' ? '#1890ff' : 
                               getTypeColor(selectedReport.type) === 'red' ? '#ff4d4f' : 
                               getTypeColor(selectedReport.type) === 'green' ? '#52c41a' : '#6c757d',
                               fontWeight: '700',
                               fontSize: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                      {selectedReport.type === 'BOOKING' ? 'Đặt lịch' : 
                       selectedReport.type === 'VIOLATION' ? 'Vi phạm' : 
                       selectedReport.type === 'WARRANTY' ? 'Bảo hành' : 
                       selectedReport.type || 'BÁO CÁO'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Tag color={getStatusColor(selectedReport.status)}>
                      {selectedReport.status === 'PENDING' ? 'Đang chờ' : 
                       selectedReport.status === 'AWAITING_RESPONSE' ? 'Chờ phản hồi' : 
                       selectedReport.status === 'RESOLVED' ? 'Đã giải quyết' : 
                       selectedReport.status === 'REJECTED' ? 'Đã từ chối' : 
                       selectedReport.status?.replace(/_/g, ' ').toUpperCase()}
                    </Tag>
                  </div>
                </div>
                {selectedReport.id && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 15, color: 'black' }}>ID: {selectedReport.id}</span>
                          </div>
                        )}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  

                        {/* Title and Description full width */}
                  <div style={{ gridColumn: '1 / span 2' }}>
                    {selectedReport.title && (
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16,
                      }}>
                        <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Tiêu đề</div>
                        <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6, fontWeight: 600 }}>
                          {selectedReport.title}
                        </div>
                      </div>
                    )}
                    
                  </div>


                  {/* Overview */}
                  <div>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #f0f0f0',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Tổng quan</div>
                        <div style={{ display: 'grid', rowGap: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#8c8c8c' }}>Tag</span>
                            <span style={{ fontWeight: 600 }}>
                              <Tag color={getTagColor(selectedReport.tag)}>
                                {selectedReport.tag === 'NO_SHOW' ? 'Không xuất hiện' :
                                 selectedReport.tag === 'LATE' ? 'Đến muộn' :
                                 selectedReport.tag === 'RUDE' ? 'Thô lỗ' :
                                 selectedReport.tag === 'ISSUE' ? 'Vấn đề' :
                                 selectedReport.tag === 'OTHER' ? 'Khác' :
                                 selectedReport.tag === 'WARRANTY_DENIED' ? 'Từ chối bảo hành' :
                                 selectedReport.tag === 'WARRANTY_DELAY' ? 'Chậm bảo hành' :
                                 selectedReport.tag === 'POOR_FIX' ? 'Sửa chữa kém' :
                                 selectedReport.tag?.replace(/_/g, ' ').toUpperCase() || ''}
                              </Tag>
                            </span>
                          </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Thời gian tạo</span>
                          <span style={{ fontWeight: 600 }}>{formatDateTime(selectedReport.createdAt)}</span>
                        </div>
                        
                        {selectedReport.responseDeadline && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Hạn phản hồi</span>
                            <span style={{ fontWeight: 600 }}>{formatDateTime(selectedReport.responseDeadline)}</span>
                          </div>
                        )}
                        
                      </div>
                    </div>

                  </div>

                  {/* People */}
                  <div>
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #f0f0f0',
                      borderRadius: 12,
                      padding: 16,
                    }}>
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thông tin liên quan</div>
                      <div style={{ display: 'grid', rowGap: 12 }}>
                      {selectedReport.bookingCode && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Mã đơn hàng</span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedReport.bookingCode}</span>
                          </div>
                        )}
                        {selectedReport.warrantyId && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Warranty ID</span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedReport.warrantyId}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Người báo cáo</span>
                          <span style={{ fontWeight: 600 }}>{userMap[selectedReport.reporterId] || selectedReport.reporterId || ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Người bị báo cáo</span>
                          <span 
                            style={{ 
                              fontWeight: 600, 
                              color: '#1890ff', 
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => {
                              if (selectedReport.reportedUserId) {
                                handleViewUserDetails(selectedReport.reportedUserId);
                              } else {
                                message.error('Không có thông tin người bị báo cáo');
                              }
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#40a9ff'}
                            onMouseLeave={(e) => e.target.style.color = '#1890ff'}
                          >
                            <UserOutlined style={{ fontSize: '12px' }} />
                            {userMap[selectedReport.reportedUserId] || 'Không xác định'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / span 2' }}>
                  <div style={{
                      background: '#ffffff',
                      border: '1px solid #f0f0f0',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}>
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Mô tả</div>
                      <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                        {selectedReport.description || 'Không có mô tả'}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Note */}
                  {selectedReport.resolutionNote && (
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 16,
                      }}>
                        <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Ghi chú giải quyết</div>
                        <div style={{ background: '#f0f8ff', borderRadius: 8, padding: 12, lineHeight: 1.6, borderLeft: '4px solid #1890ff' }}>
                          {selectedReport.resolutionNote}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evidences */}
                  {selectedReport.evidences && selectedReport.evidences.length > 0 && (
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: 16,
                      }}>
                        <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Bằng chứng</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                          {selectedReport.evidences.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                              <img src={url} alt={`evidence-${idx}`} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

       {/* User Details Modal */}
       {isUserModalVisible && selectedUser && (
         <Modal
           open={isUserModalVisible}
           onCancel={() => setIsUserModalVisible(false)}
           footer={null}
           title={null}
           width={960}
           styles={{ body: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
         >
           <div style={{ background: '#fff', borderRadius: 16 }}>
             <div style={{
               background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
               padding: '20px 24px',
               color: '#fff'
             }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontSize: 20, fontWeight: 700 }}>
                   Chi tiết người dùng
                 </div>
                 <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                   {selectedUser}
                 </Tag>
               </div>
               {selectedUser && (
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontFamily: 'monospace', fontSize: 15, color: 'black' }}>ID: {selectedUser}</span>
                 </div>
               )}
             </div>
             <div style={{ padding: 24 }}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                 {/* User Info */}
                 <div>
                   <div style={{
                     background: '#ffffff',
                     border: '1px solid #f0f0f0',
                     borderRadius: 12,
                     padding: 16,
                     marginBottom: 16,
                   }}>
                     <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thông tin người dùng</div>
                     <div style={{ display: 'grid', rowGap: 10 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ color: '#8c8c8c' }}>Tên hiển thị</span>
                         <span style={{ fontWeight: 600 }}>{userMap[selectedUser] || 'N/A'}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ color: '#8c8c8c' }}>User ID</span>
                         <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedUser}</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Actions */}
                 <div>
                   <div style={{
                     background: '#ffffff',
                     border: '1px solid #f0f0f0',
                     borderRadius: 12,
                     padding: 16,
                   }}>
                     <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Hành động</div>
                     <div style={{ display: 'grid', rowGap: 12 }}>
                       <Button 
                         type="primary" 
                         icon={<UserOutlined />}
                         onClick={() => {
                           if (selectedUser) {
                             setIsUserModalVisible(false);
                             navigate(`/admin/user-management/${selectedUser}`);
                           } else {
                             message.error('Không có thông tin người dùng');
                           }
                         }}
                         style={{ width: '100%' }}
                       >
                         Xem chi tiết đầy đủ
                       </Button>
                       <Button 
                         type="default"
                         onClick={() => {
                           if (selectedUser) {
                             setIsUserModalVisible(false);
                             navigate(`/admin/user-management/${selectedUser}`);
                           } else {
                             message.error('Không có thông tin người dùng');
                           }
                         }}
                         style={{ width: '100%' }}
                       >
                         Mở User Detail
                       </Button>
                     </div>
                   </div>
                 </div>

                
               </div>
             </div>
           </div>
         </Modal>
       )}




     </div>
   </div>
 );
};


export default ReportManagement;

