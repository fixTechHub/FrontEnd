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
     title: 'CREATED AT',
     dataIndex: 'createdAt',
     key: 'createdAt',
     render: (date) => (
       <Space>
         <CalendarOutlined />
         <span>{new Date(date).toLocaleDateString()}</span>
       </Space>
     ),
   },
   {
     title: 'ACTIONS',
     key: 'actions',
     render: (_, record) => (
       <Button
         type="primary"
         icon={<EyeOutlined />}
         onClick={() => handleViewReportDetails(record)}
       >
         View Details
       </Button>
     ),
   },
 ];


 const isUserMapReady = filteredReports.every(r => (!r.reportedUserId || userMap[r.reportedUserId]) && (!r.reporterId || userMap[r.reporterId]));


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
           dataSource={isUserMapReady ? filteredReports : []}
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
       <Modal
         title="Report Details"
         open={isModalVisible}
         onCancel={() => setIsModalVisible(false)}
         footer={[
           <Button key="close" onClick={() => setIsModalVisible(false)}>
             Close
           </Button>,
         ]}
         width={800}
       >
         {selectedReport && (
           <Descriptions bordered column={1} size="middle">
             <Descriptions.Item label="ID">{selectedReport.id}</Descriptions.Item>
             <Descriptions.Item label="Type">{selectedReport.type}</Descriptions.Item>
             <Descriptions.Item label="Status">{selectedReport.status?.toUpperCase()}</Descriptions.Item>
             <Descriptions.Item label="Reported User">{userMap[selectedReport.reportedUserId] || selectedReport.reportedUserId}</Descriptions.Item>
             <Descriptions.Item label="Reporter">{userMap[selectedReport.reporterId] || selectedReport.reporterId}</Descriptions.Item>
             <Descriptions.Item label="Description">{selectedReport.description}</Descriptions.Item>
             <Descriptions.Item label="Created At">{new Date(selectedReport.createdAt).toLocaleString()}</Descriptions.Item>
             <Descriptions.Item label="Updated At">{new Date(selectedReport.updatedAt).toLocaleString()}</Descriptions.Item>
           </Descriptions>
         )}
       </Modal>
     </div>
   </div>
 );
};


export default ReportManagement;

