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
 Divider
} from 'antd';
import {
 SearchOutlined,
 EyeOutlined,
 FileTextOutlined,
 UserOutlined,
 CalendarOutlined,
 ExclamationCircleOutlined
} from '@ant-design/icons';
import { reportAPI } from '../../features/reports/reportAPI';
import { setReports, setSelectedReport, setFilters, clearFilters, setLoading, setError } from '../../features/reports/reportSlice';
import { selectFilteredReports, selectReportFilters, selectReportStats } from '../../features/reports/reportSelectors';
import { userAPI } from '../../features/users/userAPI';


const { Option } = Select;


const ReportManagement = () => {
 const dispatch = useDispatch();
 const [selectedReport, setSelectedReport] = useState(null);
 const [isModalVisible, setIsModalVisible] = useState(false);
 const [userMap, setUserMap] = useState({});
 const [sortField, setSortField] = useState('createdAt');
 const [sortOrder, setSortOrder] = useState('desc');


 // Redux selectors
 const filteredReports = useSelector(selectFilteredReports);
 const filters = useSelector(selectReportFilters);
 const reportStats = useSelector(selectReportStats);
 const loading = useSelector(state => state.reports.loading);
 const error = useSelector(state => state.reports.error);


 // Load reports on component mount
 useEffect(() => {
   const fetchReports = async () => {
     try {
       dispatch(setLoading(true));
       const reports = await reportAPI.getAll();
       dispatch(setReports(reports));
     } catch (error) {
       dispatch(setError(error.message));
       message.error('Failed to load reports');
     } finally {
       dispatch(setLoading(false));
     }
   };


   fetchReports();
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


 const handleSortChange = (value) => {
   if (value === 'lasted') {
     setSortField('createdAt');
     setSortOrder('desc');
   } else if (value === 'oldest') {
     setSortField('createdAt');
     setSortOrder('asc');
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


 const getTypeColor = (type) => {
   switch (type) {
     case 'REPORT':
       return 'blue';
     default:
       return 'default';
   }
 };


 const columns = [
   {
     title: 'TYPE',
     dataIndex: 'type',
     key: 'type',
     render: (type) => (
       <Tag color={getTypeColor(type)} icon={<FileTextOutlined />}>
         {type}
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
     title: 'REPORTED USER',
     dataIndex: 'reportedUserId',
     key: 'reportedUserId',
     render: (userId) => (
       <Space>
         <UserOutlined />
         <span>{userMap[userId] || userId}</span>
       </Space>
     ),
   },
   {
     title: 'REPORTER',
     dataIndex: 'reporterId',
     key: 'reporterId',
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
     
     <Button className="management-action-btn" size="middle" onClick={() => handleViewReportDetails(record)}>
     <EyeOutlined style={{marginRight: 4}} />View Detail
   </Button>
     ),
   },
 ];


 const isUserMapReady = filteredReports.every(r => (!r.reportedUserId || userMap[r.reportedUserId]) && (!r.reporterId || userMap[r.reporterId]));


 // Sort reports theo sortField/sortOrder
 const sortedReports = [...filteredReports].sort((a, b) => {
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
                 <h5>Total Reports</h5>
                 <h3 style={{ color: '#1890ff', margin: 0 }}>{reportStats.total}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Pending</h5>
                 <h3 style={{ color: '#faad14', margin: 0 }}>{reportStats.pending}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Resolved</h5>
                 <h3 style={{ color: '#52c41a', margin: 0 }}>{reportStats.resolved}</h3>
               </div>
             </Card>
           </Col>
           <Col span={6}>
             <Card>
               <div style={{ textAlign: 'center' }}>
                 <h5>Rejected</h5>
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
                   placeholder="Search description"
                   value={filters.search || ''}
                   onChange={e => handleFilterChange('search', e.target.value)}
                 />
               </div>
             </div>
             <Select
               placeholder="Type"
               value={filters.type || undefined}
               onChange={value => handleFilterChange('type', value)}
               style={{ width: 130 }}
               allowClear
             >
               <Option value="REPORT">REPORT</Option>
               <Option value="VIOLATION">VIOLATION</Option>
             </Select>
             <Select
               placeholder="Status"
               value={filters.status || undefined}
               onChange={value => handleFilterChange('status', value)}
               style={{ width: 130 }}
               allowClear
             >
               <Option value="PENDING">PENDING</Option>
               <Option value="RESOLVED">RESOLVED</Option>
               <Option value="REJECTED">REJECTED</Option>
               <Option value="CONFIRMED">CONFIRMED</Option>
               <Option value="CLOSED">CLOSED</Option>
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


         {/* Reports Table */}
         <Table
           columns={columns}
           dataSource={isUserMapReady ? sortedReports : []}
           rowKey="id"
           loading={loading || !isUserMapReady}
           pagination={{
             total: filteredReports.length,
             pageSize: 10,
             showSizeChanger: true,
             showQuickJumper: true,
             showTotal: (total, range) =>
               `${range[0]}-${range[1]} of ${total} reports`,
           }}
         />
       </Card>


       {/* Report Details Modal */}
       {isModalVisible && selectedReport && (
         <Modal
           open={isModalVisible}
           onCancel={() => setIsModalVisible(false)}
           footer={null}
           title={null}
           width={600}
         >
           <div style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32}}>
             <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
               <div style={{flex: 1}}>
                 <div style={{fontSize: 22, fontWeight: 600, marginBottom: 4}}>
                   <span style={{marginRight: 12}}>{selectedReport.type}</span>
                   <Tag color={getStatusColor(selectedReport.status)} style={{fontSize: 14, padding: '2px 12px'}}>{selectedReport.status?.toUpperCase()}</Tag>
                 </div>
                 <div style={{fontSize: 15, color: '#888', marginBottom: 2}}>
                   <b>Penalty:</b> {selectedReport.penalty || 'Chưa có'}
                 </div>
               </div>
             </div>
             <div style={{borderTop: '1px solid #f0f0f0', marginBottom: 16}}></div>
             <div style={{marginBottom: 16}}>
               <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Description</div>
               <div>{selectedReport.description}</div>
             </div>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
               <div>
                 <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Reported User</div>
                 <div>{userMap[selectedReport.reportedUserId] || selectedReport.reportedUserId}</div>
               </div>
               <div>
                 <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Reporter</div>
                 <div>{userMap[selectedReport.reporterId] || selectedReport.reporterId}</div>
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

