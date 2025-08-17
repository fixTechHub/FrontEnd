import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  Typography,
  Tabs,
  DatePicker,
  Tooltip,
  Badge,
  Alert,
  Divider,
  Avatar,
  List,
  Switch,
  Radio,
  InputNumber,
  Collapse
} from 'antd';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
 UserOutlined,
 DollarOutlined,
 CheckCircleOutlined,
 ClockCircleOutlined,
 RiseOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  DownOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  StarOutlined,
  TrophyOutlined,
  FireOutlined,
  RocketOutlined
} from '@ant-design/icons';
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
  Title as ChartTitle,
 Tooltip as ChartTooltip,
 Legend,
 BarElement,
 ArcElement,
  Filler
} from 'chart.js';
import { fetchAllSubscriptions, fetchSubscriptionStats } from '../../features/technicianSubscription/technicianSubscriptionSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/analytics.css';

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

ChartJS.register(
 CategoryScale,
 LinearScale,
 PointElement,
 LineElement,
  ChartTitle,
 ChartTooltip,
 Legend,
 BarElement,
 ArcElement,
  Filler
);

const TechnicianSubscriptionAnalytics = () => {
 const dispatch = useDispatch();
 const { subscriptions, stats, loading } = useSelector((state) => state.technicianSubscription);

  // State management
 const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
 const [timeRange, setTimeRange] = useState('year');
  const [selectedPeriod, setSelectedPeriod] = useState('revenue');
  const [chartType, setChartType] = useState('line');
  const [showTrends, setShowTrends] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison

  // Calculate comprehensive stats
  const analyticsData = useMemo(() => {
 const totalSubscriptions = subscriptions.length;
 const activeSubscriptions = stats.activeCount || 0;
 const expiredSubscriptions = subscriptions.filter(s => s.status === 'EXPIRED').length;
 const totalRevenue = stats.totalRevenue || 0;
 const pendingSubscriptions = subscriptions.filter(s => s.status === 'PENDING').length;
 const cancelledSubscriptions = subscriptions.filter(s => s.status === 'CANCELLED').length;

    // Calculate growth rates
    const currentMonthRevenue = stats.yearlyRevenue?.monthlyRevenue?.[new Date().getMonth()]?.revenue || 0;
    const lastMonthRevenue = stats.yearlyRevenue?.monthlyRevenue?.[new Date().getMonth() - 1]?.revenue || 0;
    const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
    
    // Calculate conversion rates
    const conversionRate = totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions * 100).toFixed(1) : 0;
    
    // Calculate average revenue per subscription
    const avgRevenuePerSub = totalSubscriptions > 0 ? (totalRevenue / totalSubscriptions) : 0;
    
    // Calculate churn rate
    const churnRate = totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions * 100).toFixed(1) : 0;

    return {
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      totalRevenue,
      pendingSubscriptions,
      cancelledSubscriptions,
      revenueGrowth,
      conversionRate,
      avgRevenuePerSub,
      churnRate
    };
  }, [subscriptions, stats]);

  // Enhanced monthly data calculation with multiple metrics
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((month, index) => {
      const monthRevenue = stats.yearlyRevenue?.monthlyRevenue?.find(item => item.month === index + 1)?.revenue || 0;
      const monthSubscriptions = subscriptions.filter(sub => new Date(sub.createdAt).getMonth() === index).length;
      const monthActive = subscriptions.filter(sub => 
        new Date(sub.createdAt).getMonth() === index && sub.status === 'ACTIVE'
      ).length;
      
      return {
        month,
        revenue: monthRevenue,
        subscriptions: monthSubscriptions,
        active: monthActive,
        conversion: monthSubscriptions > 0 ? (monthActive / monthSubscriptions * 100).toFixed(1) : 0
      };
    });
   return data;
  }, [subscriptions, stats]);

  // Quarterly data with enhanced metrics
 const quarterlyData = useMemo(() => {
   const quarters = [
      { name: 'Q1', months: [0, 1, 2], color: '#ff6384' },
      { name: 'Q2', months: [3, 4, 5], color: '#36a2eb' },
      { name: 'Q3', months: [6, 7, 8], color: '#ffce56' },
      { name: 'Q4', months: [9, 10, 11], color: '#4bc0c0' }
    ];

   return quarters.map(quarter => ({
     name: quarter.name,
      color: quarter.color,
      revenue: quarter.months.reduce((sum, month) => sum + monthlyData[month].revenue, 0),
      subscriptions: quarter.months.reduce((sum, month) => sum + monthlyData[month].subscriptions, 0),
      active: quarter.months.reduce((sum, month) => sum + monthlyData[month].active, 0),
      conversion: quarter.months.reduce((sum, month) => sum + parseFloat(monthlyData[month].conversion), 0) / 3
    }));
  }, [monthlyData]);

  // Enhanced package distribution with revenue analysis
  const packageAnalysis = useMemo(() => {
    const packageData = {};
    
    subscriptions.forEach(sub => {
      const packageName = sub.packageName || sub.package?.name || sub.subscriptionPackage?.name || sub.packageType || sub.planName || 'Gói cơ bản';
      const packagePrice = sub.packagePrice || sub.package?.price || sub.subscriptionPackage?.price || 0;
      
      if (!packageData[packageName]) {
        packageData[packageName] = {
          count: 0,
          revenue: 0,
          active: 0,
          expired: 0,
          avgPrice: 0
        };
      }
      
      packageData[packageName].count++;
      packageData[packageName].revenue += packagePrice;
      if (sub.status === 'ACTIVE') packageData[packageName].active++;
      if (sub.status === 'EXPIRED') packageData[packageName].expired++;
    });

    return Object.entries(packageData).map(([name, data]) => ({
     name,
      ...data,
      avgPrice: data.count > 0 ? data.revenue / data.count : 0,
      percentage: (data.count / analyticsData.totalSubscriptions * 100).toFixed(1),
      conversion: data.count > 0 ? (data.active / data.count * 100).toFixed(1) : 0
    }));
  }, [subscriptions, analyticsData.totalSubscriptions]);

  // Status distribution with enhanced metrics
  const statusAnalysis = useMemo(() => {
    const statusData = {};
   subscriptions.forEach(sub => {
     const status = sub.status || 'UNKNOWN';
      if (!statusData[status]) {
        statusData[status] = {
          count: 0,
          revenue: 0,
          avgDuration: 0
        };
      }
      statusData[status].count++;
      statusData[status].revenue += sub.packagePrice || 0;
    });

    return Object.entries(statusData).map(([status, data]) => ({
     status,
      ...data,
      percentage: (data.count / analyticsData.totalSubscriptions * 100).toFixed(1),
      avgRevenue: data.count > 0 ? data.revenue / data.count : 0
    }));
  }, [subscriptions, analyticsData.totalSubscriptions]);

  // Chart configurations
 const chartOptions = {
   responsive: true,
   maintainAspectRatio: false,
   plugins: {
     legend: {
       position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 }
        }
     },
     tooltip: {
       mode: 'index',
       intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#1890ff',
        borderWidth: 1,
        cornerRadius: 8,
       callbacks: {
         label: function (context) {
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
       ticks: {
         callback: function (value) {
           if (this.getLabelForValue(value).includes('Doanh thu')) {
             return formatCurrency(value);
           }
           return value;
         }
       }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        }
      }
    }
  };

  // Enhanced chart data
  const getChartData = useCallback((type, metric) => {
    const baseData = {
      labels: monthlyData.map(d => d.month),
      datasets: []
    };

    switch (type) {
      case 'line':
        baseData.datasets.push({
          label: metric === 'revenue' ? 'Doanh thu (VND)' : 'Lượt mua gói',
          data: monthlyData.map(d => metric === 'revenue' ? d.revenue : d.subscriptions),
          borderColor: metric === 'revenue' ? '#1890ff' : '#52c41a',
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.1)' : 'rgba(82, 196, 26, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: metric === 'revenue' ? '#1890ff' : '#52c41a',
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 10,
          borderWidth: 3
        });
        break;
      
      case 'bar':
        baseData.datasets.push({
          label: metric === 'revenue' ? 'Doanh thu (VND)' : 'Lượt mua gói',
          data: monthlyData.map(d => metric === 'revenue' ? d.revenue : d.subscriptions),
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.8)' : 'rgba(82, 196, 26, 0.8)',
          borderColor: metric === 'revenue' ? '#1890ff' : '#52c41a',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: metric === 'revenue' ? '#1890ff' : '#52c41a'
        });
        break;
      
      case 'area':
        baseData.datasets.push({
          label: metric === 'revenue' ? 'Doanh thu (VND)' : 'Lượt mua gói',
          data: monthlyData.map(d => metric === 'revenue' ? d.revenue : d.subscriptions),
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.3)' : 'rgba(82, 196, 26, 0.3)',
          borderColor: metric === 'revenue' ? '#1890ff' : '#52c41a',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        });
        break;
    }

    return baseData;
  }, [monthlyData]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    dispatch(fetchAllSubscriptions());
    dispatch(fetchSubscriptionStats(currentYear));
  }, [dispatch, currentYear]);

 const handleRefresh = () => {
   dispatch(fetchAllSubscriptions());
   dispatch(fetchSubscriptionStats(currentYear));
 };

  const handleExport = () => {
    // Export functionality
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscription-analytics-${currentYear}.json`;
    link.click();
  };

 if (loading) {
   return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ 
          borderRadius: '16px', 
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
       <Spin size="large" />
          <div style={{ marginTop: '20px', color: '#1890ff' }}>
            <Text style={{ fontSize: '18px' }}>Đang tải dữ liệu phân tích...</Text>
          </div>
        </Card>
     </div>
   );
 }

 return (
    <div className="analytics-dashboard" style={{ padding: '24px', background: '#f5f7fa' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1
        }} />
        
        <div style={{ position: 'relative', zIndex: 2 }}>
           <Row justify="space-between" align="middle">
             <Col>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChartOutlined style={{ fontSize: '32px' }} />
                </div>
                <div>
                  <AntTitle level={1} style={{ color: 'white', margin: 0 }}>
                    Analytics Dashboard
                  </AntTitle>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
                    Phân tích toàn diện gói đăng ký kỹ thuật viên
                  </Text>
                </div>
              </div>
             </Col>
             <Col>
              <Space size="middle">
                <Switch
                  checked={autoRefresh}
                  onChange={setAutoRefresh}
                  checkedChildren="Auto"
                  unCheckedChildren="Manual"
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  type="primary"
                  ghost
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Làm mới
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  type="default"
                  ghost
                  size="large"
                  style={{ borderRadius: '8px' }}
                >
                  Xuất dữ liệu
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Control Panel */}
      <Card style={{ 
        borderRadius: '16px', 
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Thời gian:</Text>
                 <Select
                   value={timeRange}
                   onChange={setTimeRange}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
                 >
                   <Option value="year">Theo năm</Option>
                   <Option value="quarter">Theo quý</Option>
                   <Option value="month">Theo tháng</Option>
                 </Select>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Năm:</Text>
                 <Select
                   value={currentYear}
                   onChange={setCurrentYear}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
                 >
                   {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                     <Option key={year} value={year}>{year}</Option>
                   ))}
                 </Select>
         </div>
       </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Loại biểu đồ:</Text>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
              >
                                 <Option value="line">Đường</Option>
                 <Option value="bar">Cột</Option>
              </Select>
         </div>
       </Col>
          <Col xs={24} sm={12} md={6}>
            <div>
              <Text strong>Chế độ xem:</Text>
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: '100%', marginTop: '8px' }}
                size="large"
              >
                <Option value="overview">Tổng quan</Option>
                <Option value="detailed">Chi tiết</Option>
                <Option value="comparison">So sánh</Option>
              </Select>
         </div>
       </Col>
     </Row>
   </Card>

      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Tổng doanh thu</Text>}
              value={analyticsData.totalRevenue}
              precision={0}
              valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
              prefix={<DollarOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
              suffix="VND"
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color={analyticsData.revenueGrowth >= 0 ? 'green' : 'red'} style={{ color: 'white' }}>
                {analyticsData.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenueGrowth}%
              </Tag>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                so với tháng trước
         </Text>
            </div>
   </Card>
 </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }}>
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Tổng gói đăng ký</Text>}
              value={analyticsData.totalSubscriptions}
              valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
              prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="blue" style={{ color: 'white' }}>
                {analyticsData.conversionRate}%
              </Tag>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                tỷ lệ chuyển đổi
         </Text>
            </div>
   </Card>
 </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          }}>
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Gói đang hoạt động</Text>}
              value={analyticsData.activeSubscriptions}
              valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
              prefix={<CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="green" style={{ color: 'white' }}>
                {analyticsData.avgRevenuePerSub.toFixed(0)} VND
              </Tag>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                trung bình/gói
         </Text>
            </div>
   </Card>
 </Col>

        <Col xs={24} sm={12} md={6}>
          <Card style={{ 
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
          }}>
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Tỷ lệ rời bỏ</Text>}
              value={analyticsData.churnRate}
              precision={1}
              valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
                                            prefix={<DownOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
               suffix="%"
            />
            <div style={{ marginTop: '8px' }}>
              <Tag color="orange" style={{ color: 'white' }}>
                {analyticsData.pendingSubscriptions}
              </Tag>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                đang chờ xử lý
         </Text>
            </div>
   </Card>
 </Col>
</Row>

      {/* Main Analytics Content */}
      <Tabs
        defaultActiveKey="overview"
        type="card"
        size="large"
        style={{ 
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
        tabBarStyle={{ marginBottom: '24px' }}
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <BarChartOutlined />
                Tổng quan
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Main Chart */}
                <Col span={24}>
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Biểu đồ {timeRange === 'year' ? 'theo năm' : timeRange === 'quarter' ? 'theo quý' : 'theo tháng'}</span>
                        <Space>
                          <Radio.Group value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} size="small">
                            <Radio.Button value="revenue">Doanh thu</Radio.Button>
                            <Radio.Button value="subscriptions">Lượt mua</Radio.Button>
                            <Radio.Button value="conversion">Tỷ lệ chuyển đổi</Radio.Button>
                          </Radio.Group>
                        </Space>
                   </div>
                    }
                    style={{ borderRadius: '16px' }}
                  >
                    <div style={{ height: '400px' }}>
                      {(() => {
                                                 const ChartComponent = chartType === 'line' ? Line : chartType === 'bar' ? Bar : Line;
                        return (
                          <ChartComponent
                            data={getChartData(chartType, selectedPeriod)}
                            options={chartOptions}
                          />
                        );
                      })()}
                   </div>
                 </Card>
               </Col>

                {/* Package Distribution */}
               <Col xs={24} lg={12}>
                  <Card
                    title="Phân bố gói đăng ký"
                    style={{ borderRadius: '16px' }}
                    extra={
                      <Tooltip title="Xem chi tiết phân tích gói">
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                      </Tooltip>
                    }
                  >
                    <div style={{ height: '300px' }}>
                      <Doughnut
                        data={{
                          labels: packageAnalysis.map(p => p.name),
                          datasets: [{
                            data: packageAnalysis.map(p => p.count),
                            backgroundColor: [
                              '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
                              '#9966ff', '#ff9f40', '#ff6384', '#c9cbcf'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const packageItem = packageAnalysis[context.dataIndex];
                                  return `${packageItem.name}: ${packageItem.count} (${packageItem.percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                 </Card>
               </Col>

                {/* Status Analysis */}
               <Col xs={24} lg={12}>
                  <Card
                    title="Phân tích trạng thái"
                    style={{ borderRadius: '16px' }}
                    extra={
                      <Tooltip title="Xem chi tiết trạng thái">
                        <Button type="text" icon={<EyeOutlined />} size="small" />
                      </Tooltip>
                    }
                  >
                    <div style={{ height: '300px' }}>
                      <Pie
                        data={{
                          labels: statusAnalysis.map(s => s.status),
                          datasets: [{
                            data: statusAnalysis.map(s => s.count),
                            backgroundColor: [
                              '#52c41a', '#faad14', '#1890ff', '#f5222d', '#722ed1'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const status = statusAnalysis[context.dataIndex];
                                  return `${status.status}: ${status.count} (${status.percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                 </Card>
               </Col>
              </Row>
            )
          },
          {
            key: 'detailed',
            label: (
              <span>
                <PieChartOutlined />
                Chi tiết
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Quarterly Analysis */}
                <Col span={24}>
                  <Card
                    title="Phân tích theo quý"
                    style={{ borderRadius: '16px' }}
                  >
                    <Row gutter={[16, 16]}>
                      {quarterlyData.map((quarter, index) => (
                        <Col xs={24} sm={12} md={6} key={index}>
                          <Card
                            style={{ 
                              borderRadius: '12px',
                              border: `2px solid ${quarter.color}`,
                              textAlign: 'center'
                            }}
                            bodyStyle={{ padding: '16px' }}
                          >
                            <div style={{ 
                              background: quarter.color, 
                              color: 'white',
                              borderRadius: '50%',
                              width: '60px',
                              height: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px',
                              fontSize: '20px',
                              fontWeight: 'bold'
                            }}>
                              {quarter.name}
                            </div>
                            <Statistic
                              title="Doanh thu"
                              value={quarter.revenue}
                              precision={0}
                              valueStyle={{ fontSize: '18px', color: quarter.color }}
                              suffix="VND"
                            />
                            <Statistic
                              title="Lượt mua"
                              value={quarter.subscriptions}
                              valueStyle={{ fontSize: '16px' }}
                            />
                            <Progress
                              percent={quarter.conversion}
                              size="small"
                              strokeColor={quarter.color}
                              showInfo={false}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Tỷ lệ chuyển đổi: {quarter.conversion.toFixed(1)}%
                            </Text>
                 </Card>
               </Col>
                      ))}
         </Row>
                  </Card>
                </Col>

                {/* Package Performance */}
                <Col span={24}>
                  <Card
                    title="Hiệu suất gói đăng ký"
                    style={{ borderRadius: '16px' }}
                  >
             <Table
                      dataSource={packageAnalysis}
               columns={[
                 {
                   title: 'Tên gói',
                   dataIndex: 'name',
                   key: 'name',
                          render: (text) => <Text strong>{text}</Text>
                 },
                 {
                   title: 'Số lượng',
                   dataIndex: 'count',
                   key: 'count',
                          render: (value) => <Badge count={value} style={{ backgroundColor: '#1890ff' }} />
                        },
                        {
                          title: 'Doanh thu',
                          dataIndex: 'revenue',
                          key: 'revenue',
                          render: (value) => <Text strong style={{ color: '#52c41a' }}>{formatCurrency(value)}</Text>
                        },
                        {
                          title: 'Giá trung bình',
                          dataIndex: 'avgPrice',
                          key: 'avgPrice',
                          render: (value) => <Text>{formatCurrency(value)}</Text>
                        },
                        {
                          title: 'Tỷ lệ chuyển đổi',
                          dataIndex: 'conversion',
                          key: 'conversion',
                          render: (value) => (
                       <Progress
                              percent={parseFloat(value)}
                         size="small"
                              strokeColor={parseFloat(value) > 70 ? '#52c41a' : parseFloat(value) > 40 ? '#faad14' : '#f5222d'}
                            />
                          )
                        },
                        {
                          title: 'Phần trăm',
                          dataIndex: 'percentage',
                          key: 'percentage',
                          render: (value) => <Tag color="blue">{value}%</Tag>
                        }
               ]}
               pagination={false}
               size="small"
             />
         </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'comparison',
            label: (
              <span>
                <LineChartOutlined />
                So sánh
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Comparison Chart */}
                <Col span={24}>
                  <Card
                    title="So sánh doanh thu và lượt mua"
                    style={{ borderRadius: '16px' }}
                  >
                    <div style={{ height: '400px' }}>
                      <Line
                        data={{
                          labels: monthlyData.map(d => d.month),
                          datasets: [
                            {
                              label: 'Doanh thu (VND)',
                              data: monthlyData.map(d => d.revenue),
                              borderColor: '#1890ff',
                              backgroundColor: 'rgba(24, 144, 255, 0.1)',
                              yAxisID: 'y',
                              tension: 0.4
                            },
                            {
                              label: 'Lượt mua gói',
                              data: monthlyData.map(d => d.subscriptions),
                              borderColor: '#52c41a',
                              backgroundColor: 'rgba(82, 196, 26, 0.1)',
                              yAxisID: 'y1',
                              tension: 0.4
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: 'index',
                            intersect: false,
                          },
                          plugins: {
                            legend: { position: 'top' },
                            tooltip: {
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
                              type: 'linear',
                              display: true,
                              position: 'left',
                              title: { display: true, text: 'Doanh thu (VND)' }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              title: { display: true, text: 'Lượt mua gói' },
                              grid: { drawOnChartArea: false }
                            }
                          }
                        }}
                      />
                   </div>
                  </Card>
                </Col>

                {/* Performance Metrics */}
                <Col span={24}>
                  <Card
                    title="Chỉ số hiệu suất"
                    style={{ borderRadius: '16px' }}
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                                                     <div style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }}>
                             <RiseOutlined />
                           </div>
                          <Statistic
                            title="Tăng trưởng doanh thu"
                            value={analyticsData.revenueGrowth}
                            precision={1}
                            valueStyle={{ color: analyticsData.revenueGrowth >= 0 ? '#52c41a' : '#f5222d' }}
                            suffix="%"
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                          <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}>
                            <CheckCircleOutlined />
                          </div>
                          <Statistic
                            title="Tỷ lệ chuyển đổi"
                            value={analyticsData.conversionRate}
                            precision={1}
                            valueStyle={{ color: '#52c41a' }}
                            suffix="%"
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Card style={{ textAlign: 'center', borderRadius: '12px' }}>
                          <div style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }}>
                            <DollarOutlined />
                          </div>
                          <Statistic
                            title="Doanh thu trung bình"
                            value={analyticsData.avgRevenuePerSub}
                            precision={0}
                            valueStyle={{ color: '#faad14' }}
                            suffix="VND"
                          />
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />

      {/* Advanced Settings */}
      <Collapse
        ghost
        style={{ 
          background: 'white',
          borderRadius: '16px',
          marginTop: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Panel
          header={
            <span>
              <SettingOutlined />
              Cài đặt nâng cao
            </span>
          }
          key="1"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Auto-refresh interval (giây):</Text>
                <InputNumber
                  min={10}
                  max={300}
                  value={refreshInterval}
                  onChange={setRefreshInterval}
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={!autoRefresh}
                />
     </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Gói được chọn:</Text>
                <Select
                  mode="multiple"
                  placeholder="Chọn gói để phân tích"
                  value={selectedPackages}
                  onChange={setSelectedPackages}
                  style={{ width: '100%', marginTop: '8px' }}
                  options={packageAnalysis.map(p => ({ label: p.name, value: p.name }))}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Khoảng thời gian:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <Text strong>Hiển thị xu hướng:</Text>
                <Switch
                  checked={showTrends}
                  onChange={setShowTrends}
                  style={{ marginTop: '8px' }}
                />
              </div>
            </Col>
          </Row>
        </Panel>
      </Collapse>
   </div>
 );
};

export default TechnicianSubscriptionAnalytics;