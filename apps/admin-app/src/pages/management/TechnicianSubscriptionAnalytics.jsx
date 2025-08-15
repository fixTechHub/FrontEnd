import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  Select, 
  Space, 
  Tag, 
  Button,
  Table,
  Progress,
  Typography
} from 'antd';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  UserOutlined, 
  DollarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { fetchAllSubscriptions, fetchSubscriptionStats } from '../../features/technicianSubscription/technicianSubscriptionSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/analytics.css';

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  BarElement,
  ArcElement,
  RadialLinearScale
);

const TechnicianSubscriptionAnalytics = () => {
  const dispatch = useDispatch();
  const { subscriptions, stats, loading } = useSelector((state) => state.technicianSubscription);
  
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [timeRange, setTimeRange] = useState('year');
  
  // Calculate stats from Redux data
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = stats.activeCount || 0;
  const expiredSubscriptions = subscriptions.filter(s => s.status === 'EXPIRED').length;
  const totalRevenue = stats.totalRevenue || 0;
  const pendingSubscriptions = subscriptions.filter(s => s.status === 'PENDING').length;
  const cancelledSubscriptions = subscriptions.filter(s => s.status === 'CANCELLED').length;

  useEffect(() => {
    dispatch(fetchAllSubscriptions());
    dispatch(fetchSubscriptionStats(currentYear));
  }, [dispatch, currentYear]);

  // Calculate monthly revenue data
  const monthlyRevenueData = useMemo(() => {
    const data = Array(12).fill(0);
    if (stats.yearlyRevenue?.monthlyRevenue) {
      stats.yearlyRevenue.monthlyRevenue.forEach(item => {
        data[item.month - 1] = item.revenue;
      });
    }
    return data;
  }, [stats.yearlyRevenue]);

  // Calculate monthly subscriptions data
  const monthlySubscriptionsData = useMemo(() => {
    const data = Array(12).fill(0);
    if (subscriptions.length > 0) {
      subscriptions.forEach(sub => {
        const month = new Date(sub.createdAt).getMonth();
        data[month]++;
      });
    }
    return data;
  }, [subscriptions]);

  // Calculate quarterly data
  const quarterlyData = useMemo(() => {
    const quarters = [
      { name: 'Q1', months: [0, 1, 2] },
      { name: 'Q2', months: [3, 4, 5] },
      { name: 'Q3', months: [6, 7, 8] },
      { name: 'Q4', months: [9, 10, 11] }
    ];

    return quarters.map(quarter => ({
      name: quarter.name,
      revenue: quarter.months.reduce((sum, month) => sum + monthlyRevenueData[month], 0),
      subscriptions: quarter.months.reduce((sum, month) => sum + monthlySubscriptionsData[month], 0)
    }));
  }, [monthlyRevenueData, monthlySubscriptionsData]);

  // Calculate package distribution
  const packageDistribution = useMemo(() => {
    const packageCounts = {};
    subscriptions.forEach(sub => {
      const packageName = sub.packageName || 'Unknown';
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1;
    });
    
    return Object.entries(packageCounts).map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalSubscriptions * 100).toFixed(1)
    }));
  }, [subscriptions, totalSubscriptions]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const statusCounts = {};
    subscriptions.forEach(sub => {
      const status = sub.status || 'UNKNOWN';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalSubscriptions * 100).toFixed(1)
    }));
  }, [subscriptions, totalSubscriptions]);

  // Chart data
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Doanh thu (VND)',
      data: monthlyRevenueData,
      borderColor: '#1890ff',
      backgroundColor: 'rgba(24, 144, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#1890ff',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    }]
  };

  const subscriptionChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Lượt mua gói',
      data: monthlySubscriptionsData,
      backgroundColor: 'rgba(82, 196, 26, 0.8)',
      borderColor: '#52c41a',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  const quarterlyRevenueData = {
    labels: quarterlyData.map(q => q.name),
    datasets: [{
      label: 'Doanh thu theo quý (VND)',
      data: quarterlyData.map(q => q.revenue),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: '#ff6384',
      borderWidth: 2
    }]
  };

  const quarterlySubscriptionData = {
    labels: quarterlyData.map(q => q.name),
    datasets: [{
      label: 'Lượt mua gói theo quý',
      data: quarterlyData.map(q => q.subscriptions),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: '#36a2eb',
      borderWidth: 2
    }]
  };

  const packageChartData = {
    labels: packageDistribution.map(p => p.name),
    datasets: [{
      data: packageDistribution.map(p => p.count),
      backgroundColor: [
        '#ff6384',
        '#36a2eb',
        '#ffce56',
        '#4bc0c0',
        '#9966ff',
        '#ff9f40'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const statusChartData = {
    labels: statusDistribution.map(s => s.status),
    datasets: [{
      data: statusDistribution.map(s => s.count),
      backgroundColor: [
        '#52c41a', // Active
        '#faad14', // Expired
        '#1890ff', // Pending
        '#f5222d', // Cancelled
        '#722ed1'  // Other
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (context.dataset.label.includes('Doanh thu')) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (this.getLabelForValue(value).includes('Doanh thu')) {
              return formatCurrency(value);
            }
            return value;
          }
        }
      }
    }
  };

  const handleRefresh = () => {
    dispatch(fetchAllSubscriptions());
    dispatch(fetchSubscriptionStats(currentYear));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="container-fluid">
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* Header */}
          <div className="analytics-header">
            <Row justify="space-between" align="middle">
              <Col>
                <h1>Dashboard Phân Tích Doanh Thu Gói Đăng Ký</h1>
                <p>Thống kê và phân tích chi tiết doanh thu từ gói đăng ký kỹ thuật viên</p>
              </Col>
              <Col>
                <Space>
                  <Select
                    value={timeRange}
                    onChange={setTimeRange}
                    style={{ width: 120 }}
                  >
                    <Option value="year">Theo năm</Option>
                    <Option value="quarter">Theo quý</Option>
                    <Option value="month">Theo tháng</Option>
                  </Select>
                  <Select
                    value={currentYear}
                    onChange={setCurrentYear}
                    style={{ width: 100 }}
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <Option key={year} value={year}>{year}</Option>
                    ))}
                  </Select>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleRefresh}
                    type="primary"
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={8} lg={3}>
              <Card className="stats-card" size="small">
                <Statistic
                  title="Tổng lượt mua gói"
                  value={totalSubscriptions}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  suffix="gói"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={3}>
              <Card className="stats-card" size="small">
                <Statistic
                  title="Gói đang hoạt động"
                  value={activeSubscriptions}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  suffix="gói"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={3}>
              <Card className="stats-card" size="small">
                <Statistic
                  title="Gói đã hết hạn"
                  value={expiredSubscriptions}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14', fontSize: '18px' }}
                  suffix="gói"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={3}>
              <Card className="stats-card" size="small">
                <Statistic
                  title="Tổng doanh thu"
                  value={formatCurrency(totalRevenue)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#f5222d', fontSize: '18px' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Additional Stats */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Gói đang chờ xử lý"
                  value={pendingSubscriptions}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                  suffix="gói"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Gói đã hủy"
                  value={cancelledSubscriptions}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#f5222d', fontSize: '16px' }}
                  suffix="gói"
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} lg={4}>
              <Card size="small">
                <Statistic
                  title="Tỷ lệ hoạt động"
                  value={totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions * 100).toFixed(1) : 0}
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: '#52c41a', fontSize: '16px' }}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {/* Charts Row 1 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Doanh Thu Theo Tháng" className="chart-card" style={{ height: 400 }}>
                <div className="chart-container">
                  <Line data={revenueChartData} options={chartOptions} />
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Lượt Mua Gói Theo Tháng" className="chart-card" style={{ height: 400 }}>
                <div className="chart-container">
                  <Bar data={subscriptionChartData} options={chartOptions} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts Row 2 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Doanh Thu Theo Quý" style={{ height: 400 }}>
                <Bar data={quarterlyRevenueData} options={chartOptions} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Lượt Mua Gói Theo Quý" style={{ height: 400 }}>
                <Bar data={quarterlySubscriptionData} options={chartOptions} />
              </Card>
            </Col>
          </Row>

          {/* Charts Row 3 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Phân Bố Theo Gói" style={{ height: 400 }}>
                <Doughnut data={packageChartData} options={chartOptions} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Phân Bố Theo Trạng Thái" style={{ height: 400 }}>
                <Pie data={statusChartData} options={chartOptions} />
              </Card>
            </Col>
          </Row>

          {/* Package Distribution Table */}
          <Card title="Chi Tiết Phân Bố Gói">
            <Table
              dataSource={packageDistribution}
              columns={[
                {
                  title: 'Tên gói',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a, b) => a.count - b.count,
                },
                {
                  title: 'Tỷ lệ',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (percentage) => (
                    <div>
                      <Progress 
                        percent={parseFloat(percentage)} 
                        size="small" 
                        showInfo={false}
                      />
                      <Text>{percentage}%</Text>
                    </div>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card>

          {/* Status Distribution Table */}
          {/* <Card title="Chi Tiết Phân Bố Trạng Thái">
            <Table
              dataSource={statusDistribution}
              columns={[
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const colorMap = {
                      'ACTIVE': 'green',
                      'EXPIRED': 'orange',
                      'PENDING': 'blue',
                      'CANCELLED': 'red'
                    };
                    return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
                  },
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'count',
                  key: 'count',
                  sorter: (a, b) => a.count - b.count,
                },
                {
                  title: 'Tỷ lệ',
                  dataIndex: 'percentage',
                  key: 'percentage',
                  render: (percentage) => (
                    <div>
                      <Progress 
                        percent={parseFloat(percentage)} 
                        size="small" 
                        showInfo={false}
                      />
                      <Text>{percentage}%</Text>
                    </div>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Card> */}
        </Space>
      </div>
    </div>
  );
};

export default TechnicianSubscriptionAnalytics;
