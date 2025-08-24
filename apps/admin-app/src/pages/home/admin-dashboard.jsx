import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Statistic, Progress, Avatar, Tag, Space, Tooltip, Badge } from 'antd';
import '../../styles/dashboard.css';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Modal, Descriptions, Divider, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { 
  EyeOutlined, 
  UserOutlined, 
  DollarOutlined, 
  ToolOutlined, 
  CalendarOutlined,
  StarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TrophyOutlined
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
} from 'chart.js';

// API imports
import ApiBE from '../../services/ApiBE';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { technicianSubscriptionAPI } from '../../features/technicianSubscription/technicianSubscriptionAPI';

// Redux actions
import { getBookingCountByMonth } from '../../features/bookings/bookingSlice';
import { getMonthlyRevenue } from '../../features/statistics/statisticSlice';
import { getTechnicianCountByMonth } from '../../features/technicians/technicianSlice';

// API functions
import { fetchMonthlyRevenue } from '../../features/statistics/statisticAPI';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  BarElement,
  ArcElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State variables
  const [percentChange, setPercentChange] = useState(0);
  const [percentTechnicianChange, setPercentTechnicianChange] = useState(0);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [percentRevenueChange, setPercentRevenueChange] = useState(0);
  const [bookingCounts, setBookingCounts] = useState(Array(12).fill(0));
  const [revenueCounts, setRevenueCounts] = useState(Array(12).fill(0));
  const [technicianCounts, setTechnicianCounts] = useState(Array(12).fill(0));
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentBookingsLoading, setRecentBookingsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [topTechnicians, setTopTechnicians] = useState([]);
  const [topTechniciansLoading, setTopTechniciansLoading] = useState(false);
  const [revenueThisYear, setRevenueThisYear] = useState(Array(12).fill(0));
  const [revenueLastYear, setRevenueLastYear] = useState(Array(12).fill(0));
  const [revenueChartLoading, setRevenueChartLoading] = useState(false);
  const [technicianMap, setTechnicianMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalTechnicians: 0,
    pendingBookings: 0,
    completedBookings: 0,
    activeTechnicians: 0,
    averageRating: 0
  });

  // Chart options for modern design
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4CAF50',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return Math.round(context.parsed.y).toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          display: true,
          font: { size: 10, weight: '500' },
          color: '#666',
          maxRotation: 0
        }
      },
      y: { 
        display: false,
        grid: { display: false }
      },
    },
    elements: {
      point: { 
        radius: 0,
        hoverRadius: 4,
        hoverBackgroundColor: '#4CAF50'
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 16,
          padding: 20,
          font: { size: 12, weight: '600' },
          usePointStyle: true,
          color: '#374151'
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12,
        bodyFont: { size: 13, weight: '500' },
        titleFont: { size: 14, weight: '600' },
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} VNĐ`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          display: true,
          color: 'rgba(156, 163, 175, 0.1)',
          lineWidth: 1
        },
        ticks: {
          display: true,
          font: { size: 11, weight: '600' },
          color: '#6B7280',
          maxRotation: 0,
          padding: 8,
          autoSkip: false, // Đảm bảo hiển thị tất cả labels
          minRotation: 0
        },
        border: {
          display: true,
          color: 'rgba(156, 163, 175, 0.2)',
          width: 1
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [4, 4],
          color: 'rgba(156, 163, 175, 0.1)',
          lineWidth: 1
        },
        ticks: {
          display: true,
          font: { size: 11, weight: '600' },
          color: '#6B7280',
          padding: 8,
          callback: function(value) {
            return value >= 1000 ? (value/1000).toFixed(1) + 'k' : value;
          }
        },
        border: {
          display: true,
          color: 'rgba(156, 163, 175, 0.2)',
          width: 1
        }
      }
    }
  };

  // Calculate totals
  const nowForBooking = new Date();
  const currentMonthIndex = nowForBooking.getMonth();
  const totalBookings = bookingCounts[currentMonthIndex] || 0;
  const lastMonthForBooking = currentMonthIndex === 0 ? 12 : currentMonthIndex;
  const lastMonthIndex = lastMonthForBooking - 1;
  const totalLastMonthBookings = bookingCounts[lastMonthIndex] || 0;
  
  const nowForTechnician = new Date();
  const currentMonthIndexTechnician = nowForTechnician.getMonth();
  const totalTechnicians = technicianCounts[currentMonthIndexTechnician] || 0;
  const totalLastMonthTechnicians = technicianCounts[lastMonthIndex] || 0;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;
  const currentMonth = now.getMonth() + 1;
  const lastMonthForRevenue = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastYearForRevenue = currentMonth === 1 ? lastYear : currentYear;

  // Đảm bảo dữ liệu được khởi tạo đúng cách
  useEffect(() => {
    // Khởi tạo dữ liệu mặc định cho biểu đồ
    if (revenueThisYear.length !== 12) {
      setRevenueThisYear(Array(12).fill(0));
    }
    if (revenueLastYear.length !== 12) {
      setRevenueLastYear(Array(12).fill(0));
    }
    if (revenueCounts.length !== 12) {
      setRevenueCounts(Array(12).fill(0));
    }
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent bookings
    setRecentBookingsLoading(true);
        const bookingsData = await bookingAPI.getAll();
        const sorted = [...bookingsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        
        const users = await Promise.all(sorted.map(async b => {
          if (b.customerId && b.customerId.length === 24 && /^[0-9a-fA-F]{24}$/.test(b.customerId)) {
            try {
              const user = await userAPI.getById(b.customerId);
              return user || { fullName: 'Unknown User', email: '', avatarUrl: '' };
            } catch (error) {
              return { fullName: 'Unknown User', email: '', avatarUrl: '' };
            }
          } else {
            return { fullName: 'Unknown User', email: '', avatarUrl: '' };
          }
        }));
        
        const services = await Promise.all(sorted.map(async b => {
          if (b.serviceId && b.serviceId.length === 24 && /^[0-9a-fA-F]{24}$/.test(b.serviceId)) {
            try {
              const service = await serviceAPI.getById(b.serviceId);
              return service || { serviceName: 'Unknown Service', description: '' };
            } catch (error) {
              return { serviceName: 'Unknown Service', description: '' };
            }
          } else {
            return { serviceName: 'Unknown Service', description: '' };
          }
        }));

        const withUserAndService = sorted.map((b, i) => ({ 
          ...b, 
          user: users[i],
          service: services[i]
        }));
        setRecentBookings(withUserAndService);

        // Fetch top technicians
    setTopTechniciansLoading(true);   
        const techniciansData = await technicianAPI.getAll();
        const sortedTechnicians = [...techniciansData]
          .sort((a, b) => b.ratingAverage - a.ratingAverage)
          .slice(0, 6)
          .map(t => ({ 
          ...t, 
          user: {
            fullName: t.fullName || 'Unknown User',
            email: t.email || '',
            avatarUrl: ''
          }
        }));
        setTopTechnicians(sortedTechnicians);

        // Calculate dashboard stats
        const totalUsers = bookingsData.length;
        // Lấy tổng doanh thu từ Package (TechnicianSubscription) thay vì từ commission
        let totalRevenue = 0;
        try {
          const revenueResponse = await technicianSubscriptionAPI.getTotalRevenue();
          totalRevenue = revenueResponse.totalRevenue || 0;
        } catch (error) {
          console.error('Error fetching total revenue from packages:', error);
          totalRevenue = 0;
        }
        
        const pendingBookings = bookingsData.filter(b => b.status === 'PENDING').length;
        // Count bookings with status = 'DONE' (completed jobs)
        const completedBookings = bookingsData.filter(b => b.status === 'DONE').length;
        // Count technicians with AVAILABILITY = 'FREE' (available for new bookings)
        const activeTechnicians = techniciansData.filter(t => t.availability === 'FREE').length;
        const averageRating = techniciansData.length > 0 
          ? techniciansData.reduce((sum, t) => sum + (t.ratingAverage || 0), 0) / techniciansData.length 
          : 0;

        setDashboardStats({
          totalUsers,
          totalBookings: totalBookings,
          totalRevenue,
          totalTechnicians,
          pendingBookings,
          completedBookings,
          activeTechnicians,
          averageRating
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setRecentBookingsLoading(false);
        setTopTechniciansLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array to run only once

  // Fetch revenue data - Lấy doanh thu từ Package (TechnicianSubscription) thay vì từ commission
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const revenueCounts = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
            technicianSubscriptionAPI.getMonthlyRevenue(currentYear, i + 1)
          )
        );
        
        console.log('Raw revenue response:', revenueCounts);
        
        const revenueData = revenueCounts.map((response, index) => {
          console.log(`Month ${index + 1} response:`, response);
          const value = response.revenue || response || 0;
          return typeof value === 'number' ? Math.round(value) : 0;
        });
        
        console.log('Processed revenue data:', revenueData);
        setRevenueCounts(revenueData);
        
        const currentMonth = new Date().getMonth();
        const currentRevenue = revenueData[currentMonth] || 0;
        setCurrentRevenue(currentRevenue);
        
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastRevenueValue = revenueData[lastMonth] || 0;
        const change = lastRevenueValue === 0 
          ? (currentRevenue > 0 ? 100 : 0)
          : ((currentRevenue - lastRevenueValue) / lastRevenueValue) * 100;
        setPercentRevenueChange(change);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };
    
    fetchRevenueData();
  }, [currentYear]);

  // Fetch booking counts
  useEffect(() => {
    const fetchBookingCounts = async () => {
      try {
        const counts = await Promise.all(
          Array.from({ length: 12 }, (_, i) => 
            bookingAPI.getBookingCountByMonth(currentYear, i + 1)
          )
        );
        
        const bookingData = counts.map(count => {
          const value = count?.count || count || 0;
          return typeof value === 'number' ? value : 0;
        });
        setBookingCounts(bookingData);
        
        const currentMonth = new Date().getMonth();
        const currentCount = bookingData[currentMonth] || 0;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastCount = bookingData[lastMonth] || 0;
        const change = lastCount === 0 
          ? (currentCount > 0 ? 100 : 0)  // Nếu tháng trước = 0, tháng này > 0 thì tăng 100%
          : ((currentCount - lastCount) / lastCount) * 100;
        setPercentChange(change);
      } catch (error) {
        console.error('Error fetching booking counts:', error);
      }
    };
    
    fetchBookingCounts();
  }, [currentYear]);

  // Fetch technician counts
  useEffect(() => {
    const fetchTechnicianCounts = async () => {
      try {
        const counts = await Promise.all(
          Array.from({ length: 12 }, (_, i) => 
            technicianAPI.getTechnicianCountByMonth(currentYear, i + 1)
          )
        );
        

        
        const technicianData = counts.map(count => {
          const value = count?.count || count || 0;
          return typeof value === 'number' ? value : 0;
        });
        


        
        setTechnicianCounts(technicianData);
        
        const currentMonth = new Date().getMonth();
        const currentCount = technicianData[currentMonth] || 0;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastCount = technicianData[lastMonth] || 0;
        




        
        const change = lastCount === 0 
          ? (currentCount > 0 ? 100 : 0)  // Nếu tháng trước = 0, tháng này > 0 thì tăng 100%
          : ((currentCount - lastCount) / lastCount) * 100;

        // Debug log
        console.log('Technician Count Debug:', {
          currentMonth,
          currentCount,
          lastMonth,
          lastCount,
          change,
          technicianData
        });
        
        setPercentTechnicianChange(change);
      } catch (error) {
        console.error('Error fetching technician counts:', error);
      }
    };
    
    fetchTechnicianCounts();
  }, [currentYear]);

  // Fetch yearly revenue comparison - Lấy doanh thu từ Package thay vì từ commission
  useEffect(() => {
    async function fetchYearlyRevenue(year) {
      try {
        const results = await Promise.all(
          Array.from({ length: 12 }, (_, i) => 
            technicianSubscriptionAPI.getMonthlyRevenue(year, i + 1)
              .then(res => {
                console.log(`Year ${year}, Month ${i + 1} response:`, res);
                const revenue = res.revenue || res || 0;
                return Math.round(revenue);
              })
              .catch((error) => {
                console.warn(`Error fetching revenue for ${year}-${i + 1}:`, error);
                return 0; // Trả về 0 nếu có lỗi
              })
          )
        );
        
        // Đảm bảo luôn có đủ 12 tháng
        if (results.length !== 12) {
          console.warn(`Expected 12 months for year ${year}, got ${results.length}`);
          // Nếu thiếu, bổ sung với 0
          while (results.length < 12) {
            results.push(0);
          }
        }
        
        console.log(`Revenue data for year ${year}:`, results);
        return results;
      } catch (error) {
        console.error(`Error fetching yearly revenue for ${year}:`, error);
        // Trả về mảng 12 số 0 nếu có lỗi
        return Array(12).fill(0);
      }
    }
    
    setRevenueChartLoading(true);
    Promise.all([
      fetchYearlyRevenue(currentYear),
      fetchYearlyRevenue(lastYear)
    ]).then(([dataThisYear, dataLastYear]) => {
      console.log('Final revenue data:', { currentYear: dataThisYear, lastYear: dataLastYear });
      setRevenueThisYear(dataThisYear);
      setRevenueLastYear(dataLastYear);
    }).catch((error) => {
      console.error('Error in yearly revenue comparison:', error);
      // Set default data nếu có lỗi
      setRevenueThisYear(Array(12).fill(0));
      setRevenueLastYear(Array(12).fill(0));
    }).finally(() => setRevenueChartLoading(false));
  }, [currentYear, lastYear]);

  // Fetch maps
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const [technicians, users, services] = await Promise.all([
          technicianAPI.getAll(),
          userAPI.getAll(),
          serviceAPI.getAll()
        ]);

        const techMap = {};
        technicians.forEach(t => {
          techMap[t.id] = t.fullName || t.FullName || t.email || t.Email || 'Unknown Technician';
        });
        setTechnicianMap(techMap);

        const userMap = {};
        users.forEach(u => {
          userMap[u.id] = u.fullName || u.FullName || u.email || u.Email || 'Unknown User';
        });
        setUserMap(userMap);

        const serviceMap = {};
        services.forEach(s => {
          serviceMap[s.id] = s.serviceName || s.ServiceName || s.description || 'Unknown Service';
        });
        setServiceMap(serviceMap);
      } catch (error) {
        console.error('Error fetching maps:', error);
      }
    };

    fetchMaps();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return 'success';
      case 'PENDING':
      case 'WAITING':
        return 'warning';
      case 'CANCELLED':
      case 'REJECTED':
        return 'error';
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return 'processing';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'DONE':
        return <CheckCircleOutlined />;
      case 'PENDING':
      case 'WAITING':
        return <ClockCircleOutlined />;
      case 'CANCELLED':
      case 'REJECTED':
        return <ExclamationCircleOutlined />;
      case 'IN_PROGRESS':
      case 'ACTIVE':
        return <ArrowUpOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        {/* Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-4">
          <div className="my-auto mb-2">
            <h3 className="mb-1 fw-bold" style={{color: '#1a1a1a'}}>Dashboard Overview</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Cập nhật: {new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="stats-card"
              style={{
                background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.15)';
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-white-50 small mb-1">Tổng đơn hàng của tháng</div>
                  <div className="text-white fw-bold" style={{fontSize: '1.5rem'}}>
                    {totalBookings.toLocaleString()}
                </div>
                  <div className="text-white-50 small mb-2">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                  <div className="d-flex align-items-center mt-2">
                    {percentChange > 0 ? (
                      <ArrowUpOutlined className="text-success me-1" />
                    ) : percentChange < 0 ? (
                      <ArrowDownOutlined className="text-danger me-1" />
                    ) : (
                      <span className="text-white-50 me-1">-</span>
                    )}
                    <span className={`small ${percentChange > 0 ? 'text-success' : percentChange < 0 ? 'text-danger' : 'text-white-50'}`}>
                      {percentChange === 0 ? 'Không đổi' : `${Math.abs(percentChange).toFixed(1)}% so với tháng trước`}
                    </span>
              </div>
              </div>
                <div className="stats-icon">
                  <CalendarOutlined style={{fontSize: '2rem', color: 'rgba(255,255,255,0.8)'}} />
                </div>
              </div>
          </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="stats-card"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(240, 147, 251, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(240, 147, 251, 0.15)';
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-white-50 small mb-1">Tổng doanh thu của tháng</div>
                  <div className="text-white fw-bold" style={{fontSize: '1.5rem'}}>
                    {currentRevenue.toLocaleString()} VND
                </div>
                  <div className="text-white-50 small mb-2" >
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                  <div className="d-flex align-items-center mt-2">
                    {percentRevenueChange > 0 ? (
                      <ArrowUpOutlined className="text-success me-1" />
                    ) : percentRevenueChange < 0 ? (
                      <ArrowDownOutlined className="text-danger me-1" />
                    ) : (
                      <span className="text-white-50 me-1">-</span>
                    )}
                    <span className={`small ${percentRevenueChange > 0 ? 'text-success' : percentRevenueChange < 0 ? 'text-danger' : 'text-white-50'}`}>
                      {percentRevenueChange === 0 ? 'Không đổi' : `${Math.abs(percentRevenueChange).toFixed(1)}% so với tháng trước`}
                    </span>
              </div>
              </div>
                <div className="stats-icon">
                  <DollarOutlined style={{fontSize: '2rem', color: 'rgba(255,255,255,0.8)'}} />
                </div>
              </div>
          </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="stats-card"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(79, 172, 254, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(79, 172, 254, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 172, 254, 0.15)';
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-white-50 small mb-1">Kỹ thuật viên đăng ký tháng</div>
                  <div className="text-white fw-bold" style={{fontSize: '1.5rem'}}>
                    {totalTechnicians.toLocaleString()}
                </div>
                  <div className="text-white-50 small mb-2">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                  <div className="d-flex align-items-center mt-2">
                    {percentTechnicianChange > 0 ? (
                      <ArrowUpOutlined className="text-success me-1" />
                    ) : percentTechnicianChange < 0 ? (
                      <ArrowDownOutlined className="text-danger me-1" />
                    ) : (
                      <span className="text-white-50 me-1">-</span>
                    )}
                    <span className={`small ${percentTechnicianChange > 0 ? 'text-success' : percentTechnicianChange < 0 ? 'text-danger' : 'text-white-50'}`}>
                      {percentTechnicianChange === 0 ? 'Không đổi' : `${Math.abs(percentTechnicianChange).toFixed(1)}% so với tháng trước`}
                    </span>
              </div>
                </div>
                <div className="stats-icon">
                  <ToolOutlined style={{fontSize: '2rem', color: 'rgba(255,255,255,0.8)'}} />
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="stats-card"
              style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(67, 233, 123, 0.15)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(67, 233, 123, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(67, 233, 123, 0.15)';
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-white-50 small mb-1">Tổng số lượng người dùng</div>
                  <div className="text-white fw-bold" style={{fontSize: '1.5rem'}}>
                    {dashboardStats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-white-50 small mb-2">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <span className="small text-white-50">
                      {dashboardStats.pendingBookings} đơn hàng chờ xác nhận
                    </span>
                  </div>
                </div>
                <div className="stats-icon">
                  <UserOutlined style={{fontSize: '2rem', color: 'rgba(255,255,255,0.8)'}} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold" style={{color: '#1F2937', fontSize: '1.1rem'}}>Số liệu doanh thu từ Package</span>
                  <div className="d-flex align-items-center gap-2">
                    
                  </div>
                </div>
              }
              style={{
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(156, 163, 175, 0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <div style={{height: '320px', position: 'relative'}}>
                
                <Bar
                  data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [
                    {
                        label: `${currentYear}`,
                        data: revenueThisYear,
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        barPercentage: 0.8,
                        categoryPercentage: 0.9,
                        hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                        hoverBorderColor: 'rgba(59, 130, 246, 1)',
                        hoverBorderWidth: 3,
                      },
                      {
                        label: `${lastYear}`,
                        data: revenueLastYear,
                        backgroundColor: 'rgba(156, 163, 175, 0.8)',
                        borderColor: 'rgba(156, 163, 175, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        barPercentage: 0.8,
                        categoryPercentage: 0.9,
                        hoverBackgroundColor: 'rgba(156, 163, 175, 1)',
                        hoverBorderColor: 'rgba(156, 163, 175, 1)',
                        hoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={barChartOptions}
                />
                {revenueChartLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px'
                  }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
              </div>
        </div>
                )}
              </div>
          </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold" style={{color: '#1F2937', fontSize: '1.1rem'}}>Thống kê số liệu hiện tại</span>
                </div>
              }
              style={{
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(156, 163, 175, 0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
              }}
            >
              <div className="d-flex flex-column justify-content-between" style={{height: '320px'}}>
                <div className="d-flex align-items-center justify-content-between p-3" style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(251, 146, 60, 0.2)',
                  transition: 'all 0.3s ease',
                  height: '70px'
                }}>
                  <div>
                    <div className="small" style={{color: '#ea580c', fontWeight: '600', fontSize: '12px'}}>Đơn hàng đang chờ</div>
                    <div className="fw-bold" style={{fontSize: '1.3rem', color: '#ea580c'}}>{dashboardStats.pendingBookings}</div>
                  </div>
                  <ClockCircleOutlined style={{fontSize: '1.6rem', color: '#f97316'}} />
                </div>

                <div className="d-flex align-items-center justify-content-between p-3" style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  transition: 'all 0.3s ease',
                  height: '70px'
                }}>
                  <div>
                    <div className="small" style={{color: '#16a34a', fontWeight: '600', fontSize: '12px'}}>Đơn hàng đã hoàn tất</div>
                    <div className="fw-bold" style={{fontSize: '1.3rem', color: '#16a34a'}}>{dashboardStats.completedBookings}</div>
                  </div>
                  <CheckCircleOutlined style={{fontSize: '1.6rem', color: '#22c55e'}} />
                </div>

                <div className="d-flex align-items-center justify-content-between p-3" style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  height: '70px'
                }}>
                  <div>
                    <div className="small" style={{color: '#2563eb', fontWeight: '600', fontSize: '12px'}}>Kỹ thuật viên có sẵn</div>
                    <div className="fw-bold" style={{fontSize: '1.3rem', color: '#2563eb'}}>{dashboardStats.activeTechnicians}</div>
                  </div>
                  <ToolOutlined style={{fontSize: '1.6rem', color: '#3b82f6'}} />
                </div>

                <div className="d-flex align-items-center justify-content-between p-3" style={{
                  background: 'linear-gradient(135deg, #fefce8 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  transition: 'all 0.3s ease',
                  height: '70px'
                }}>
                  <div>
                    <div className="small" style={{color: '#d97706', fontWeight: '600', fontSize: '12px'}}>Điểm đánh giá trung bình của kỹ thuật viên</div>
                    <div className="fw-bold" style={{fontSize: '1.3rem', color: '#d97706'}}>{dashboardStats.averageRating.toFixed(1)}</div>
                  </div>
                  <StarOutlined style={{fontSize: '1.6rem', color: '#f59e0b'}} />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Bookings & Top Technicians */}
        <Row gutter={[16, 16]} style={{alignItems: 'stretch'}}>
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold">Đơn hàng gần đây</span>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => navigate('/admin/booking-management')}
                    className="p-0"
                  >
                    Xem tất cả
              </Button>
                      </div>
              }
              style={{
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              styles={{ body: {flex: 1, display: 'flex', flexDirection: 'column'} }}
            >
                  {recentBookingsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                  ) : recentBookings.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <CalendarOutlined style={{fontSize: '2rem', marginBottom: '1rem'}} />
                  <div>Không có đơn hàng nào</div>
                </div>
              ) : (
                <div className="space-y-3" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                  {recentBookings.map((booking, index) => (
                    <div 
                      key={booking.id} 
                      className="d-flex align-items-center justify-content-between p-3"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)' : '#f8f9fa', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        if (index !== 0) {
                          e.currentTarget.style.background = '#e9ecef';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        if (index !== 0) {
                          e.currentTarget.style.background = '#f8f9fa';
                        }
                      }}
                      onClick={() => {
                                     setSelectedBooking(booking);
                                     setShowDetailModal(true);
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="d-flex align-items-center justify-content-center me-3" 
                             style={{
                               width: '40px', 
                               height: '40px', 
                               borderRadius: '50%',
                               background: index === 0 ? '#fff' : '#e9ecef',
                               fontWeight: 'bold',
                               fontSize: '1.2rem',
                               color: index === 0 ? '#667eea' : '#666'
                             }}>
                          {index + 1}
                      </div>
                        <div>
                          <div className={`fw-bold ${index === 0 ? 'text-white' : ''}`}>
                            {booking.user?.fullName || 'Unknown User'}
                    </div>
                          <div className={`small ${index === 0 ? 'text-white-50' : 'text-muted'}`}>
                            {booking.service?.serviceName || 'Unknown Service'}
                      </div>
                          <div className={`small ${index === 0 ? 'text-white-50' : 'text-muted'}`}>
                            {booking.schedule?.startTime ? new Date(booking.schedule.startTime).toLocaleDateString() : 'No date'}
                    </div>
                      </div>
                    </div>
                      <div className="text-end">
                        <Tag 
                          color={getStatusColor(booking.status)} 
                          icon={getStatusIcon(booking.status)}
                          style={{
                            background: index === 0 ? 'rgba(255,255,255,0.2)' : undefined,
                            border: index === 0 ? '1px solid rgba(255,255,255,0.3)' : undefined,
                            color: index === 0 ? '#fff' : undefined
                          }}
                        >
                          {booking.status?.replace(/_/g, ' ') || 'Unknown'}
                        </Tag>
                        <div className={`small mt-1 ${index === 0 ? 'text-white-50' : 'text-muted'}`}>
                          {booking.bookingCode || booking.id}
                  </div>
                </div>
                    </div>
                  ))}
                </div>
              )}
          </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title={
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-bold">Xếp hạng kỹ thuật viên</span>
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => navigate('/admin/technician-management')}
                    className="p-0"
                  >
                    Xem tất cả
                  </Button>
                    </div>
              }
              style={{
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              styles={{ body: {flex: 1, display: 'flex', flexDirection: 'column'} }}
            >
              {topTechniciansLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                    </div>
                    </div>
              ) : topTechnicians.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <ToolOutlined style={{fontSize: '2rem', marginBottom: '1rem'}} />
                  <div>Không có kỹ thuật viên nào</div>
                    </div>
              ) : (
                <div className="space-y-3" style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                  {topTechnicians.map((tech, index) => (
                    <div 
                      key={tech.id} 
                      className="d-flex align-items-center p-3"
                      style={{
                        background: index === 0 ? 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)' : '#f8f9fa',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'translateY(0)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        if (index !== 0) {
                          e.currentTarget.style.background = '#e9ecef';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        if (index !== 0) {
                          e.currentTarget.style.background = '#f8f9fa';
                        }
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center me-3" 
                           style={{
                             width: '40px', 
                             height: '40px', 
                             borderRadius: '50%',
                             background: index === 0 ? '#fff' : '#e9ecef',
                             fontWeight: 'bold',
                             fontSize: '1.2rem',
                             color: index === 0 ? '#ffc107' : '#666'
                           }}>
                        {index + 1}
                  </div>
                      <div className="flex-grow-1">
                        <div className={`fw-bold ${index === 0 ? 'text-white' : ''}`}>
                          {tech.user?.fullName || 'Unknown Technician'}
                </div>
                        <div className={`small ${index === 0 ? 'text-white-50' : 'text-muted'}`}>
                          Số công việc đã thực hiện: {tech.jobCompleted || 0}
                      </div>
                    </div>
                      <div className="text-end">
                        <div className="d-flex align-items-center">
                          <StarOutlined style={{
                            color: index === 0 ? '#fff' : '#ffc107', 
                            marginRight: '4px'
                          }} />
                          <span className={`fw-bold ${index === 0 ? 'text-white' : ''}`}>
                            {tech.ratingAverage?.toFixed(1) || '0.0'}
                          </span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Booking Detail Modal */}
        {showDetailModal && selectedBooking && (
          <Modal
            open={showDetailModal}
            onCancel={() => setShowDetailModal(false)}
            footer={null}
            title={null}
            width={960}
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
          >
            <div style={{background: '#fff', borderRadius: 12, overflow: 'hidden'}}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg,rgb(237, 235, 121) 0%,rgb(217, 164, 4) 100%)',
                padding: 24,
                color: '#fff'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <div style={{fontSize: 22, fontWeight: 700}}>Chi tiết đơn hàng</div>
                    <div style={{fontSize: 13, opacity: 0.9}}>ID: {selectedBooking.bookingCode || selectedBooking.id}</div>
                      </div>
                  <div style={{textAlign: 'right'}}>
                    <Tag color={getStatusColor(selectedBooking.status)} style={{fontSize: 12, fontWeight: 600}}>
                      {selectedBooking.status?.replace(/_/g, ' ') || 'Unknown'}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                <Row gutter={16}>
                  {/* Overview */}
                  <Col span={12}>
                    <div style={{background: '#fafafa', padding: 16, borderRadius: 8}}>
                      <div style={{fontWeight: 600, marginBottom: 12}}>Tổng quan</div>
                      <Descriptions size="small" column={1} bordered={false}
                        items={[
                          { key: 'service', label: 'Dịch vụ', children: selectedBooking.service?.serviceName || 'N/A' },
                          { key: 'location', label: 'Địa chỉ', children: selectedBooking.location?.address || 'N/A' },
                          { key: 'scheduledAt', label: 'Lịch trình', children: (
                            selectedBooking.schedule?.startTime
                              ? `${dayjs(selectedBooking.schedule.startTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}${selectedBooking.schedule?.endTime
                                  ? ` - ${dayjs(selectedBooking.schedule.endTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                                  : (selectedBooking.schedule?.expectedEndTime
                                      ? ` - ${dayjs(selectedBooking.schedule.expectedEndTime).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY, HH:mm:ss')}`
                                      : '')}`
                              : 'Chưa có lịch trình'
                          ) },
                        ]}
                      />
            </div>
                  </Col>
                  {/* People */}
                  <Col span={12}>
                    <div style={{background: '#fafafa', padding: 16, borderRadius: 8}}>
                      <div style={{fontWeight: 600, marginBottom: 12}}>Khách hàng & Kỹ thuật viên</div>
                      <Descriptions size="small" column={1} bordered={false}
                        items={[
                          { key: 'customer', label: 'Khách hàng', children: selectedBooking.user?.fullName || '' },
                          { key: 'technician', label: 'Kỹ thuật viên', children: (selectedBooking.technicianId && technicianMap[selectedBooking.technicianId]) || '' },
                        ]}
                      />
              </div>
                  </Col>
                </Row>
                <Divider style={{ margin: '16px 0' }} />

                {/* Status & Flags */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Trạng thái & Thanh toán</div>
                  <Row gutter={12}>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', background: '#e6f7ff', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Trạng thái thanh toán</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1890ff' }}>{selectedBooking.paymentStatus || ''}</div>
            </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Loại đặt lịch</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.isUrgent ? '#faad14' : '#888' }}>{selectedBooking.isUrgent ? 'Đặt lịch ngay' : 'Đặt lịch theo lịch trình'}</div>
                    </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Khách hàng xác nhận</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888' }}>{selectedBooking.customerConfirmedDone ? 'Đã xác nhận' : 'Chưa xác nhận'}</div>
                </div>
                    </Col>
                    <Col span={6}>
                      <div style={{ textAlign: 'center', background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: 12, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>Kỹ thuật viên xác nhận</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888' }}>{selectedBooking.technicianConfirmedDone ? 'Đã xác nhận' : 'Chưa xác nhận'}</div>
                    </div>
                    </Col>
                  </Row>
                    </div>

                <Divider style={{ margin: '16px 0' }} />

                {/* Description */}
                <div style={{background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16}}>
                  <div style={{fontWeight: 600, marginBottom: 8}}>Mô tả</div>
                  <div style={{ color: '#333' }}>{selectedBooking.description || ''}</div>
                  </div>

                {/* Images */}
                {selectedBooking.images && selectedBooking.images.length > 0 && (
                  <div style={{background: '#fafafa', padding: 16, borderRadius: 8}}>
                    <div style={{fontWeight: 600, marginBottom: 8}}>Images</div>
                    <Image.PreviewGroup>
                      <Row gutter={[8,8]}>
                        {selectedBooking.images.map((img, i) => (
                          <Col key={i} span={4}>
                            <Image 
                              src={img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL}${img}`} 
                              alt="booking" 
                              width={80} 
                              height={80} 
                              style={{ objectFit: 'cover', borderRadius: 6 }} 
                            />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
        </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;