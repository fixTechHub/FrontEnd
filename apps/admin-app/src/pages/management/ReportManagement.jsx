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

const { Option } = Select;

const ReportManagement = () => {
  const dispatch = useDispatch();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
          <span>{userId}</span>
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
          <span>{userId}</span>
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

  return (
    <div className="page-wrapper">
      <div className="content me-4">
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
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Input
                placeholder="Search reports..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                allowClear
              />
            </Col>
            <Col span={5}>
              <Select
                value={filters.type}
                onChange={(value) => handleFilterChange('type', value)}
                style={{ width: '100%' }}
                placeholder="Filter by Type"
                allowClear
              >
                <Option value="REPORT">Report</Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                style={{ width: '100%' }}
                placeholder="Filter by Status"
                allowClear
              >
                <Option value="pending">Pending</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </Space>
            </Col>
          </Row>

          {/* Reports Table */}
          <Table
            columns={columns}
            dataSource={filteredReports}
            rowKey="id"
            loading={loading}
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
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedReport.id}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={getTypeColor(selectedReport.type)}>
                  {selectedReport.type}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedReport.status)}>
                  {selectedReport.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reported User ID">
                {selectedReport.reportedUserId}
              </Descriptions.Item>
              <Descriptions.Item label="Reporter ID">
                {selectedReport.reporterId}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedReport.description}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(selectedReport.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(selectedReport.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ReportManagement; 