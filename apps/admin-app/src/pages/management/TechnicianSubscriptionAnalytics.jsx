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
  RocketOutlined,
  CloseCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,

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
        revenueGrowth: analytics.revenueGrowth || 0, // Lấy từ Backend
        conversionRate: analytics.conversionRate || 0,
        avgRevenuePerSub: analytics.avgRevenuePerSubscription || 0,
        churnRate: analytics.churnRate || 0,
        retentionRate: analytics.retentionRate || 0,
        
        // Tỷ lệ rời bỏ chi tiết
        customerCancellationRate: analytics.customerCancellationRate || 0,
        totalChurnRate: analytics.totalChurnRate || (analytics.cancelledSubscriptions && analytics.totalSubscriptions ? 
          (analytics.cancelledSubscriptions / analytics.totalSubscriptions * 100) : 0),
        expiredChurnRate: analytics.expiredChurnRate || 0,
        suspendedChurnRate: analytics.suspendedChurnRate || 0,
        
        // Chi tiết ExtraFromTechnicianEarning
        technicianEarningDetails: analytics.technicianEarningDetails || [],
        totalExtraFromTechnicianEarning: analytics.totalExtraFromTechnicianEarning || 0
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
      retentionRate: 0,
      
      // Tỷ lệ rời bỏ chi tiết
      customerCancellationRate: 0,
      totalChurnRate: 0,
      expiredChurnRate: 0,
      suspendedChurnRate: 0,
      
      // Chi tiết ExtraFromTechnicianEarning
      technicianEarningDetails: [],
      totalExtraFromTechnicianEarning: 0
    };
  }, [analytics]);

  // Debug logging cho analyticsData
  useEffect(() => {
    console.log('🔍 AnalyticsData:', analyticsData);
    console.log('🔍 TechnicianEarningDetails count:', analyticsData.technicianEarningDetails?.length);
    analyticsData.technicianEarningDetails?.forEach((detail, index) => {
      console.log(`🔍 Detail ${index}:`, detail.timeLabel, 'Bookings:', detail.bookingDetails?.length);
    });
  }, [analyticsData]);

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
     const quarterlyMetrics = analytics.quarterlyMetrics.map(metric => ({
       name: `Q${metric.quarter}`,
       revenue: metric.revenue,
       subscriptions: metric.subscriptions,
       active: metric.activeSubscriptions,
       conversion: metric.conversionRate
     }));
     
     // Đảm bảo luôn có đủ 4 quý
     const allQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
     const completeData = allQuarters.map(quarterName => {
       const existingData = quarterlyMetrics.find(q => q.name === quarterName);
       return existingData || {
         name: quarterName,
         revenue: 0,
         subscriptions: 0,
         active: 0,
         conversion: 0
       };
     });
     
     console.log('Processed quarterly data:', completeData);
     return completeData;
   }

   // Fallback mặc định nếu chưa có analytics - tạo dữ liệu mẫu cho 4 quý
   console.warn('No quarterlyMetrics found, using default data');
   const defaultData = [
     { name: 'Q1', revenue: 0, subscriptions: 0, active: 0, conversion: 0 },
     { name: 'Q2', revenue: 0, subscriptions: 0, active: 0, conversion: 0 },
     { name: 'Q3', revenue: 0, subscriptions: 0, active: 0, conversion: 0 },
     { name: 'Q4', revenue: 0, subscriptions: 0, active: 0, conversion: 0 }
   ];
   return defaultData;
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
            },
            autoSkip: false, // Đảm bảo hiển thị tất cả labels
            maxRotation: 0
          }
        },
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: timeRange === 'quarter' ? 'Giá trị' : 'VND'
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
        return value.toLocaleString('en-US'); // Format với dấu phẩy
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
  }, [chartType, timeRange]);

  // Enhanced chart data
  const getChartData = useCallback((type, metric) => {
    let labels, data;
    
    console.log('🔍 getChartData called with:', { type, metric, timeRange, analytics });
    console.log('📊 monthlyData:', monthlyData);
    console.log('📊 quarterlyData:', quarterlyData);
    
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
      
      console.log('📊 Quarter chart data:', { labels, data, metric });
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

  // Debug logging cho analytics data
  useEffect(() => {
    if (analytics) {
      console.log('📊 Analytics data received:', analytics);
      console.log('📊 QuarterlyMetrics:', analytics.quarterlyMetrics);
      console.log('📊 MonthlyMetrics:', analytics.monthlyMetrics);
      console.log('📊 TechnicianEarningDetails:', analytics.technicianEarningDetails);
      console.log('📊 TotalExtraFromTechnicianEarning:', analytics.totalExtraFromTechnicianEarning);
    }
  }, [analytics]);

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
                background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)'
              }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Tổng doanh thu của năm</Text>}
                  value={analyticsData.totalRevenue}
                  precision={0}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
                  prefix={<DollarOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  suffix="VND"
                />
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
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Tổng gói đăng ký </Text>}
                  value={analyticsData.totalSubscriptions}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
                  prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                />
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
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Tỷ lệ chuyển đổi </Text>}
                  value={Math.round(analyticsData.conversionRate * 10) / 10}
                  precision={1}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 600 }}
                  prefix={<LineChartOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  suffix="%"
                />
              </Card>
            </Col>
          </Row>

          {/* Detailed Churn Rate Analysis */}
          {/* <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Card style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
              }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Khách hàng tự hủy</Text>}
                  value={analyticsData.customerCancellationRate}
                  precision={1}
                  valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 600 }}
                  prefix={<CloseCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  suffix="%"
                />
                <div style={{ marginTop: '8px' }}>
                  <Tag color="red" style={{ color: 'white' }}>
                    {analyticsData.cancelledSubscriptions}
                  </Tag>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                    gói đã hủy
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
              }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Hết hạn</Text>}
                  value={analyticsData.expiredChurnRate}
                  precision={1}
                  valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 600 }}
                  prefix={<ClockCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  suffix="%"
                />
                <div style={{ marginTop: '8px' }}>
                  <Tag color="orange" style={{ color: 'white' }}>
                    {analyticsData.expiredSubscriptions}
                  </Tag>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                    gói hết hạn
                  </Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Card style={{ 
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
              }}>
                <Statistic
                  title={<Text style={{ color: 'white', fontSize: '14px' }}>Tổng tỷ lệ rời bỏ</Text>}
                  value={Math.round(analyticsData.totalChurnRate * 10) / 10}
                  precision={1}
                  valueStyle={{ color: 'white', fontSize: '20px', fontWeight: 600 }}
                  prefix={<ExclamationCircleOutlined style={{ color: 'rgba(255, 255, 255, 0.8)' }} />}
                  suffix="%"
                />
                <div style={{ marginTop: '8px' }}>
                  <Tag color="purple" style={{ color: 'white' }}>
                    {(Math.round(analyticsData.totalChurnRate * 10) / 10).toFixed(1)}%
                  </Tag>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '8px', fontSize: '12px' }}>
                    tổng hợp
                  </Text>
                </div>
              </Card>
            </Col>
          </Row> */}

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
                      title={`Phân tích theo ${timeRange === 'quarter' ? 'quý' : 'tháng'}`}
                      style={{ borderRadius: '16px' }}
                    >
                      <Row gutter={[16, 16]}>
                        {(timeRange === 'quarter' ? quarterlyData : monthlyData).map((item, index) => {
                          const colors = ['#36a2eb'];
                          const itemColor = ['#1890ff'];
                          const itemName = timeRange === 'quarter' ? item.name : item.month;
                          const itemRevenue = item.revenue || 0;
                          const itemSubscriptions = item.subscriptions || 0;
                          const itemConversion = item.conversion || 0;
                          
                          return (
                            <Col xs={24} sm={12} md={6} key={itemName || `item-${index}`}>
                              <Card
                                style={{ 
                                  borderRadius: '12px',
                                  border: `2px solid ${itemColor}`,
                                  textAlign: 'center'
                                }}
                                styles={{ body: { padding: '16px' } }}
                              >
                                <div style={{ 
                                  background: itemColor, 
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
                                  {itemName}
                                </div>
                                <Statistic
                                  title="Doanh thu"
                                  value={itemRevenue.toLocaleString('en-US') + ' VND'}
                                  precision={0}
                                  valueStyle={{ fontSize: '18px', color: itemColor }}
                                />
                                <Statistic
                                  title="Lượt mua"
                                  value={itemSubscriptions}
                                  valueStyle={{ fontSize: '16px' }}
                                />
                                <Progress
                                  percent={itemConversion}
                                  size="small"
                                  strokeColor={itemColor}
                                  showInfo={false}
                                />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  Tỷ lệ chuyển đổi: {itemConversion.toFixed(1)}%
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
                            render: (value) => <Badge count={value} style={{ backgroundColor: '#1890ff' }} />
                          },
                          {
                            title: 'Tỷ lệ chuyển đổi',
                            dataIndex: 'conversion',
                            key: 'conversion',
                            render: (value) => <Text strong style={{ color: '#52c41a' }}>{(value) + '%'}</Text>
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
                      title={`So sánh doanh thu và lượt mua theo ${timeRange === 'quarter' ? 'quý' : 'tháng'}`}
                      style={{ borderRadius: '16px' }}
                    >
                      <div style={{ height: '400px' }}>
                        <Line
                          data={{
                            labels: timeRange === 'quarter' 
                              ? quarterlyData.map(q => q.name)
                              : monthlyData.map(d => d.month),
                            datasets: [
                              {
                                label: 'Doanh thu (VND)',
                                data: timeRange === 'quarter'
                                  ? quarterlyData.map(q => q.revenue)
                                  : monthlyData.map(d => d.revenue),
                                borderColor: '#1890ff',
                                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                                yAxisID: 'y',
                                tension: 0.4
                              },
                              {
                                label: 'Lượt mua gói',
                                data: timeRange === 'quarter'
                                  ? quarterlyData.map(q => q.subscriptions)
                                  : monthlyData.map(d => d.subscriptions),
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
                              x: {
                                ticks: {
                                  autoSkip: false, // Đảm bảo hiển thị tất cả labels
                                  maxRotation: 0
                                }
                              },
                              y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: { display: true, text: 'Doanh thu (VND)' },
                                ticks: {
                                  callback: function(value) {
                                    return value.toLocaleString('en-US');
                                  }
                                }
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
                              title="Doanh thu so với cùng kì năm ngoái"
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
                              title="Doanh thu trung bình/gói"
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
            },
            {
              key: 'bookings',
              label: (
                <span>
                  <UserOutlined />
                  Đơn hàng
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  {/* Booking Details Tables */}
                  <Col span={24}>
                    <Card
                      title="Chi tiết từng đơn hàng"
                      style={{ borderRadius: '16px' }}
                    >
                      {analyticsData.technicianEarningDetails?.map((detail, index) => {
                        console.log(`🔍 Rendering detail ${index}:`, detail.timeLabel, 'BookingDetails:', detail.bookingDetails?.length);
                        return (
                          <div key={detail.timeLabel} style={{ 
                            marginBottom: '40px',
                            padding: '20px',
                            backgroundColor: '#fafbfc',
                            borderRadius: '12px',
                            border: '2px solid #e8f4f8',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                          }}>
                            {/* Header tháng nổi bật */}
                            <div style={{
                              background: detail.bookingCount > 0 
                                ? 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)'
                                : 'linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%)',
                              padding: '16px 20px',
                              borderRadius: '10px',
                              marginBottom: '20px',
                              color: 'white',
                              boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ 
                                    fontSize: '20px', 
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                  }}>
                                    📅 {detail.timeLabel} {timeRange === 'year' ? currentYear : ''}
                                  </div>
                                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                    {detail.bookingCount} đơn hàng • {Math.floor(detail.extraFromTechnicianEarning).toLocaleString('en-US')} VND
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ 
                                    background: 'rgba(255,255,255,0.2)', 
                                    padding: '8px 12px', 
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                  }}>
                                    {detail.bookingCount > 0 
                                      ? `Trung bình: ${Math.floor(detail.averagePerBooking).toLocaleString('en-US')} VND/đơn`
                                      : 'Không có đơn hàng'
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Table
                              dataSource={detail.bookingDetails ? [...detail.bookingDetails].sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)) : []}
                              rowKey="bookingId"
                              size="small"
                              bordered
                              style={{ 
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                              locale={{
                                emptyText: detail.bookingDetails?.length === 0 
                                  ? `Không có đơn hàng trong ${detail.timeLabel}` 
                                  : 'Đang tải dữ liệu...'
                              }}
                              columns={[
                                {
                                  title: 'Đơn hàng',
                                  dataIndex: 'bookingCode',
                                  key: 'bookingCode',
                                  width: '15%',
                                  render: (text, record) => (
                                    <div>
                                      <Text code style={{ fontSize: '11px', display: 'block' }}>
                                        {text || '#' + record.bookingId.slice(-6)}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: '10px' }}>
                                        {new Date(record.bookingDate).toLocaleDateString('vi-VN')}
                                      </Text>
                                    </div>
                                  )
                                },
                                {
                                  title: 'Technician & Dịch vụ',
                                  dataIndex: 'technicianName',
                                  key: 'technicianService',
                                  width: '25%',
                                  render: (text, record) => (
                                    <div>
                                      <Text strong style={{ fontSize: '11px', display: 'block' }}>
                                        {text}
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: '10px' }}>
                                        {record.serviceName}
                                      </Text>
                                    </div>
                                  )
                                },
                                {
                                  title: 'Thu nhập',
                                  dataIndex: 'technicianEarning',
                                  key: 'technicianEarning',
                                  width: '20%',
                                  align: 'right',
                                  render: (value) => (
                                    <Text style={{ fontSize: '11px', color: '#1890ff', fontWeight: '500' }}>
                                      {Math.floor(value).toLocaleString('en-US')}
                                    </Text>
                                  ),
                                  sorter: (a, b) => a.technicianEarning - b.technicianEarning
                                },
                                {
                                  title: 'Hoa hồng (8%)',
                                  dataIndex: 'extraFromBooking',
                                  key: 'extraFromBooking',
                                  width: '20%',
                                  align: 'right',
                                  render: (value) => (
                                    <Text strong style={{ fontSize: '11px', color: '#52c41a' }}>
                                      {Math.floor(value).toLocaleString('en-US')}
                                    </Text>
                                  ),
                                  sorter: (a, b) => a.extraFromBooking - b.extraFromBooking
                                },
                                {
                                  title: 'Trạng thái',
                                  dataIndex: 'paymentStatus',
                                  key: 'paymentStatus',
                                  width: '20%',
                                  align: 'center',
                                  render: (status) => {
                                    const color = status === 'PAID' ? 'success' : 
                                                 status === 'PENDING' ? 'warning' : 'error';
                                    return (
                                      <Tag color={color} style={{ fontSize: '10px', margin: 0 }}>
                                        {status}
                                      </Tag>
                                    );
                                  }
                                }
                              ]}
                              summary={() => (
                                <Table.Summary.Row style={{ background: '#f0f7ff', fontWeight: 'bold' }}>
                                  <Table.Summary.Cell index={0} colSpan={2}>
                                    <Text strong style={{ fontSize: '12px' }}>
                                      Tổng: {detail.bookingCount} đơn hàng
                                    </Text>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={2} align="right">
                                    <Text strong style={{ color: '#1890ff', fontSize: '12px' }}>
                                      {Math.floor(detail.totalTechnicianEarning).toLocaleString('en-US')}
                                    </Text>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={3} align="right">
                                    <Text strong style={{ color: '#52c41a', fontSize: '12px' }}>
                                      {Math.floor(detail.extraFromTechnicianEarning).toLocaleString('en-US')}
                                    </Text>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell index={4} align="center">
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              )}
                            />
                          </div>
                        );
                      }) || (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                          <Text type="secondary">Không có dữ liệu đơn hàng</Text>
                        </div>
                      )}
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