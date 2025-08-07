import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined } from '@ant-design/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';

// API imports
import ApiBE from '../../services/ApiBE';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { userAPI } from '../../features/users/userAPI';
import { serviceAPI } from '../../features/service/serviceAPI';
import { technicianAPI } from '../../features/technicians/techniciansAPI';

// Redux actions - import from correct slice files
import { getBookingCountByMonth } from '../../features/bookings/bookingSlice';
import { getMonthlyRevenue } from '../../features/statistics/statisticSlice';
import { getTechnicianCountByMonth } from '../../features/technicians/technicianSlice';

// API functions
import { fetchMonthlyRevenue } from '../../features/statistics/statisticAPI';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const AdminDashboard = () => {
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
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
        ticks: {
          display: true,
          font: { size: 12 },
          maxRotation: 0
        }
      },
      y: { 
        display: false,
        ticks: {
          callback: function(value) {
            return Math.round(value).toLocaleString();
          }
        }
      },
    },
    elements: {
      point: { radius: 0 },
    },
  };

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
  const [technicianName, setTechnicianName] = useState('');
  const [technicianMap, setTechnicianMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  
  // Tính tổng booking của tháng hiện tại
  const nowForBooking = new Date();
  const currentMonthIndex = nowForBooking.getMonth(); // 0-based
  const totalBookings = bookingCounts[currentMonthIndex] || 0;
  const lastMonthForBooking = currentMonthIndex === 0 ? 12 : currentMonthIndex;
  const lastYearForBooking = currentMonthIndex === 0 ? nowForBooking.getFullYear() - 1 : nowForBooking.getFullYear();
  const lastMonthIndex = lastMonthForBooking - 1;
  const totalLastMonthBookings = bookingCounts[lastMonthIndex] || 0;
  // Tính tổng technician của tháng hiện tại
  const nowForTechnician = new Date();
  const currentMonthIndexTechnician = nowForTechnician.getMonth(); // 0-based
  const totalTechnicians = technicianCounts[currentMonthIndexTechnician] || 0;
  const lastMonthIndexTechnician = lastMonthIndex;
  const totalLastMonthTechnicians = technicianCounts[lastMonthIndexTechnician] || 0;
  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;
  const currentMonth = now.getMonth() + 1;
  const lastMonthForRevenue = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastYearForRevenue = currentMonth === 1 ? lastYear : currentYear;

  useEffect(() => {
    setRecentBookingsLoading(true);
    bookingAPI.getAll()
      .then(async (data) => {
        // Sắp xếp theo createdAt giảm dần, lấy 5 booking gần nhất
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        
        // Lấy thông tin user và service cho từng booking với deduplication
        const users = await Promise.all(sorted.map(async b => {
          if (b.customerId && b.customerId.length === 24 && /^[0-9a-fA-F]{24}$/.test(b.customerId)) {
            try {
              const user = await userAPI.getById(b.customerId);
              return user || { fullName: 'Unknown User', email: '', avatarUrl: '' };
            } catch (error) {
              console.error(`❌ Error fetching user for booking ${b.id}:`, error);
              return { fullName: 'Unknown User', email: '', avatarUrl: '' };
            }
          } else {
            return { fullName: 'Unknown User', email: '', avatarUrl: '' };
          }
        }));
        
        // Lấy thông tin service cho từng booking
        const services = await Promise.all(sorted.map(async b => {
          if (b.serviceId && b.serviceId.length === 24 && /^[0-9a-fA-F]{24}$/.test(b.serviceId)) {
            try {
              const service = await serviceAPI.getById(b.serviceId);
              return service || { serviceName: 'Unknown Service', description: '' };
            } catch (error) {
              console.error(`❌ Error fetching service for booking ${b.id}:`, error);
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
      })
      .catch(() => setRecentBookings([]))
      .finally(() => setRecentBookingsLoading(false));

    setTopTechniciansLoading(true);   
    technicianAPI.getAll()
      .then(async (data) => {
        // Sắp xếp theo ratingAverage giảm dần, lấy top 5
        const sorted = [...data].sort((a, b) => b.ratingAverage - a.ratingAverage).slice(0, 5);
        // Sử dụng thông tin user đã có sẵn trong TechnicianDto từ BE
        const withUser = sorted.map(t => ({ 
          ...t, 
          user: {
            fullName: t.fullName || 'Unknown User',
            email: t.email || '',
            avatarUrl: ''
          }
        }));
        setTopTechnicians(withUser);
      })
      .catch(() => setTopTechnicians([]))
      .finally(() => setTopTechniciansLoading(false));

    // Lấy doanh thu từng tháng cho 2 năm
    async function fetchYearlyRevenue(year) {
      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetchMonthlyRevenue(year, i + 1).then(res => Math.round(res.revenue || 0)).catch(() => 0)
        )
      );
      return results;
    }
    setRevenueChartLoading(true);
    Promise.all([
      fetchYearlyRevenue(currentYear),
      fetchYearlyRevenue(lastYear)
    ]).then(([dataThisYear, dataLastYear]) => {
      setRevenueThisYear(dataThisYear);
      setRevenueLastYear(dataLastYear);
    }).finally(() => setRevenueChartLoading(false));
  }, [currentYear, lastYear]);

  // Fetch booking counts by month
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
        
        // Calculate percent change
        const currentMonth = new Date().getMonth();
        const currentCount = bookingData[currentMonth] || 0;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastCount = bookingData[lastMonth] || 0;
        const change = lastCount === 0 ? 0 : ((currentCount - lastCount) / lastCount) * 100;
        setPercentChange(change);
      } catch (error) {
        console.error('Error fetching booking counts:', error);
      }
    };
    
    fetchBookingCounts();
  }, [currentYear]);

  // Fetch technician counts by month
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
        
        // Calculate percent change
        const currentMonth = new Date().getMonth();
        const currentCount = technicianData[currentMonth] || 0;
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastCount = technicianData[lastMonth] || 0;
        const change = lastCount === 0 ? 0 : ((currentCount - lastCount) / lastCount) * 100;
        setPercentTechnicianChange(change);
      } catch (error) {
        console.error('Error fetching technician counts:', error);
      }
    };
    
    fetchTechnicianCounts();
  }, [currentYear]);

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Fetch revenue counts for all months
        const revenueCounts = await Promise.all(
          Array.from({ length: 12 }, (_, i) => 
            ApiBE.get(`/Dashboard/revenue?year=${currentYear}&month=${i + 1}`)
          )
        );
        
        const revenueData = revenueCounts.map(response => {
          const value = response.data.revenue || 0;
          return typeof value === 'number' ? Math.round(value) : 0;
        });
        setRevenueCounts(revenueData);
        
        // Set current revenue
        const currentMonth = new Date().getMonth();
        const currentRevenue = revenueData[currentMonth] || 0;
        setCurrentRevenue(currentRevenue);
        
        // Calculate percent change
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastRevenueValue = revenueData[lastMonth] || 0;
        const change = lastRevenueValue === 0 ? 0 : ((currentRevenue - lastRevenueValue) / lastRevenueValue) * 100;
        setPercentRevenueChange(change);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };
    
    fetchRevenueData();
  }, [currentYear]);

  useEffect(() => {
    const fetchTechnicianUser = async () => {
      if (showDetailModal && selectedBooking) {
        
        const technicianId = selectedBooking.technicianId;
        
        // Kiểm tra xem có technicianId không
        if (!technicianId) {
          setTechnicianName('Chưa có thợ được phân công');
          return;
        }

        // Sử dụng technicianMap nếu có
        if (technicianMap[technicianId]) {
          setTechnicianName(technicianMap[technicianId]);
          return;
        }

        try {
            const technician = await technicianAPI.getById(technicianId);
            if (technician) {
              setTechnicianName(technician.FullName || technician.Email || 'Thợ không xác định');
            } else {
              setTechnicianName('Thợ không xác định');
            }
          } catch (error) {
            console.error('❌ Error fetching technician user:', error);
            setTechnicianName('Lỗi khi tải thông tin thợ');
          }
      } else {
        setTechnicianName('');
      }
    };
    
    fetchTechnicianUser();
  }, [showDetailModal, selectedBooking, technicianMap]);

  // Fetch technician map
  useEffect(() => {
    technicianAPI.getAll()
      .then(technicians => {
        const map = {};
        technicians.forEach(t => {
          map[t.id] = t.fullName || t.FullName || t.email || t.Email || 'Unknown Technician';
        });
        setTechnicianMap(map);
      })
      .catch(error => {
        console.error('❌ Error fetching technicians:', error);
      });
  }, []);

  // Fetch user map
  useEffect(() => {
    userAPI.getAll()
      .then(users => {
        const map = {};
        users.forEach(u => {
          map[u.id] = u.fullName || u.FullName || u.email || u.Email || 'Unknown User';
        });
        setUserMap(map);
      })
      .catch(error => {
        console.error('❌ Error fetching users:', error);
      });
  }, []);

  // Fetch service map
  useEffect(() => {
    serviceAPI.getAll()
      .then(services => {
        const map = {};
        services.forEach(s => {
          map[s.id] = s.serviceName || s.ServiceName || s.description || 'Unknown Service';
        });
        setServiceMap(map);
      })
      .catch(error => {
        console.error('❌ Error fetching services:', error);
      });
  }, []);

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Dashboard</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="d-flex mb-3 flex-wrap gap-3">
          <Card style={{flex: 1, border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <Card.Body className="p-2">
              <div className="text-muted small mb-0">Total Bookings</div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-bold" style={{fontSize: '0.9rem'}}>
                  {totalBookings}
                </div>
                <div className={
                  `px-1 rounded ${percentChange > 0 ? 'bg-success text-white' : percentChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {percentChange > 0 ? `+${percentChange.toFixed(0)}%` :
                   percentChange < 0 ? `${percentChange.toFixed(0)}%` : '0%'}
                </div>
              </div>
              <div style={{fontSize: '0.55rem', color: '#666'}}>Compare last month</div>
              <div style={{height: '60px', marginTop: '2px'}}>
                <Line data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [
                    {
                      label: 'Bookings',
                      data: bookingCounts,
                      borderColor: '#4CAF50',
                      tension: 0.4,
                      borderWidth: 1.5,
                    },
                  ],
                }} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
          
          <Card style={{flex: 1, border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <Card.Body className="p-2">
              <div className="text-muted small mb-0">Total Revenue</div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-bold" style={{fontSize: '0.9rem'}}>
                  {Math.round(currentRevenue).toLocaleString()}
                </div>
                <div className={
                  `px-1 rounded ${percentRevenueChange > 0 ? 'bg-success text-white' : percentRevenueChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {percentRevenueChange > 0 ? `+${percentRevenueChange.toFixed(0)}%` :
                   percentRevenueChange < 0 ? `${percentRevenueChange.toFixed(0)}%` : '0%'}
                </div>
              </div>
              <div style={{fontSize: '0.55rem', color: '#666'}}>Compare last month</div>
              <div style={{height: '60px', marginTop: '2px'}}>
                <Line data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [
                    {
                      label: 'Revenue',
                      data: revenueCounts,
                      borderColor: '#FF9800',
                      tension: 0.4,
                      borderWidth: 1.5,
                    },
                  ],
                }} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
          
          <Card style={{flex: 1, border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <Card.Body className="p-2">
              <div className="text-muted small mb-0">Total Technicians</div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-bold" style={{fontSize: '0.9rem'}}>
                  {totalTechnicians}
                </div>
                <div className={
                  `px-1 rounded ${percentTechnicianChange > 0 ? 'bg-success text-white' : percentTechnicianChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {percentTechnicianChange > 0 ? `+${percentTechnicianChange.toFixed(0)}%` :
                   percentTechnicianChange < 0 ? `${percentTechnicianChange.toFixed(0)}%` : '0%'}
                </div>
              </div>
              <div style={{fontSize: '0.55rem', color: '#666'}}>Compare last month</div>
              <div style={{height: '60px', marginTop: '2px'}}>
                <Line data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  datasets: [
                    {
                      label: 'Technicians',
                      data: technicianCounts,
                      borderColor: '#2196F3',
                      tension: 0.4,
                      borderWidth: 1.5,
                    },
                  ],
                }} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Recent Bookings Table */}
        <div className="mb-3" style={{minWidth: '680px'}}>
          <Card style={{border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom d-flex justify-content-between align-items-center position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Recent Bookings</span>
              <Button variant="outline-primary" size="sm" className="py-0 px-1" style={{fontSize: '0.6rem'}} onClick={() => navigate('/admin/booking-management')}>
                <EyeOutlined style={{marginRight: 4}} />View
              </Button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover small mb-0">
                <thead className="position-sticky top-0 bg-white" style={{zIndex: 5}}>
                  <tr>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>CODE</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>CUSTOMER</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>SERVICE</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>SCHEDULE</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>STATUS</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>PAYMENT</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', textAlign: 'right', fontWeight: 'normal', color: '#666'}}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookingsLoading ? (
                    <tr><td colSpan={7} className="text-center">Loading...</td></tr>
                  ) : recentBookings.length === 0 ? (
                    <tr><td colSpan={7} className="text-center">No bookings found</td></tr>
                  ) : recentBookings.map((booking) => {
                    return (
                      <tr key={booking.id}>
                        <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.bookingCode}</td>
                        <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>
                          {typeof booking.user?.fullName === 'string' ? booking.user.fullName : ''}
                        </td>
                        <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>
                          {typeof booking.service?.serviceName === 'string' ? booking.service.serviceName : 'Unknown Service'}
                        </td>
                        
                        <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>
                          {booking.schedule?.startTime ? new Date(booking.schedule.startTime).toLocaleString() : ''}
                          {booking.schedule?.endTime
                            ? ` - ${new Date(booking.schedule.endTime).toLocaleString()}`
                            : (booking.schedule?.expectedEndTime ? ` - ${new Date(booking.schedule.expectedEndTime).toLocaleString()}` : '')}
                        </td>
                        <td style={{padding: '0.5rem'}}>
                          <span className={`badge rounded-pill ${
                            booking.status === 'Active' ? 'bg-success' : 
                            booking.status === 'Pending' ? 'bg-warning' : 
                            'bg-info'}`} 
                            style={{fontSize: '0.55rem', padding: '3px 6px'}}>
                            {booking.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.paymentStatus}</td>
                        <td style={{padding: '0.5rem', textAlign: 'right'}}>
                          <button className="btn btn-light btn-sm p-0 me-1" 
                                 style={{width: "20px", height: "20px"}}
                                 onClick={async () => { 
                                   try {
                                     // Tìm booking trong recentBookings trước
                                     const existingBooking = recentBookings.find(b => b.id === booking.id);
                                     if (existingBooking && existingBooking.technician) {
                                       setSelectedBooking(existingBooking);
                                       setShowDetailModal(true);
                                     } else {
                                       // Nếu không tìm thấy, fetch từ API
                                       const detailedBooking = await bookingAPI.getById(booking.id);
                                       setSelectedBooking(detailedBooking);
                                       setShowDetailModal(true);
                                     }
                                   } catch (error) {
                                     console.error('❌ Error fetching detailed booking:', error);
                                     // Fallback to booking from recentBookings
                                     setSelectedBooking(booking);
                                     setShowDetailModal(true);
                                   }
                                 }}>
                            <EyeOutlined style={{fontSize: '0.6rem'}} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </Card>
        </div>

        {/* Modal chi tiết booking */}
        {showDetailModal && selectedBooking && (
          <Modal
            open={showDetailModal}
            onCancel={() => setShowDetailModal(false)}
            footer={null}
            title={null}
            width={700}
          >
            <div style={{background: '#ffffff', borderRadius: 12, overflow: 'hidden'}}>
              {/* Header Section */}
              <div style={{background: 'linear-gradient(135deg, #000 0%, #FFAF47 100%)', padding: '24px', color: 'white'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontSize: '24px', fontWeight: 700, marginBottom: '4px'}}>Booking Details</div>
                    <div style={{fontSize: '14px', opacity: 0.9}}>ID: {selectedBooking.bookingCode || selectedBooking.id}</div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '12px', opacity: 0.8, marginBottom: '4px'}}>Status</div>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)', 
                      padding: '6px 12px', 
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {selectedBooking.status ? selectedBooking.status.replace(/_/g, ' ') : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div style={{padding: '24px'}}>
                {/* Basic Information Grid */}
                <div style={{marginBottom: '24px'}}>
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Basic Information</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Customer</div>
                      <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                        {selectedBooking.user?.fullName || 
                         selectedBooking.customerName || 
                         (selectedBooking.customerId && userMap[selectedBooking.customerId]) ||
                         selectedBooking.customerId || 
                         'N/A'}
                      </div>
                    </div>
                    <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Technician</div>
                      <div style={{
                        fontSize: '14px', 
                        fontWeight: 500, 
                        color: (selectedBooking.technicianId && technicianMap[selectedBooking.technicianId]) ? '#333' : 
                               selectedBooking.technicianId ? '#666' : '#ff4d4f',
                        fontStyle: (!selectedBooking.technicianId || !technicianMap[selectedBooking.technicianId]) ? 'italic' : 'normal'
                      }}>
                        {selectedBooking.technicianId && technicianMap[selectedBooking.technicianId] ? 
                         technicianMap[selectedBooking.technicianId] : 
                         selectedBooking.technicianId ? 'Thợ không xác định' : 'Chưa có thợ được phân công'}
                      </div>
                    </div>
                    <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Service</div>
                      <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                        {selectedBooking.service?.serviceName || 
                         selectedBooking.serviceName || 
                         (selectedBooking.serviceId && serviceMap[selectedBooking.serviceId]) ||
                         selectedBooking.serviceId || 
                         'N/A'}
                      </div>
                    </div>
                    <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Location</div>
                      <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                        {selectedBooking.location?.address || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Payment Section */}
                <div style={{marginBottom: '24px'}}>
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Status & Payment</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{textAlign: 'center', background: '#e6f7ff', padding: '12px', borderRadius: '8px'}}>
                      <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Payment Status</div>
                      <div style={{fontSize: '13px', fontWeight: 600, color: '#1890ff'}}>{selectedBooking.paymentStatus}</div>
                    </div>
                    <div style={{textAlign: 'center', background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                      <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Urgent</div>
                      <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.isUrgent ? '#faad14' : '#888'}}>{selectedBooking.isUrgent ? 'Yes' : 'No'}</div>
                    </div>
                    <div style={{textAlign: 'center', background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                      <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Customer Confirmed</div>
                      <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888'}}>{selectedBooking.customerConfirmedDone ? 'Yes' : 'No'}</div>
                    </div>
                    <div style={{textAlign: 'center', background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', padding: '12px', borderRadius: '8px'}}>
                      <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>Technician Confirmed</div>
                      <div style={{fontSize: '13px', fontWeight: 600, color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888'}}>{selectedBooking.technicianConfirmedDone ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>

                {/* Schedule & Description Section */}
                <div style={{marginBottom: '24px'}}>
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Schedule & Description</div>
                  <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    <div style={{marginBottom: '12px'}}>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Schedule</div>
                      <div style={{fontSize: '14px', fontWeight: 500, color: '#333'}}>
                        {selectedBooking.schedule?.startTime ? new Date(selectedBooking.schedule.startTime).toLocaleString() : ''}
                        {selectedBooking.schedule?.endTime
                          ? ` - ${new Date(selectedBooking.schedule.endTime).toLocaleString()}`
                          : (selectedBooking.schedule?.expectedEndTime ? ` - ${new Date(selectedBooking.schedule.expectedEndTime).toLocaleString()}` : '')}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>Description</div>
                      <div style={{fontSize: '14px', color: '#333', lineHeight: '1.5'}}>
                        {selectedBooking.description || 'No description provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <div style={{fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '16px'}}>Images</div>
                  <div style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    {selectedBooking.images && selectedBooking.images.length > 0 ? (
                      <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                        {selectedBooking.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt="booking" 
                            style={{
                              width: '80px', 
                              height: '80px', 
                              borderRadius: '6px', 
                              objectFit: 'cover',
                              border: '1px solid #e9ecef'
                            }} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div style={{color: '#999', fontSize: '14px', textAlign: 'center', padding: '20px'}}>No images available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Revenue and technician rating*/}
        <div className="d-flex" style={{gap: '8px', minWidth: '680px'}}>
          <Card style={{flex: '2', minWidth: '440px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Monthly Revenue</span>
            </div>
            <Card.Body className="p-2">
              <div style={{ height: '120px', position: 'relative', width: '100%' }}>
                <Bar
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: `${currentYear}`,
                        data: revenueThisYear,
                        backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50',
                        borderWidth: 1.5,
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.5,
                      },
                      {
                        label: `${lastYear}`,
                        data: revenueLastYear,
                        backgroundColor: '#9E9E9E',
                        borderColor: '#9E9E9E',
                        borderWidth: 1.5,
                        borderRadius: 4,
                        barPercentage: 0.6,
                        categoryPercentage: 0.5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                          boxWidth: 8,
                          padding: 2,
                          font: { size: 8 }
                        }
                      },
                      tooltip: {
                        enabled: true,
                        bodyFont: { size: 8 },
                        titleFont: { size: 8 }
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: {
                          display: true,
                          font: { size: 8 },
                          maxRotation: 0
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          borderDash: [2],
                          color: 'rgba(0,0,0,0.05)',
                        },
                        ticks: {
                          display: true,
                          font: { size: 8 },
                          callback: function(value) {
                            return value >= 1000 ? value/1000 + 'k' : value;
                          }
                        }
                      },
                    },
                  }}
                />
                {revenueChartLoading && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2}}><span>Loading...</span></div>}
              </div>
            </Card.Body>
          </Card>
          
          <Card style={{flex: '1', minWidth: '220px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom position-sticky top-0 bg-white d-flex justify-content-between align-items-center" style={{zIndex: 10}}>
              <span className="fw-medium small">Top Technicians Rating</span>
              <Button variant="outline-primary" size="sm" className="py-0 px-1" style={{fontSize: '0.6rem'}} onClick={() => navigate('/admin/technician-management')}>
                <EyeOutlined style={{marginRight: 4}} />View
              </Button>
            </div>
            <Card.Body className="p-2">
              {topTechniciansLoading ? (
                <div>Loading...</div>
              ) : topTechnicians.length === 0 ? (
                <div>No data</div>
              ) : topTechnicians.map((tech, idx) => (
                <div className="d-flex justify-content-between align-items-center mb-2" key={tech.id}>
                  <div className="d-flex align-items-center">
                    <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-primary-subtle" 
                          style={{width: "28px", height: "28px", overflow: 'hidden'}}>
                      {tech.user?.avatarUrl ? (
                        <img src={tech.user.avatarUrl} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <i className="bi bi-person" style={{fontSize: '1.2rem', color: '#888'}}></i>
                      )}
                    </div>
                    <div>
                        <div style={{fontSize: '0.85rem', fontWeight: 500}}>{tech.user?.fullName || tech.user?.email || ''}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>Jobs: {tech.jobCompleted}</div>
                </div>
                    </div>
                    <div style={{fontSize: '0.85rem', fontWeight: 500}}>
                      <i className="bi bi-star-fill text-warning" style={{marginRight: 2}}></i>
                      {tech.ratingAverage?.toFixed(2) ?? '0.00'}
                    </div>
                  </div>
                ))}
            </Card.Body>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;