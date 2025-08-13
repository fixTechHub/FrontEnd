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
import { createExportData, formatDateTime } from '../../utils/exportUtils';


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
         <span>{userMap[userId] || userId || "UNKNOWN"}</span>
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
         <span>{userMap[userId] || userId || "UNKNOWN"}</span>
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

 // Set export data và columns
 useEffect(() => {
   const exportColumns = [
     { title: 'Report Type', dataIndex: 'type' },
     { title: 'Description', dataIndex: 'description' },
     { title: 'Reporter', dataIndex: 'reporterName' },
     { title: 'Reported User', dataIndex: 'reportedUserName' },
     { title: 'Status', dataIndex: 'status' },
     { title: 'Created At', dataIndex: 'createdAt' },
     { title: 'Updated At', dataIndex: 'updatedAt' },
   ];

   const exportData = sortedReports.map(report => ({
     type: report.type,
     description: report.description,
     reporterName: userMap[report.reporterId] || report.reporterId,
     reportedUserName: userMap[report.reportedUserId] || report.reportedUserId,
     status: report.status?.toUpperCase(),
     createdAt: formatDateTime(report.createdAt),
     updatedAt: formatDateTime(report.updatedAt),
   }));

   createExportData(exportData, exportColumns, 'reports_export', 'Reports');
 }, [sortedReports, userMap]);


 return (
   <div className="modern-page- wrapper">
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
               <Option value="WARRANTY">WARRANTY</Option>
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
                    {selectedReport.type || 'REPORT'}
                  </div>
                  <Tag style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                    {selectedReport.status?.toUpperCase()}
                  </Tag>
                </div>
                {selectedReport.id && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 15 }}>Report ID: {selectedReport.id}</span>
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
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Overview</div>
                      <div style={{ display: 'grid', rowGap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Penalty</span>
                          <span style={{ fontWeight: 600 }}>{selectedReport.penalty || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Created At</span>
                          <span style={{ fontWeight: 600 }}>{formatDateTime(selectedReport.createdAt)}</span>
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
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>People</div>
                      <div style={{ display: 'grid', rowGap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Reported User</span>
                          <span style={{ fontWeight: 600 }}>{userMap[selectedReport.reportedUserId] || selectedReport.reportedUserId || 'UNKNOWN'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8c8c8c' }}>Reporter</span>
                          <span style={{ fontWeight: 600 }}>{userMap[selectedReport.reporterId] || selectedReport.reporterId || 'UNKNOWN'}</span>
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
                      <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Description</div>
                      <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                        {selectedReport.description || 'No description'}
                      </div>
                    </div>
                  </div>

                  {selectedReport.evidenceUrls && selectedReport.evidenceUrls.length > 0 && (
                    <div style={{ gridColumn: '1 / span 2' }}>
                      <div style={{
                        background: '#ffffff',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        padding: 16,
                      }}>
                        <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Evidence</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                          {selectedReport.evidenceUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer">
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
     </div>
   </div>
 );
};


export default ReportManagement;

