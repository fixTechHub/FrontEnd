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
  const [localSortOrder, setLocalSortOrder] = useState('lasted'); // Thêm local sort state

  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);

  // Local loading states cho từng loại operation
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);

  // State cho date range picker
  const [dateRange, setDateRange] = useState(null);

  // Sync local sort state with Redux state
  useEffect(() => {
    if (pagination?.sortDescending !== undefined) {
      setLocalSortOrder(pagination.sortDescending ? 'lasted' : 'oldest');
    }
  }, [pagination?.sortDescending]);

  // Sync local search state with Redux filters
  useEffect(() => {
    setSearchText(filters.search || '');
  }, [filters.search]);

  // Handle search with debouncing
  const handleSearch = (searchValue) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      dispatch(setFilters({ search: searchValue }));
      setSearchLoading(true);
      
      // Không gọi API filter nữa, chỉ dùng local filter
      setSearchLoading(false);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    handleSearch(value);
  };

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
      case 'AWAITING_CONFIRM':
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

  // Get status display text in Vietnamese
  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'WAITING_CONFIRM':
        return 'Chờ xác nhận';
      case 'AWAITING_CONFIRM':
        return 'Chờ xác nhận';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'DONE':
        return 'Hoàn thành';
      case 'AWAITING_DONE':
        return 'Chờ hoàn thành';
      case 'CONFIRM_ADDITIONAL':
        return 'Xác nhận bổ sung';
      case 'WAITING_CUSTOMER_CONFIRM_ADDITIONAL':
        return 'Chờ khách hàng xác nhận bổ sung';
      case 'WAITING_TECHNICIAN_CONFIRM_ADDITIONAL':
        return 'Chờ kỹ thuật viên xác nhận bổ sung';
      default:
        return status;
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(getAllBookingStatusLogs());
  }, [dispatch]);

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Cleanup filters when component unmounts
  useEffect(() => {
    return () => {
      // Reset filters when leaving the page
      dispatch(clearFilters());
      // Reset local states
      setSearchText('');
      setDateRange(null);
      setCurrentPage(1);
    };
  }, [dispatch]);

  const handleDateRangeFilter = async (dates) => {
    setDateRange(dates); // Cập nhật local state
    
    if (!dates || dates.length === 0) {
      dispatch(setFilters({ fromDate: null, toDate: null }));
      return;
    }

    const [fromDate, toDate] = dates;
    
    dispatch(setFilters({ 
      fromDate: fromDate?.toDate(), 
      toDate: toDate?.toDate() 
    }));
    
    // Không gọi API filter, chỉ dùng local filter
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
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Mã đơn hàng</span>
        </div>
      ),
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 120,
      render: (bookingCode) => (
        <div style={{ 
          fontFamily: 'monospace', 
          fontWeight: '600', 
          color: '#1890ff',
          fontSize: '13px'
        }}>
          {bookingCode || ''}
        </div>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Thay đổi trạng thái</span>
        </div>
      ),
      key: 'statusChange',
      width: 180,
      render: (_, record) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '4px 0'
        }}>
          <Tag 
            color={getStatusColor(record.fromStatus)} 
            style={{ 
              margin: 0, 
              fontSize: '11px', 
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {getStatusDisplayText(record.fromStatus)}
          </Tag>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#8c8c8c',
            fontSize: '12px'
          }}>
            <i className="ti ti-arrow-right" style={{ fontSize: '10px' }}></i>
          </div>
          <Tag 
            color={getStatusColor(record.toStatus)} 
            style={{ 
              margin: 0, 
              fontSize: '11px', 
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {getStatusDisplayText(record.toStatus)}
          </Tag>
        </div>
      )
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Người thay đổi</span>
        </div>
      ),
      key: 'changedBy',
      width: 160,
      render: (_, record) => (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          padding: '4px 0'
        }}>
          <Tag 
            color={getRoleColor(record.role)} 
            style={{ 
              margin: 0, 
              fontSize: '10px', 
              padding: '1px 6px',
              borderRadius: '4px',
              alignSelf: 'flex-start'
            }}
          >
            {record.role || ''}
          </Tag>
          <div style={{ 
            fontSize: '12px', 
            color: '#262626',
            fontWeight: '500',
            lineHeight: '1.2'
          }}>
            {record.changedByUserName || record.changedBy || ''}
          </div>
        </div>
      )
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Thời gian</span>
        </div>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (createdAt) => (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '2px',
          padding: '4px 0'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#262626'
          }}>
            {dayjs(createdAt).format('DD/MM/YYYY')}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#8c8c8c'
          }}>
            {dayjs(createdAt).format('HH:mm')}
          </div>
        </div>
      )
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Hành động</span>
        </div>
      ),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        < Button className="management-action-btn" size="middle" onClick={() => showLogDetail(record)}>
          <EyeOutlined style={{marginRight: 4}} />Xem chi tiết
        </Button>
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
      <div className="modern-page- wrapper">
        <div className="modern-content-card">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h4 className="mb-1">Lịch sử trạng thái đơn hàng</h4>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                  <li className="breadcrumb-item active">Lịch sử trạng thái đơn hàng</li>
                </ol>
              </nav>
            </div>
          </div>

            {/* Header Actions */}
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
                      placeholder="Tìm kiếm đơn hàng..."
                      value={searchText}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(searchText);
                        }
                      }}
                    />
                    {searchLoading && (
                      <span className="input-icon-right">
                        <Spin size="small" />
                      </span>
                    )}
                  </div>
                </div>
                <RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange}
                  onChange={handleDateRangeFilter}
                  style={{ width: 200, marginRight: 8 }}
                  disabled={filterLoading}
                />
                {filterLoading && (
                  <Spin size="small" style={{ marginRight: 8 }} />
                )}
                <Select
                  placeholder="Từ trạng thái"
                  value={filters.fromStatus || undefined}
                  onChange={(value) => {
                    dispatch(setFilters({ fromStatus: value }));
                    // Không gọi API filter, chỉ dùng local filter
                  }}
                  allowClear
                  style={{ width: 250, marginRight: 8 }}
                >
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="CONFIRMED">Đã xác nhận</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                  <Option value="AWAITING_DONE">Chờ hoàn thành</Option>
                  <Option value="WAITING_CONFIRM">Chờ xác nhận</Option>
                  <Option value="DONE">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                  <Option value="CONFIRM_ADDITIONAL">Xác nhận bổ sung</Option>
                  <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">Chờ khách hàng xác nhận bổ sung</Option>
                  <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">Chờ kỹ thuật viên xác nhận bổ sung</Option>
                </Select>
                <Select
                  placeholder="Đến trạng thái"
                  value={filters.toStatus || undefined}
                  onChange={(value) => {
                    dispatch(setFilters({ toStatus: value }));
                    // Không gọi API filter, chỉ dùng local filter
                  }}
                  allowClear
                  style={{ width: 250, marginRight: 8 }}
                >
                  <Option value="PENDING">Chờ xử lý</Option>
                  <Option value="CONFIRMED">Đã xác nhận</Option>
                  <Option value="IN_PROGRESS">Đang thực hiện</Option>
                  <Option value="AWAITING_DONE">Chờ hoàn thành</Option>
                  <Option value="WAITING_CONFIRM">Chờ xác nhận</Option>
                  <Option value="DONE">Hoàn thành</Option>
                  <Option value="CANCELLED">Đã hủy</Option>
                  <Option value="CONFIRM_ADDITIONAL">Xác nhận bổ sung</Option>
                  <Option value="WAITING_CUSTOMER_CONFIRM_ADDITIONAL">Chờ khách hàng xác nhận bổ sung</Option>
                  <Option value="WAITING_TECHNICIAN_CONFIRM_ADDITIONAL">Chờ kỹ thuật viên xác nhận bổ sung</Option>
                </Select>
              </div>
              <div className="d-flex align-items-center">
                <span style={{ marginRight: 8, fontWeight: 500 }}>Sắp xếp:</span>
                <Select
                  value={localSortOrder}
                  style={{ width: 120 }}
                  onChange={(value) => {
                    const newSortDescending = value === 'lasted';
                    console.log('Sort changed:', value, 'sortDescending:', newSortDescending);
                    
                    // Cập nhật local state ngay lập tức
                    setLocalSortOrder(value);
                    
                    // Cập nhật pagination state
                    dispatch(setPagination({ 
                      ...pagination, 
                      sortDescending: newSortDescending,
                      currentPage: 1 
                    }));
                    
                    // Cập nhật sort state
                    dispatch(setSortBy('createdAt'));
                    dispatch(setSortOrder(newSortDescending ? 'desc' : 'asc'));
                    
                    // Không gọi API, chỉ dùng local sort
                  }}
                  options={[
                    { value: 'lasted', label: 'Mới nhất' },
                    { value: 'oldest', label: 'Cũ nhất' },
                  ]}
                />
              </div>
            </div>

            {/* Filter Info */}
            {(searchText || filters.fromStatus || filters.toStatus || filters.fromDate || filters.toDate) && (
              <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
                <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
                {searchText && (
                  <span className="badge bg-primary-transparent">
                    <i className="ti ti-search me-1"></i>
                    Tìm kiếm: "{searchText}"
                  </span>
                )}
                {filters.fromStatus && (
                  <span className="badge bg-info-transparent">
                    <i className="ti ti-arrow-right me-1"></i>
                    Từ trạng thái: {getStatusDisplayText(filters.fromStatus)}
                  </span>
                )}
                {filters.toStatus && (
                  <span className="badge bg-warning-transparent">
                    <i className="ti ti-arrow-left me-1"></i>
                    Đến trạng thái: {getStatusDisplayText(filters.toStatus)}
                  </span>
                )}
                {filters.fromDate && (
                  <span className="badge bg-success-transparent">
                    <i className="ti ti-calendar me-1"></i>
                    Từ ngày: {dayjs(filters.fromDate).format('DD/MM/YYYY')}
                  </span>
                )}
                {filters.toDate && (
                  <span className="badge bg-success-transparent">
                    <i className="ti ti-calendar me-1"></i>
                    Đến ngày: {dayjs(filters.toDate).format('DD/MM/YYYY')}
                  </span>
                )}
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    dispatch(clearFilters());
                    setSearchText('');
                    setDateRange(null); // Reset date range picker
                    // Không gọi getAll, giữ nguyên dữ liệu gốc
                  }}
                >
                  <i className="ti ti-x me-1"></i>
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Action Buttons Row
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Space>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                  >
                    Xóa
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchData}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row> */}

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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                              {getStatusDisplayText(selectedLog.fromStatus) || ''}
                            </Tag>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Đến trạng thái</span>
                            <Tag color={getStatusColor(selectedLog.toStatus)} style={{ fontSize: 12, fontWeight: 600 }}>
                              {getStatusDisplayText(selectedLog.toStatus) || ''}
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
                            <Tag color={getRoleColor(selectedLog.role)} style={{ fontSize: '12', fontWeight: '600' }}>
                              {selectedLog.role}
                            </Tag>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Người thay đổi</span>
                            <span style={{ fontWeight: '600' }}>{selectedLog.changedByUserName || selectedLog.changedBy || ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8c8c8c' }}>Thời gian thay đổi</span>
                            <span style={{ fontWeight: '600' }}>{dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
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
                            <div style={{ fontWeight: '600', marginBottom: 4 }}>Ghi chú:</div>
                            <div style={{ color: '#262626' }}>{selectedLog.note || 'Không có ghi chú'}</div>
                          </div>
                          {selectedLog.bookingDescription && (
                            <div>
                              <div style={{ fontWeight: '600', marginBottom: 4 }}>Mô tả đơn hàng:</div>
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




        </div>
      </div>
  );
};

export default BookingStatusLogManagement;