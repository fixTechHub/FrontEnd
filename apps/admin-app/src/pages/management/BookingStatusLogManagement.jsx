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
  Typography,
  Statistic,
  Divider,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  FilterOutlined,
  ClearOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  TrendingUpOutlined,
  BarChartOutlined
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

  // Calculate statistics
  const getStats = () => {
    const totalLogs = logs.length;
    const todayLogs = logs.filter(log => 
      dayjs(log.createdAt).isSame(dayjs(), 'day')
    ).length;
    const thisWeekLogs = logs.filter(log => 
      dayjs(log.createdAt).isAfter(dayjs().subtract(7, 'day'))
    ).length;
    const thisMonthLogs = logs.filter(log => 
      dayjs(log.createdAt).isAfter(dayjs().subtract(30, 'day'))
    ).length;

    return { totalLogs, todayLogs, thisWeekLogs, thisMonthLogs };
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
      width: 120,
      render: (text) => (
        <Text code style={{ fontSize: '12px', fontWeight: 600 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Thay đổi trạng thái',
      key: 'statusChange',
      width: 220,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={getStatusColor(record.fromStatus)} style={{ margin: 0 }}>
            {formatStatusDisplay(record.fromStatus)}
          </Tag>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#8c8c8c',
            fontSize: '12px'
          }}>
            <TrendingUpOutlined style={{ marginRight: 4 }} />
            →
          </div>
          <Tag color={getStatusColor(record.toStatus)} style={{ margin: 0 }}>
            {formatStatusDisplay(record.toStatus)}
          </Tag>
        </div>
      )
    },
    {
      title: 'Người thay đổi',
      key: 'changedBy',
      width: 180,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color={getRoleColor(record.role)} style={{ margin: 0 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.role || ''}
          </Tag>
          <Text style={{ fontSize: '12px' }}>
            {record.changedByUserName || record.changedBy || ''}
          </Text>
        </div>
      )
    },
    {
      title: 'Thời gian thay đổi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      render: (createdAt) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '12px' }} />
          <Text style={{ fontSize: '12px' }}>
            {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          icon={<EyeOutlined />}  
          onClick={() => showLogDetail(record)}
          style={{ 
            borderRadius: '6px',
            height: '28px',
            fontSize: '12px'
          }}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  const stats = getStats();

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
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px 24px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HistoryOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Lịch sử trạng thái đơn hàng
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '16px' }}>
                Theo dõi và quản lý tất cả thay đổi trạng thái đơn hàng
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title="Tổng số lịch sử"
              value={stats.totalLogs}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title="Hôm nay"
              value={stats.todayLogs}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title="Tuần này"
              value={stats.thisWeekLogs}
              prefix={<TrendingUpOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic
              title="Tháng này"
              value={stats.thisMonthLogs}
              prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card 
        className="management-card"
        style={{ 
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Header Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Tìm kiếm lịch sử..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
              style={{ borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={handleDateRangeFilter}
              style={{ width: '100%', borderRadius: '8px' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={() => setFilterModalVisible(true)}
              style={{ 
                width: '100%',
                borderRadius: '8px',
                height: '40px'
              }}
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
                style={{ borderRadius: '8px', height: '40px' }}
              >
                Làm mới
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                style={{ borderRadius: '8px', height: '40px' }}
              >
                Xóa lọc
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <div style={{ 
          background: '#fafafa', 
          borderRadius: '12px', 
          padding: '16px',
          marginBottom: '24px'
        }}>
          <Table
            columns={columns}
            dataSource={currentLogs}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="middle"
            style={{ background: 'transparent' }}
            rowClassName={(record, index) => 
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </div>

        {/* Custom Pagination */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
            Hiển thị {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, logs.length)} trong tổng số {logs.length} lịch sử trạng thái
          </div>
          
          {/* Pagination Controls */}
          {logs.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                size="small"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ borderRadius: '6px' }}
              >
                Trước
              </Button>
              
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                if (totalPages <= 7) {
                  return (
                    <Button
                      key={i}
                      size="small"
                      type={currentPage === pageNumber ? 'primary' : 'default'}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{ 
                        borderRadius: '6px',
                        minWidth: '32px'
                      }}
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                
                if (
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={i}
                      size="small"
                      type={currentPage === pageNumber ? 'primary' : 'default'}
                      onClick={() => handlePageChange(pageNumber)}
                      style={{ 
                        borderRadius: '6px',
                        minWidth: '32px'
                      }}
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  pageNumber === currentPage - 2 || 
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span key={i} style={{ 
                      padding: '4px 8px',
                      color: '#8c8c8c'
                    }}>
                      ...
                    </span>
                  );
                }
                return null;
              })}
              
              <Button 
                size="small"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ borderRadius: '6px' }}
              >
                Sau
              </Button>
            </div>
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
              padding: '24px',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700 }}>
                  Chi tiết lịch sử trạng thái
                </div>
                <Badge 
                  count={selectedLog.id} 
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              <Row gutter={[24, 24]}>
                {/* Overview */}
                <Col span={12}>
                  <Card
                    title="Tổng quan"
                    style={{ 
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0'
                    }}
                    headStyle={{ 
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ display: 'grid', rowGap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8c8c8c' }}>Mã đơn hàng</span>
                        <Text code style={{ fontSize: '14px', fontWeight: 600 }}>
                          {selectedLog.bookingCode || ''}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Từ trạng thái</span>
                        <Tag color={getStatusColor(selectedLog.fromStatus)} style={{ fontSize: '12px', fontWeight: 600 }}>
                          {formatStatusDisplay(selectedLog.fromStatus) || ''}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Đến trạng thái</span>
                        <Tag color={getStatusColor(selectedLog.toStatus)} style={{ fontSize: '12px', fontWeight: 600 }}>
                          {formatStatusDisplay(selectedLog.toStatus) || 'N/A'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Status Change */}
                <Col span={12}>
                  <Card
                    title="Thay đổi trạng thái"
                    style={{ 
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0'
                    }}
                    headStyle={{ 
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ display: 'grid', rowGap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8c8c8c' }}>Vai trò</span>
                        <Tag color={getRoleColor(selectedLog.role)} style={{ fontSize: '12px', fontWeight: 600 }}>
                          {selectedLog.role}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8c8c8c' }}>Người thay đổi</span>
                        <span style={{ fontWeight: 600 }}>{selectedLog.changedByUserName || selectedLog.changedBy || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#8c8c8c' }}>Thời gian thay đổi</span>
                        <span style={{ fontWeight: 600 }}>{dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* Note Details full width */}
                <Col span={24}>
                  <Card
                    title="Ghi chú thay đổi"
                    style={{ 
                      borderRadius: '12px',
                      border: '1px solid #f0f0f0'
                    }}
                    headStyle={{ 
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <div style={{ 
                      background: '#fafafa', 
                      borderRadius: '8px', 
                      padding: '16px',
                      lineHeight: 1.6 
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#262626' }}>Ghi chú:</div>
                        <div style={{ color: '#595959' }}>
                          {selectedLog.note || 'Không có ghi chú'}
                        </div>
                      </div>
                      {selectedLog.bookingDescription && (
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#262626' }}>Mô tả đơn hàng:</div>
                          <div style={{ color: '#595959' }}>{selectedLog.bookingDescription}</div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FilterOutlined style={{ color: '#1890ff' }} />
            Bộ lọc nâng cao
          </div>
        }
        open={filterModalVisible}
        onCancel={() => setFilterModalVisible(false)}
        onOk={handleFilter}
        width={700}
        okText="Áp dụng"
        cancelText="Hủy"
        okButtonProps={{ style: { borderRadius: '8px' } }}
        cancelButtonProps={{ style: { borderRadius: '8px' } }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mã đơn hàng:</label>
            <Input
              placeholder="Nhập mã đơn hàng"
              value={filters.bookingId}
              onChange={(e) => dispatch(setFilters({ bookingId: e.target.value }))}
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col span={12}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Người thay đổi:</label>
            <Input
              placeholder="Nhập ID người dùng"
              value={filters.changedBy}
              onChange={(e) => dispatch(setFilters({ changedBy: e.target.value }))}
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col span={12}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Vai trò:</label>
            <Select
              placeholder="Chọn vai trò"
              value={filters.role}
              onChange={(value) => dispatch(setFilters({ role: value }))}
              allowClear
              style={{ width: '100%' }}
              dropdownStyle={{ borderRadius: '8px' }}
            >
              <Option value="ADMINADMIN">Admin</Option>
              <Option value="TECHNICIAN">Technician</Option>
              <Option value="CUSTOMER">Customer</Option>
            </Select>
          </Col>
          <Col span={12}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Từ trạng thái:</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filters.fromStatus}
              onChange={(value) => dispatch(setFilters({ fromStatus: value }))}
              allowClear
              style={{ width: '100%' }}
              dropdownStyle={{ borderRadius: '8px' }}
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
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Đến trạng thái:</label>
            <Select
              placeholder="Chọn trạng thái"
              value={filters.toStatus}
              onChange={(value) => dispatch(setFilters({ toStatus: value }))}
              allowClear
              style={{ width: '100%' }}
              dropdownStyle={{ borderRadius: '8px' }}
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
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Khoảng thời gian:</label>
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
              style={{ width: '100%', borderRadius: '6px' }}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default BookingStatusLogManagement;
