import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllBookingStatusLogs, 
  getFilteredBookingStatusLogs,
  getBookingStatusLogsByDateRange,
  setFilters,
  setPagination,
  setSortBy,
  setSortOrder,
  clearFilters
} from '../../features/bookingStatusLogs/bookingStatusLogSlice';
import {
  selectAllBookingStatusLogs,
  selectBookingStatusLogsLoading,
  selectBookingStatusLogsError,
  selectBookingStatusLogsFilters,
  selectBookingStatusLogsPagination,
  selectSortedBookingStatusLogs
} from '../../features/bookingStatusLogs/bookingStatusLogSelectors';
import { 
  Table, 
  Input, 
  Button, 
  Space, 
  Card, 
  Row, 
  Col, 
  DatePicker, 
  Select, 
  Tag, 
  Modal, 
  Descriptions, 
  Spin, 
  message,
  Tooltip,
  Typography
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  FilterOutlined,
  ClearOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import "../../styles/ManagementTableStyle.css";

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

const BookingStatusLogManagement = () => {
  const dispatch = useDispatch();
  const logs = useSelector(selectSortedBookingStatusLogs);
  const loading = useSelector(selectBookingStatusLogsLoading);
  const error = useSelector(selectBookingStatusLogsError);
  const filters = useSelector(selectBookingStatusLogsFilters);
  const pagination = useSelector(selectBookingStatusLogsPagination);

  const [searchText, setSearchText] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  // Status colors mapping
  const getStatusColor = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'default';
      case 'CONFIRMED':
        return 'processing';
      case 'IN_PROGRESS':
        return 'blue';
      case 'AWAITING DONE':
      case 'WAITING CONFIRM':
        return 'gold';
      case 'DONE':
        return 'green';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

  // Role colors mapping
  const getRoleColor = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'admin':
        return 'red';
      case 'technician':
        return 'blue';
      case 'customer':
        return 'green';
      default:
        return 'default';
    }
  };

  // Format status display - remove underscores and capitalize
  const formatStatusDisplay = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchText !== filters.search) {
      dispatch(setFilters({ search: searchText }));
    }
  }, [searchText, filters.search, dispatch]);

  const fetchData = async () => {
    try {
      await dispatch(getAllBookingStatusLogs()).unwrap();
    } catch (error) {
      message.error('Failed to fetch booking status logs');
      console.error('Error fetching data:', error);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilter = () => {
    const filterData = {
      ...filters,
      page: 1,
      pageSize: pagination.pageSize,
      sortBy: 'createdAt',
      sortDescending: true
    };
    
    dispatch(getFilteredBookingStatusLogs(filterData));
    setFilterModalVisible(false);
  };

  const handleDateRangeFilter = (dates) => {
    if (dates && dates.length === 2) {
      const [fromDate, toDate] = dates;
      dispatch(getBookingStatusLogsByDateRange({ 
        fromDate: fromDate.toDate(), 
        toDate: toDate.toDate() 
      }));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchText('');
    fetchData();
  };

  const handleTableChange = (paginationInfo, filters, sorter) => {
    if (sorter.field) {
      dispatch(setSortBy(sorter.field));
      dispatch(setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc'));
    }
    
    if (paginationInfo.current !== pagination.currentPage) {
      dispatch(setPagination({ currentPage: paginationInfo.current }));
    }
    
    if (paginationInfo.pageSize !== pagination.pageSize) {
      dispatch(setPagination({ pageSize: paginationInfo.pageSize, currentPage: 1 }));
    }
  };

  const showLogDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const totalPages = Math.ceil(logs.length / logsPerPage);

  // Sorted logs for current page
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filters]);

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 100,
    },
    {
      title: 'Trạng thái',
      key: 'statusChange',
      width: 200,
             render: (_, record) => (
         <Space direction="vertical" size="small">
           <Tag color={getStatusColor(record.fromStatus)}>
             {formatStatusDisplay(record.fromStatus)}
           </Tag>
           <span>→</span>
           <Tag color={getStatusColor(record.toStatus)}>
             {formatStatusDisplay(record.toStatus)}
           </Tag>
         </Space>
       )
    },
    {
      title: 'Người thay đổi',
      key: 'changedBy',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getRoleColor(record.role)} icon={<UserOutlined />}>
            {record.role || ''}
          </Tag>
          <Text>{record.changedByUserName || record.changedBy || ''}</Text>
        </Space>
      )
    },
    {
      title: 'Thời gian thay đổi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (createdAt) => (
        <span>{dayjs(createdAt).format('DD/MM/YYYY HH:mm')}</span>
            
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
            <Button className="management-action-btn" size="middle"
              icon={<EyeOutlined />}  
              onClick={() => showLogDetail(record)}
            > Xem chi tiết</Button>
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4} type="danger">Error: {error}</Title>
          <Button type="primary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="management-container">
      <Card title="Lịch sử trạng thái đơn hàng" className="management-card">
        {/* Header Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm kiếm lịch sử"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={handleDateRangeFilter}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setFilterModalVisible(true)}
              style={{ width: '100%' }}
            >
              Bộ lọc nâng cao
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
              >
                Làm mới
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Xóa
              </Button>
            </Space>
          </Col>
        </Row>

                 {/* Table */}
         <Table
           columns={columns}
           dataSource={currentLogs}
           rowKey="id"
           loading={loading}
           pagination={false}
                  />

         {/* Custom Pagination */}
         <div className="d-flex justify-content-between align-items-center mt-3">
           <div className="d-flex align-items-center gap-3">
             <div className="text-muted">
               Hiển thị {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, logs.length)} trong tổng số {logs.length} lịch sử trạng thái
             </div>
           </div>
           {/* Pagination Controls - Always show if there are logs */}
           {logs.length > 0 && (
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

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <Modal
          open={showDetailModal}
          onCancel={() => setShowDetailModal(false)}
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
                  Chi tiết lịch sử trạng thái
                </div>
              </div>
              {selectedLog.id && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 15 }}>ID: {selectedLog.id}</span>
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
                        <span style={{ color: '#8c8c8c' }}>Mã đơn hàng</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedLog.bookingCode || ''}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Từ trạng thái</span>
                        <Tag color={getStatusColor(selectedLog.fromStatus)} style={{ fontSize: 12, fontWeight: 600 }}>
                          {formatStatusDisplay(selectedLog.fromStatus) || ''}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Đến trạng thái</span>
                        <Tag color={getStatusColor(selectedLog.toStatus)} style={{ fontSize: 12, fontWeight: 600 }}>
                          {formatStatusDisplay(selectedLog.toStatus) || 'N/A'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Change */}
                <div>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #f0f0f0',
                    borderRadius: 12,
                    padding: 16,
                  }}>
                    <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Thay đổi trạng thái</div>
                    <div style={{ display: 'grid', rowGap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Vai trò</span>
                        <Tag color={getRoleColor(selectedLog.role)} style={{ fontSize: 12, fontWeight: 600 }}>
                          {selectedLog.role}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Người thay đổi</span>
                        <span style={{ fontWeight: 600 }}>{selectedLog.changedByUserName || selectedLog.changedBy || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Thời gian thay đổi</span>
                        <span style={{ fontWeight: 600 }}>{dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* Note Details full width */}
                <div style={{ gridColumn: '1 / span 2' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #f0f0f0',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: '#8c8c8c', marginBottom: 8 }}>Ghi chú thay đổi</div>
                    <div style={{ background: '#fafafa', borderRadius: 8, padding: 12, lineHeight: 1.6 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Ghi chú:</div>
                        <div style={{ color: '#262626' }}>{selectedLog.note || 'Không có ghi chú'}</div>
                      </div>
                      {selectedLog.bookingDescription && (
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>Mô tả đơn hàng:</div>
                          <div style={{ color: '#262626' }}>{selectedLog.bookingDescription}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        title="Advanced Filters"
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        onOk={handleFilter}
        width={600}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <label>Booking ID:</label>
            <Input
              placeholder="Enter booking ID"
              value={filters.bookingId}
              onChange={(e) => dispatch(setFilters({ bookingId: e.target.value }))}
            />
          </Col>
          <Col span={12}>
            <label>Changed By:</label>
            <Input
              placeholder="Enter user ID"
              value={filters.changedBy}
              onChange={(e) => dispatch(setFilters({ changedBy: e.target.value }))}
            />
          </Col>
          <Col span={12}>
            <label>Role:</label>
            <Select
              placeholder="Select role"
              value={filters.role}
              onChange={(value) => dispatch(setFilters({ role: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="ADMINADMIN">Admin</Option>
              <Option value="TECHNICIAN">Technician</Option>
              <Option value="CUSTOMER">Customer</Option>
            </Select>
          </Col>
          <Col span={12}>
            <label>From Status:</label>
            <Select
              placeholder="Select status"
              value={filters.fromStatus}
              onChange={(value) => dispatch(setFilters({ fromStatus: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="IN_PROGRESS">IN PROGRESS</Option>
              <Option value="AWAITING_DONE">AWAITING DONE</Option>
              <Option value="WAITING_CONFIRM">WAITING CONFIRM</Option>
              <Option value="AWAITING_CONFIRM">AWAITING CONFIRM</Option>
              <Option value="DONE">DONE</Option>
              <Option value="CANCELLED">CANCELLED</Option>
              <Option value="CONFIRM_ADDITIONAL">CONFIRM ADDITIONAL</Option>
              <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">WAITING CUSTOMER CONFIRM ADDITIONAL</Option>
              <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">WAITING TECHNICIAN CONFIRM ADDITIONAL</Option>
            </Select>
          </Col>
          <Col span={12}>
            <label>To Status:</label>
            <Select
              placeholder="Select status"
              value={filters.toStatus}
              onChange={(value) => dispatch(setFilters({ toStatus: value }))}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="CONFIRMED">CONFIRMED</Option>
              <Option value="IN_PROGRESS">IN PROGRESS</Option>
              <Option value="AWAITING_DONE">AWAITING DONE</Option>
              <Option value="WAITING_CONFIRM">WAITING CONFIRM</Option>
              <Option value="AWAITING_CONFIRM">AWAITING CONFIRM</Option>
              <Option value="DONE">DONE</Option>
              <Option value="CANCELLED">CANCELLED</Option>
              <Option value="CONFIRM_ADDITIONAL">CONFIRM ADDITIONAL</Option>
              <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">WAITING CUSTOMER CONFIRM ADDITIONAL</Option>
              <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">WAITING TECHNICIAN CONFIRM ADDITIONAL</Option>
            </Select>
          </Col>
          <Col span={12}>
            <label>Date Range:</label>
            <RangePicker
              value={filters.fromDate && filters.toDate ? [
                dayjs(filters.fromDate),
                dayjs(filters.toDate)
              ] : null}
              onChange={(dates) => {
                if (dates && dates.length === 2) {
                  dispatch(setFilters({
                    fromDate: dates[0].toDate(),
                    toDate: dates[1].toDate()
                  }));
                } else {
                  dispatch(setFilters({ fromDate: null, toDate: null }));
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default BookingStatusLogManagement;