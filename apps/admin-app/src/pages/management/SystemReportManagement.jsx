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
} from '../../features/systemReports/systemReportSlice';
import {
 selectFilteredSystemReports,
 selectSystemReportFilters,
 selectSystemReportStats
} from '../../features/systemReports/systemReportSelectors';
import { userAPI } from '../../features/users/userAPI';
import { selectReportStats } from '../../features/reports/reportSelectors';


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
       message.error('Failed to load system reports');
     } finally {
       dispatch(setLoading(false));
     }
   };


   fetchSystemReports();
 }, [dispatch]);


 useEffect(() => {
   // Lấy tên user cho tất cả submittedBy
   const fetchUserNames = async () => {
     const userIds = Array.from(new Set((filteredSystemReports || []).map(r => r.submittedBy)));
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


 const handleUpdateStatus = async (id, newStatus) => {
   try {
     const updatedSystemReport = await systemReportAPI.updateStatus(id, statusValue);
     console.log('API trả về từ updateStatus:', updatedSystemReport);
     dispatch(updateSystemReport(updatedSystemReport));
     message.success(`Status updated to ${newStatus}`);
     return updatedSystemReport;
   } catch (error) {
     message.error('Failed to update status');
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
   setStatusValue(record.status);
   setShowEditStatusModal(true);
 };


 const handleSaveStatus = async () => {
   if (editingStatusId && statusValue) {
     await handleUpdateStatus(editingStatusId, statusValue.toUpperCase());
     setShowEditStatusModal(false);
     setEditingStatusId(null);
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
     title: 'TITLE',
     dataIndex: 'title',
     key: 'title',
     render: (text) => (
       <div style={{ maxWidth: 200, fontWeight: 500 }}>
         {text?.length > 50 ? `${text.substring(0, 50)}...` : text}
       </div>
     ),
   },
   {
     title: 'TAG',
     dataIndex: 'tag',
     key: 'tag',
     render: (tag) => (
       <Tag color={getTagColor(tag)}>
         {tag?.toUpperCase()}
       </Tag>
     ),
   },
   {
     title: 'DESCRIPTION',
     dataIndex: 'description',
     key: 'description',
     render: (text) => (
       <div style={{ maxWidth: 300 }}>
         {text?.length > 100 ? `${text.substring(0, 100)}...` : text}
       </div>
     ),
   },
   {
     title: 'STATUS',
     dataIndex: 'status',
     key: 'status',
     render: (status) => (
       <Tag color={getStatusColor(status)}>
         {status?.toUpperCase()}
       </Tag>
     ),
   },
   {
     title: 'SUBMITTED BY',
     dataIndex: 'submittedBy',
     key: 'submittedBy',
     render: (userId) => (
       <Space>
         <UserOutlined />
         <span>{userMap[userId] || userId}</span>
       </Space>
     ),
   },
   {
     title: 'ACTIONS',
     key: 'actions',
     render: (_, record) => (
       <Space>
         <Button
           type="primary"
           icon={<EyeOutlined />}
           onClick={() => handleViewSystemReportDetails(record)}
         >
           View
         </Button>
         <Button
           type="default"
           icon={<EditIcon />}
           onClick={() => openEditStatusModal(record)}
         >
           Edit
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


 return (
   <div className="modern-page-wrapper">
     <div className="modern-content-card">
       <Card>
         {/* Stats Cards */}
         <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Total System Reports</h5>
                 <h3 style={{ color: '#1890ff', margin: 0 }}>{systemReportStats.total}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Pending</h5>
                 <h3 style={{ color: '#faad14', margin: 0 }}>{systemReportStats.pending}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Resolved</h5>
                 <h3 style={{ color: '#52c41a', margin: 0 }}>{systemReportStats.resolved}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Rejected</h5>
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
                   placeholder="Search title, description"
                   value={filters.search || ''}
                   onChange={e => handleFilterChange('search', e.target.value)}
                 />
               </div>
             </div>
             <Select
               placeholder="Tag"
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
               placeholder="Status"
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
             <span className="sort-label" style={{ marginRight: 8, fontWeight: 500, color: '#222', fontSize: 15 }}>Sort by:</span>
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
           title="System Report Details"
           width={600}
         >
           <Descriptions bordered column={1} size="middle">
             <Descriptions.Item label="Title">{selectedSystemReport.title}</Descriptions.Item>
             <Descriptions.Item label="Tag">{selectedSystemReport.tag}</Descriptions.Item>
             <Descriptions.Item label="Status">{selectedSystemReport.status}</Descriptions.Item>
             <Descriptions.Item label="Description">{selectedSystemReport.description}</Descriptions.Item>
             <Descriptions.Item label="Submitted By">{userMap[selectedSystemReport.submittedBy] || selectedSystemReport.submittedBy}</Descriptions.Item>
             <Descriptions.Item label="Resolved By">{selectedSystemReport.resolvedBy || "Chưa có"}</Descriptions.Item>
             <Descriptions.Item label="Resolution Note">{selectedSystemReport.resolutionNote || "Chưa có"}</Descriptions.Item>
           </Descriptions>
         </Modal>
       )}


       {/* Modal Edit Status */}
       <Modal
         title="Edit Status"
         open={showEditStatusModal}
         onCancel={() => setShowEditStatusModal(false)}
         onOk={handleSaveStatus}
         okText="Save"
         cancelText="Cancel"
       >
         <div style={{ marginBottom: 16 }}>
           <Select
             value={statusValue}
             style={{ width: '100%' }}
             onChange={setStatusValue}
           >
             <Option value="PENDING">PENDING</Option>
             <Option value="IN_PROGRESS">IN PROGRESS</Option>
             <Option value="RESOLVED">RESOLVED</Option>
             <Option value="REJECTED">REJECTED</Option>
           </Select>
         </div>
       </Modal>
     </div>
   </div>
 );
};


export default SystemReportManagement;

