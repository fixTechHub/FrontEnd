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
import { fetchAllSubscriptions, fetchSubscriptionStats, fetchSubscriptionAnalytics } from '../../features/technicianSubscription/technicianSubscriptionSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import '../../styles/analytics.css';

const { Title: AntTitle, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
 const { subscriptions, stats, loading, analytics } = useSelector((state) => state.technicianSubscription);

  // State management
 const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
 const [timeRange, setTimeRange] = useState('year');
  const [selectedPeriod, setSelectedPeriod] = useState('revenue');
  const [chartType, setChartType] = useState('line');
  const [showTrends, setShowTrends] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [dateRange, setDateRange] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison

  // Calculate comprehensive stats
  const analyticsData = useMemo(() => {
    // Sử dụng analytics từ BE
    if (analytics) {
      return {
        totalSubscriptions: analytics.totalSubscriptions || 0,
        activeSubscriptions: analytics.activeSubscriptions || 0,
        expiredSubscriptions: analytics.expiredSubscriptions || 0,
        totalRevenue: analytics.totalRevenue || 0,
        pendingSubscriptions: analytics.pendingSubscriptions || 0,
        cancelledSubscriptions: analytics.cancelledSubscriptions || 0,
        revenueGrowth: analytics.revenueGrowth || 0,
        conversionRate: analytics.conversionRate || 0,
        avgRevenuePerSub: analytics.avgRevenuePerSubscription || 0,
        churnRate: analytics.churnRate || 0,
        retentionRate: analytics.retentionRate || 0
      };
    }

    // Fallback mặc định nếu chưa có analytics
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      totalRevenue: 0,
      pendingSubscriptions: 0,
      cancelledSubscriptions: 0,
      revenueGrowth: 0,
      conversionRate: 0,
      avgRevenuePerSub: 0,
      churnRate: 0,
      retentionRate: 0
    };
  }, [analytics]);

  // Enhanced monthly data calculation with multiple metrics
  const monthlyData = useMemo(() => {
    // Sử dụng analytics từ BE
    if (analytics?.monthlyMetrics) {
      return analytics.monthlyMetrics.map(metric => ({
        month: metric.monthName,
        revenue: metric.revenue,
        subscriptions: metric.subscriptions,
        active: metric.activeSubscriptions,
        conversion: metric.conversionRate
      }));
    }

    // Fallback mặc định nếu chưa có analytics
    return [];
  }, [analytics]);

  // Quarterly data with enhanced metrics
 const quarterlyData = useMemo(() => {
   // Sử dụng analytics từ BE
   if (analytics?.quarterlyMetrics) {
     return analytics.quarterlyMetrics.map(metric => ({
       name: `Q${metric.quarter}`,
       revenue: metric.revenue,
       subscriptions: metric.subscriptions,
       active: metric.activeSubscriptions,
       conversion: metric.conversionRate
     }));
   }

   // Fallback mặc định nếu chưa có analytics
   return [];
 }, [analytics]);

  // Enhanced package distribution with revenue analysis
  const packageAnalysis = useMemo(() => {
    // Sử dụng analytics từ BE (đã có PackageName)
    if (analytics?.packageAnalytics) {
      return analytics.packageAnalytics.map(pkg => {
        return {
          name: pkg.packageName || pkg.packageId || 'Gói không xác định',
          count: pkg.totalSubscriptions,
          revenue: pkg.revenue,
          avgPrice: pkg.avgPrice,
          active: pkg.activeSubscriptions,
          conversion: pkg.conversionRate
        };
      });
    }

    // Fallback mặc định nếu chưa có analytics
    return [];
  }, [analytics]);

  // Status distribution with enhanced metrics
  const statusDistribution = useMemo(() => {
    // Sử dụng analytics từ BE
    if (analytics?.statusAnalytics) {
      return analytics.statusAnalytics.map(status => ({
        status: status.status,
        count: status.count,
        revenue: status.revenue,
        avgRevenue: status.avgRevenue
      }));
    }

    // Fallback mặc định nếu chưa có analytics
    return [];
  }, [analytics]);

  // Chart configurations
  const chartConfig = useMemo(() => {
    const baseConfig = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#1890ff',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              size: 11
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: 'VND'
          },
          ticks: {
            font: {
              size: 11
            },
            callback: function(value) {
              return formatCurrency(value);
            }
          }
        }
      }
    };

    // Return different chart types based on chartType filter
    if (chartType === 'bar') {
      return {
        ...baseConfig,
        scales: {
          ...baseConfig.scales,
          y: {
            ...baseConfig.scales.y,
            beginAtZero: true,
            title: {
              display: true,
              text: 'VND'
            }
          }
        }
      };
    }
    
    // Default line chart config
    return {
      ...baseConfig,
scales: {
  ...baseConfig.scales,
  y: {
    ...baseConfig.scales.y,
    title: {
      display: true,
    },
    ticks: {
      callback: function(value) {
        return value; // Chỉ hiển thị số, không thêm đơn vị 'đ'
      }
    }
  }
},

      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
      }
    };
  }, [chartType]);

  // Enhanced chart data
  const getChartData = useCallback((type, metric) => {
    let labels, data;
    
    // Sử dụng dữ liệu từ Backend
    if (timeRange === 'month') {
      // Sử dụng monthly data từ Backend
      labels = monthlyData.map(d => d.month);
      if (metric === 'revenue') {
        data = monthlyData.map(d => d.revenue);
      } else if (metric === 'conversion') {
        data = monthlyData.map(d => d.conversion);
      } else {
        data = monthlyData.map(d => d.subscriptions);
      }
    } else if (timeRange === 'quarter') {
      // Sử dụng quarterly data từ Backend
      labels = quarterlyData.map(q => q.name);
      if (metric === 'revenue') {
        data = quarterlyData.map(q => q.revenue);
      } else if (metric === 'conversion') {
        data = quarterlyData.map(q => q.conversion);
      } else {
        data = quarterlyData.map(q => q.subscriptions);
      }
    } else {
      // Default: Show monthly data for the year
      labels = monthlyData.map(d => d.month);
      if (metric === 'revenue') {
        data = monthlyData.map(d => d.revenue);
      } else if (metric === 'conversion') {
        data = monthlyData.map(d => d.conversion);
      } else {
        data = monthlyData.map(d => d.subscriptions);
      }
    }

    const baseData = {
      labels: labels,
      datasets: []
    };

    // Determine label based on metric
    let chartLabel;
    if (metric === 'revenue') {
      chartLabel = 'Doanh thu (VND)';
    } else if (metric === 'conversion') {
      chartLabel = 'Tỷ lệ chuyển đổi (%)';
    } else {
      chartLabel = 'Lượt mua gói';
    }

    switch (type) {
      case 'line':
        baseData.datasets.push({
          label: chartLabel,
          data: data,
          borderColor: metric === 'revenue' ? '#1890ff' : metric === 'conversion' ? '#722ed1' : '#52c41a',
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.1)' : metric === 'conversion' ? 'rgba(114, 46, 209, 0.1)' : 'rgba(82, 196, 26, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: metric === 'revenue' ? '#1890ff' : metric === 'conversion' ? '#722ed1' : '#52c41a',
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 10,
          borderWidth: 3
        });
        break;
      
      case 'bar':
        baseData.datasets.push({
          label: chartLabel,
          data: data,
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.8)' : metric === 'conversion' ? 'rgba(114, 46, 209, 0.8)' : 'rgba(82, 196, 26, 0.8)',
          borderColor: metric === 'revenue' ? '#1890ff' : metric === 'conversion' ? '#722ed1' : '#52c41a',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: metric === 'revenue' ? '#1890ff' : metric === 'conversion' ? '#722ed1' : '#52c41a'
        });
        break;
      
      case 'area':
        baseData.datasets.push({
          label: chartLabel,
          data: data,
          backgroundColor: metric === 'revenue' ? 'rgba(24, 144, 255, 0.3)' : metric === 'conversion' ? 'rgba(114, 46, 209, 0.3)' : 'rgba(82, 196, 26, 0.3)',
          borderColor: metric === 'revenue' ? '#1890ff' : metric === 'conversion' ? '#722ed1' : '#52c41a',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        });
        break;
    }

    return baseData;
  }, [monthlyData, quarterlyData, subscriptions, timeRange, currentYear]);

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
    console.log('🔍 useEffect triggered - year:', currentYear, 'timeRange:', timeRange);
    dispatch(fetchAllSubscriptions());
    dispatch(fetchSubscriptionStats(currentYear));
    dispatch(fetchSubscriptionAnalytics({ year: currentYear, timeRange }));
  }, [dispatch, currentYear, timeRange]);

  const handleRefresh = () => {
    dispatch(fetchAllSubscriptions());
    dispatch(fetchSubscriptionStats(currentYear));
    dispatch(fetchSubscriptionAnalytics({ year: currentYear, timeRange }));
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
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h4 className="mb-1">Báo cáo doanh thu</h4>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><a href="/admin">Trang chủ</a></li>
                  <li className="breadcrumb-item active">Báo cáo doanh thu</li>
                </ol>
              </nav>
            </div>
          </div>

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
                  <Tag color={analyticsData.revenueGrowth >= 0 ? 'green' : 'red'} style={{ color: 'black' }}>
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
                  <Tag color="green" style={{ color: 'black' }}>
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
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Gói đang hoạt động</Text>}
                  value={analyticsData.activeSubscriptions}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
                  prefix={<CheckCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                />
                <div style={{ marginTop: '8px' }}>
                  <Tag color="blue" style={{ color: 'black' }}>
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
                  <Tag color="orange" style={{ color: 'black' }}>
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
          <Card
            style={{ 
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}
            > 
            <Row gutter={[16, 0]} style={{ alignItems: 'flex-start', marginBottom: '24px' }}>
              <Col flex="auto">
              <div style={{ marginBottom: '8px' }}>
                <Row justify="end">
                  <Col>
                    <Space size="small">
                      <div style={{ minWidth: '120px' }}>
                        <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Thời gian:</Text>
                        <Select
                          value={timeRange}
                          onChange={setTimeRange}
                          style={{ width: '100%' }}
                          size="small"
                        >
                          <Option value="year">Theo tháng</Option>
                          <Option value="quarter">Theo quý</Option>
                        </Select>
                      </div>
                      <div style={{ minWidth: '100px' }}>
                        <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Năm:</Text>
                        <Select
                          value={currentYear}
                          onChange={setCurrentYear}
                          style={{ width: '100%' }}
                          size="small"
                        >
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <Option key={year} value={year}>{year}</Option>
                          ))}
                        </Select>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>
              <Tabs
                defaultActiveKey="overview"
                type="card"
                size="large"
                tabBarStyle={{ marginBottom: 0 }}
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
                          <div style={{ padding: '10px' }}>
                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                              Biểu đồ {timeRange === 'year' ? 'theo tháng' : timeRange === 'quarter' ? 'theo quý' : 'theo tháng'}
                            </div>
                            <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                              {timeRange === 'year' && `Năm ${currentYear}`}
                              {timeRange === 'quarter' && `Quý ${Math.floor(new Date().getMonth() / 3) + 1} năm ${currentYear}`}
                              {timeRange === 'month' && `Tháng ${new Date().getMonth() + 1} năm ${currentYear}`}
                            </div>
                          </div>
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
                              options={chartConfig}
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
                                    return `${packageItem.name}: ${packageItem.count} gói`;
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
                        </Tooltip>
                      }
                    >
                      <div style={{ height: '300px' }}>
                        <Pie
                          data={{
                            labels: statusDistribution.map(s => s.status),
                            datasets: [{
                              data: statusDistribution.map(s => s.count),
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
                                    const status = statusDistribution[context.dataIndex];
                                    return `${status.status}: ${status.count} gói`;
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
                        {quarterlyData.map((quarter, index) => {
                          const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'];
                          const quarterColor = colors[index] || '#1890ff';
                          
                          return (
                            <Col xs={24} sm={12} md={6} key={quarter.name || `quarter-${index}`}>
                              <Card
                                style={{ 
                                  borderRadius: '12px',
                                  border: `2px solid ${quarterColor}`,
                                  textAlign: 'center'
                                }}
                                styles={{ body: { padding: '16px' } }}
                              >
                                <div style={{ 
                                  background: quarterColor, 
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
                                  valueStyle={{ fontSize: '18px', color: quarterColor }}
                                />
                                <Statistic
                                  title="Lượt mua"
                                  value={quarter.subscriptions}
                                  valueStyle={{ fontSize: '16px' }}
                                />
                                <Progress
                                  percent={quarter.conversion}
                                  size="small"
                                  strokeColor={quarterColor}
                                  showInfo={false}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Tỷ lệ chuyển đổi: {quarter.conversion.toFixed(1)}%
                                </Text>
                              </Card>
                            </Col>
                          );
                        })}
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
                        rowKey={(record) => record.packageId || record.name || Math.random().toString(36)}
                        locale={{
                          emptyText: 'Chưa có dữ liệu gói đăng ký'
                        }}
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
                            title: 'Đang hoạt động',
                            dataIndex: 'active',
                            key: 'active',
                            render: (value) => <Badge count={value} style={{ backgroundColor: '#52c41a' }} />
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
              </Col>
            </Row>
          </Card>

          {/* Advanced Settings */}
          <Collapse
            ghost
            style={{ 
              background: 'white',
              borderRadius: '16px',
              marginTop: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
          />

      </div>
   </div>
 );
};

export default TechnicianSubscriptionAnalytics;