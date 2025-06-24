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
  CloseCircleOutlined
} from '@ant-design/icons';
import { systemReportAPI } from '../../features/systemReports/systemReportAPI';
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

const { Option } = Select;

const SystemReportManagement = () => {
  const dispatch = useDispatch();
  const [selectedSystemReport, setSelectedSystemReport] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Redux selectors
  const filteredSystemReports = useSelector(selectFilteredSystemReports);
  const filters = useSelector(selectSystemReportFilters);
  const systemReportStats = useSelector(selectSystemReportStats);
  const loading = useSelector(state => state.systemReports.loading);
  const error = useSelector(state => state.systemReports.error);

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
      const updatedSystemReport = await systemReportAPI.updateStatus(id, newStatus);
      dispatch(updateSystemReport(updatedSystemReport));
      message.success(`Status updated to ${newStatus}`);
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
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewSystemReportDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Resolve this report?"
                description="Are you sure you want to mark this as resolved?"
                onConfirm={() => handleUpdateStatus(record.id, 'resolved')}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Resolve
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject this report?"
                description="Are you sure you want to reject this report?"
                onConfirm={() => handleUpdateStatus(record.id, 'rejected')}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                >
                  Reject
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
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
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Input
              placeholder="Search system reports..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col span={5}>
            <Select
              value={filters.tag}
              onChange={(value) => handleFilterChange('tag', value)}
              style={{ width: '100%' }}
              placeholder="Filter by Tag"
              allowClear
            >
              <Option value="bug">Bug</Option>
              <Option value="feature">Feature</Option>
              <Option value="improvement">Improvement</Option>
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

        {/* System Reports Table */}
        <Table
          columns={columns}
          dataSource={filteredSystemReports}
          rowKey="id"
          loading={loading}
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
      <Modal
        title="System Report Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedSystemReport && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{selectedSystemReport.id}</Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedSystemReport.title}
            </Descriptions.Item>
            <Descriptions.Item label="Tag">
              <Tag color={getTagColor(selectedSystemReport.tag)}>
                {selectedSystemReport.tag?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedSystemReport.status)}>
                {selectedSystemReport.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Submitted By">
              {selectedSystemReport.submittedBy}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedSystemReport.description}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedSystemReport.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(selectedSystemReport.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SystemReportManagement; 