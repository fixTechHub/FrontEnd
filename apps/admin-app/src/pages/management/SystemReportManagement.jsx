import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
 Divider,
 Popconfirm
} from 'antd';
import {
 SearchOutlined,
 EyeOutlined,
 FileTextOutlined,
 UserOutlined,
 CalendarOutlined,
 ExclamationCircleOutlined,
 CheckCircleOutlined,
 CloseCircleOutlined,
 EditOutlined as EditIcon
} from '@ant-design/icons';
import { systemReportAPI } from '../../features/systemreports/systemReportAPI';
import {
 setSystemReports,
 setSelectedSystemReport,
 setFilters,
 clearFilters,
 setLoading,
 setError,
 updateSystemReport
} from '../../features/systemreports/systemReportSlice';
import {
 selectFilteredSystemReports,
 selectSystemReportFilters,
 selectSystemReportStats
} from '../../features/systemreports/systemReportSelectors';
import { userAPI } from '../../features/users/userAPI';
import { selectReportStats } from '../../features/reports/reportSelectors';
import { createExportData, formatDateTime } from '../../utils/exportUtils';


const { Option } = Select;


const SystemReportManagement = () => {
 const dispatch = useDispatch();
 const [selectedSystemReport, setSelectedSystemReport] = useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [editingStatusId, setEditingStatusId] = useState(null);
 const [statusValue, setStatusValue] = useState('');
 const [showEditStatusModal, setShowEditStatusModal] = useState(false);
 const [userMap, setUserMap] = useState({});
 const [sortField, setSortField] = useState('createdAt');
 const [sortOrder, setSortOrder] = useState('desc');
 const [submittedByUser, setSubmittedByUser] = useState(null);
 const [adminUsers, setAdminUsers] = useState([]);
 const [resolvedBy, setResolvedBy] = useState('');
 const [resolutionNote, setResolutionNote] = useState('');


 // Redux selectors
 const filteredSystemReports = useSelector(selectFilteredSystemReports);
 const filters = useSelector(selectSystemReportFilters);
 const systemReportStats = useSelector(selectSystemReportStats);
 const loading = useSelector(state => state.systemReports.loading);
 const error = useSelector(state => state.systemReports.error);
 const reportStats = useSelector(selectReportStats);


 // Load system reports on component mount
 useEffect(() => {
   const fetchSystemReports = async () => {
     try {
       dispatch(setLoading(true));
       const systemReports = await systemReportAPI.getAll();
       dispatch(setSystemReports(systemReports));
     } catch (error) {
       dispatch(setError(error.message));
       message.error('Không thể tải thông tin');
     } finally {
       dispatch(setLoading(false));
     }
   };

   const fetchAdminUsers = async () => {
     try {
       const allUsers = await userAPI.getAll();
       
       const adminUsersList = allUsers.filter(user => 
         user.roleName === 'ADMIN' || 
         user.role === 'ADMIN' || 
         user.role === 'admin' ||
         user.roleName === 'admin'
       );
       
       setAdminUsers(adminUsersList);
     } catch (error) {
       console.error('Không thể tải thông tin các Admin:', error);
     }
   };

   fetchSystemReports();
   fetchAdminUsers();
 }, [dispatch]);


 useEffect(() => {
   // Lấy tên user cho tất cả submittedBy
   const fetchUserNames = async () => {
     const submittedByIds = Array.from(new Set((filteredSystemReports || []).map(r => r.submittedBy)));
     const resolvedByIds = Array.from(new Set((filteredSystemReports || []).map(r => r.resolvedBy)));
     const allUserIds = [...submittedByIds, ...resolvedByIds].filter(id => id);
     
     const userMapTemp = { ...userMap };
     await Promise.all(allUserIds.map(async (id) => {
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
   if (filteredSystemReports.length > 0) fetchUserNames();
   // eslint-disable-next-line
 }, [filteredSystemReports]);


   useEffect(() => {
    if (selectedSystemReport?.submittedBy) {
      userAPI.getById(selectedSystemReport.submittedBy)
        .then(user => setSubmittedByUser(user))
        .catch(() => setSubmittedByUser(null));
    }
  }, [selectedSystemReport?.submittedBy]);

  // Tự động xóa ResolvedBy và ResolutionNote khi status thay đổi thành PENDING hoặc IN_PROGRESS
  useEffect(() => {
    if (statusValue === 'PENDING' || statusValue === 'IN_PROGRESS') {
      setResolvedBy('');
      setResolutionNote('');
    }
  }, [statusValue]);


 const handleFilterChange = (filterType, value) => {
   dispatch(setFilters({ [filterType]: value }));
 };


 const handleClearFilters = () => {
   dispatch(clearFilters());
 };


 const handleViewSystemReportDetails = (systemReport) => {
   setSelectedSystemReport(systemReport);
   setIsModalVisible(true);
 };


 const handleUpdateStatus = async (id, newStatus, note, resolvedByUser) => {
   try {
     const updatedSystemReport = await systemReportAPI.updateStatus(id, newStatus, note, resolvedByUser);
     dispatch(updateSystemReport(updatedSystemReport));
     message.success(`Thay đổi trạng thái ${newStatus}`);
     return updatedSystemReport;
   } catch (error) {
     message.error('Cập nhật thất bại');
   }
 };


 const getStatusColor = (status) => {
   switch (status) {
     case 'pending':
       return 'orange';
     case 'resolved':
       return 'green';
     case 'rejected':
       return 'red';
     default:
       return 'default';
   }
 };


 const getTagColor = (tag) => {
   switch (tag) {
     case 'bug':
       return 'red';
     case 'feature':
       return 'blue';
     case 'improvement':
       return 'green';
     default:
       return 'default';
   }
 };


 const openEditStatusModal = (record) => {
   setEditingStatusId(record.id);
   setStatusValue(record.status || 'PENDING');
   setResolvedBy(record.resolvedBy || '');
   setResolutionNote(record.resolutionNote || '');
   setShowEditStatusModal(true);
 };

 const handleCloseEditModal = () => {
   setShowEditStatusModal(false);
   setEditingStatusId(null);
   setStatusValue('');
   setResolvedBy('');
   setResolutionNote('');
 };


   const handleSaveStatus = async () => {
    // Validation
    if (!statusValue) {
      message.error('Hãy chọn trạng thái');
      return;
    }
    
    if (statusValue === 'RESOLVED' && !resolvedBy) {
      message.error('Chọn Admin để xử lý thành công báo cáo');
      return;
    }
    
    if (statusValue === 'RESOLVED' && !resolutionNote.trim()) {
      message.error('Hãy nhập phương án giải quyết.');
      return;
    }
    
    if (statusValue === 'REJECTED' && !resolutionNote.trim()) {
      message.error('Hãy nhập lý do từ chối báo cáo');
      return;
    }
    
    if (editingStatusId && statusValue) {
      try {
        // Nếu status là PENDING hoặc IN_PROGRESS, xóa resolvedBy và resolutionNote
        const finalResolvedBy = (statusValue === 'PENDING' || statusValue === 'IN_PROGRESS') ? '' : resolvedBy;
        const finalResolutionNote = (statusValue === 'PENDING' || statusValue === 'IN_PROGRESS') ? '' : resolutionNote;
        
        await handleUpdateStatus(editingStatusId, statusValue.toUpperCase(), finalResolutionNote, finalResolvedBy);
        setShowEditStatusModal(false);
        setEditingStatusId(null);
        // Reset form
        setStatusValue('');
        setResolvedBy('');
        setResolutionNote('');
      } catch (error) {
        message.error('Không thể cập nhật trạng thái');
      }
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


 const columns = [
   {
     title: 'Tiêu đề',
     dataIndex: 'title',
     key: 'title',
     render: (text) => (
       <div style={{ maxWidth: 200, fontWeight: 500 }}>
         {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
       </div>
     ),
   },
   {
     title: 'Phân loại',
     dataIndex: 'tag',
     key: 'tag',
     render: (tag) => (
       <Tag color={getTagColor(tag)}>
         {tag?.toUpperCase()}
       </Tag>
     ),
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
          {String(status || '').replace(/_/g, ' ').toUpperCase()}
        </Tag>
      ),
   },
   {
     title: 'Người báo cáo',
     dataIndex: 'submittedBy',
     key: 'submittedBy',
     render: (userId) => (
       <Space>
         <UserOutlined />
         <span>{userMap[userId] || userId || "UNKNOWN"}</span>
       </Space>
     ),
   },
   {
     title: 'Hành động',
     key: 'actions',
     render: (_, record) => (
       <Space>
        <Button className="management-action-btn" type="default" icon={<EditIcon />} onClick={() => openEditStatusModal(record)}>
           Chỉnh sửa
         </Button>
         <Button className="management-action-btn" size="middle" onClick={() => handleViewSystemReportDetails(record)}>
     <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
   </Button>
         
       </Space>
     ),
   },
 ];


 const isUserMapReady = filteredSystemReports.every(r => !r.submittedBy || userMap[r.submittedBy]);


 // Sort system reports theo sortField/sortOrder
 const sortedSystemReports = [...filteredSystemReports].sort((a, b) => {
   if (sortField === 'createdAt') {
     const dateA = new Date(a.createdAt);
     const dateB = new Date(b.createdAt);
     return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
   }
   return 0;
 });

 // Set export data và columns
 useEffect(() => {
   const exportColumns = [
     { title: 'Tiêu đề', dataIndex: 'title' },
     { title: 'Mô tả', dataIndex: 'description' },
     { title: 'Phân loại', dataIndex: 'tag' },
     { title: 'Trạng thái', dataIndex: 'status' },
     { title: 'Người báo cáo', dataIndex: 'submittedBy' },
     { title: 'Thời gian tạo', dataIndex: 'createdAt' },
   ];

   const exportData = sortedSystemReports.map(report => ({
     title: report.title,
     description: report.description,
     tag: report.tag,
     status: report.status?.toUpperCase(),
     submittedBy: userMap[report.submittedBy] || report.submittedBy,
     createdAt: formatDateTime(report.createdAt),
     updatedAt: formatDateTime(report.updatedAt),
   }));

   createExportData(exportData, exportColumns, 'system_reports_export', 'System Reports');
 }, [sortedSystemReports, userMap]);


 return (
   <div className="modern-page- wrapper">
     <div className="modern-content-card">
       <Card>
         {/* Stats Cards */}
         <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Tông báo cáo hệ thống</h5>
                 <h3 style={{ color: '#1890ff', margin: 0 }}>{systemReportStats.total}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đang chờ</h5>
                 <h3 style={{ color: '#faad14', margin: 0 }}>{systemReportStats.pending}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đã giải quyết</h5>
                 <h3 style={{ color: '#52c41a', margin: 0 }}>{systemReportStats.resolved}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Đã từ chối</h5>
                 <h3 style={{ color: '#ff4d4f', margin: 0 }}>{systemReportStats.rejected}</h3>
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
                   placeholder="Tìm kiếm tiêu đề, mô tả"
                   value={filters.search || ''}
                   onChange={e => handleFilterChange('search', e.target.value)}
                 />
               </div>
             </div>
             <Select
               placeholder="Phân loại"
               value={filters.tag || undefined}
               onChange={value => handleFilterChange('tag', value)}
               style={{ width: 130 }}
               allowClear
             >
               <Option value="SYSTEM">SYSTEM</Option>
               <Option value="PAYMENT">PAYMENT</Option>
               <Option value="UI">UI</Option>
               <Option value="OTHER">OTHER</Option>
               
             </Select>
             <Select
               placeholder="Trạng thái"
               value={filters.status || undefined}
               onChange={value => handleFilterChange('status', value)}
               style={{ width: 130 }}
               allowClear
             >
               <Option value="PENDING">PENDING</Option>
               <Option value="IN_PROGRESS">IN PROGRESS</Option>
               <Option value="RESOLVED">RESOLVED</Option>
               <Option value="REJECTED">REJECTED</Option>
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


         {/* System Reports Table */}
         <Table
           columns={columns}
           dataSource={isUserMapReady ? sortedSystemReports : []}
           rowKey="id"
           loading={loading || !isUserMapReady}
           pagination={{
             total: filteredSystemReports.length,
             pageSize: 10,
             showSizeChanger: true,
             showQuickJumper: true,
             showTotal: (total, range) =>
               `${range[0]}-${range[1]} of ${total} system reports`,
           }}
         />
       </Card>


        {/* System Report Details Modal */}
        {isModalVisible && selectedSystemReport && (
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
                background: 'linear-gradient(135deg, #1890ff 0%, #73d13d 100%)',
                padding: '20px 24px',
                color: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {selectedSystemReport.title || 'SYSTEM REPORT'}
                  </div>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                    {selectedSystemReport.tag?.toUpperCase()}
                  </Tag>
                </div>
                {selectedSystemReport.id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14 }}>ID: {selectedSystemReport.id}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
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
                          <span style={{ color: '#8c8c8c' }}>Trạng thái</span>
                          <span style={{ fontWeight: 600 }}>{(selectedSystemReport.status ? String(selectedSystemReport.status).replace(/_/g, ' ').toUpperCase() : 'N/A')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Thời gian tạo</span>
                          <span style={{ fontWeight: 600 }}>{formatDateTime(selectedSystemReport.createdAt)}</span>
                        </div>
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
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Các bên liên quan</div>
                      <div style={{ display: 'grid', rowGap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Người báo cáo</span>
                          <span style={{ fontWeight: 600 }}>{userMap[selectedSystemReport.submittedBy] || selectedSystemReport.submittedBy || ''}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Người xử lý</span>
                          <span style={{ fontWeight: 600 }}>{userMap[selectedSystemReport.resolvedBy] || selectedSystemReport.resolvedBy || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Description full width */}
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
                        {selectedSystemReport.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  {/* Resolution Note full width if any */}
                  {selectedSystemReport.resolutionNote && (
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: 16,
                      }}>
                        <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Ghi chú</div>
                        <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                          {selectedSystemReport.resolutionNote}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}


       {/* Modal Edit Status */}
       <Modal
         title="Cập nhật báo cáo"
         open={showEditStatusModal}
         onCancel={handleCloseEditModal}
         onOk={handleSaveStatus}
         okText="Xác nhận"
         cancelText="Hủy"
         width={600}
         okButtonProps={{
           disabled: !statusValue || 
             (statusValue === 'RESOLVED' && (!resolvedBy || !resolutionNote.trim())) ||
             (statusValue === 'REJECTED' && (!resolvedBy || !resolutionNote.trim()))
         }}
       >
         <div style={{ marginBottom: 16 }}>
           <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
             Trạng thái <span style={{ color: 'red' }}>*</span>
           </label>
           <Select
             value={statusValue}
             style={{ width: '100%' }}
             onChange={setStatusValue}
             placeholder="Select status"
           >
             <Option value="PENDING">PENDING</Option>
             <Option value="IN_PROGRESS">IN PROGRESS</Option>
             <Option value="RESOLVED">RESOLVED</Option>
             <Option value="REJECTED">REJECTED</Option>
           </Select>
         </div>
         
         <div style={{ marginBottom: 16 }}>
           <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
             Người xử lý (Admin) 
             {(statusValue === 'RESOLVED' || statusValue === 'REJECTED') && <span style={{ color: 'red' }}>*</span>}
           </label>
           <Select
             value={resolvedBy}
             style={{ width: '100%' }}
             onChange={setResolvedBy}
             placeholder="Chọn Admin xử lý"
             allowClear
             disabled={statusValue !== 'RESOLVED' && statusValue !== 'REJECTED'}
           >
             {adminUsers.map(user => (
               <Option key={user.id} value={user.id}>
                 {user.fullName || user.email} ({user.roleName || user.role})
               </Option>
             ))}
           </Select>
           {(statusValue === 'RESOLVED' || statusValue === 'REJECTED') && !resolvedBy && (
             <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
               Hãy chọn Admin xử lý báo cáo
             </div>
           )}
         </div>
         
         <div style={{ marginBottom: 16 }}>
           <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
             Phương án giải quyết
             {(statusValue === 'RESOLVED' || statusValue === 'REJECTED') && <span style={{ color: 'red' }}>*</span>}
           </label>
           <Input.TextArea
             value={resolutionNote}
             onChange={(e) => setResolutionNote(e.target.value)}
             placeholder={
               statusValue === 'RESOLVED' ? "Hãy nhập phương án giải quyết..." :
               statusValue === 'REJECTED' ? "Hãy nhập lý do từ chối giải quyết..." :
               "Enter note (optional)..."
             }
             rows={4}
             style={{ width: '100%' }}
             disabled={statusValue !== 'RESOLVED' && statusValue !== 'REJECTED'}
           />
           {statusValue === 'RESOLVED' && !resolutionNote.trim() && (
             <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
               Hãy nhập phương án giải quyết
             </div>
           )}
           {statusValue === 'REJECTED' && !resolutionNote.trim() && (
             <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
               Hãy nhập lý do từ chối giải quyết
             </div>
           )}
         </div>
       </Modal>
     </div>
   </div>
 );
};


export default SystemReportManagement;

