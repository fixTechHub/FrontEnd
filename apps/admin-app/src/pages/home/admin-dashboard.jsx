import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
      tooltip: { enabled: false }
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
      y: { display: false },
    },
    elements: {
      point: { radius: 0 },
    },
  };
  const dispatch = useDispatch();
  const { bookingCountLoading } = useSelector(state => state.bookings);
  const { loading: revenueLoading } = useSelector(state => state.statistics);
  const { technicianCountLoading } = useSelector(state => state.technicians);
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
  const navigate = useNavigate();
  // Tính tổng booking của tháng hiện tại
  const nowForBooking = new Date();
  const currentMonthIndex = nowForBooking.getMonth(); // 0-based
  const totalBookings = bookingCounts[currentMonthIndex] || 0;
  // Tính tổng technician của tháng hiện tại
  const nowForTechnician = new Date();
  const currentMonthIndexTechnician = nowForTechnician.getMonth(); // 0-based
  const totalTechnicians = technicianCounts[currentMonthIndexTechnician] || 0;
  const now = new Date();
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;


  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    // Booking count tháng này và tháng trước
    dispatch(getBookingCountByMonth({ year, month })).then((action) => {
      const current = action.payload?.count || 0;
      dispatch(getBookingCountByMonth({ year: prevYear, month: prevMonth })).then((prevAction) => {
        const prev = prevAction.payload?.count || 0;
        let percent = 0;
        if (prev === 0) {
          percent = current > 0 ? 100 : 0;
        } else {
          percent = ((current - prev) / prev) * 100;
        }
        setPercentChange(percent);
      });
    });

    // Technician count tháng này và tháng trước
    dispatch(getTechnicianCountByMonth({ year, month })).then((action) => {
      const current = action.payload?.count || 0;
      dispatch(getTechnicianCountByMonth({ year: prevYear, month: prevMonth })).then((prevAction) => {
        const prev = prevAction.payload?.count || 0;
        let percent = 0;
        if (prev === 0) {
          percent = current > 0 ? 100 : 0;
        } else {
          percent = ((current - prev) / prev) * 100;
        }
        setPercentTechnicianChange(percent);
      });
    });

    // Doanh thu tháng này
    dispatch(getMonthlyRevenue({ year, month })).then((action) => {
      const current = action.payload?.revenue || 0;
      setCurrentRevenue(current);
      // Doanh thu tháng trước
      dispatch(getMonthlyRevenue({ year: prevYear, month: prevMonth })).then((prevAction) => {
        const prev = prevAction.payload?.revenue || 0;
        let percent = 0;
        if (prev === 0) {
          percent = current > 0 ? 100 : 0;
        } else {
          percent = ((current - prev) / prev) * 100;
        }
        setPercentRevenueChange(percent);
      });
    });

    // Booking chart
    Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        dispatch(getBookingCountByMonth({ year, month: i + 1 }))
      )
    ).then(results => {
      const counts = results.map(r => r.payload?.count || 0);
      setBookingCounts(counts);
    });
    // Revenue chart
    Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        dispatch(getMonthlyRevenue({ year, month: i + 1 }))
      )
    ).then(results => {
      setRevenueCounts(results.map(r => r.payload?.revenue || 0));
    });
    // Technician chart
    Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        dispatch(getTechnicianCountByMonth({ year, month: i + 1 }))
      )
    ).then(results => {
      setTechnicianCounts(results.map(r => r.payload?.count || 0));
    });

    setRecentBookingsLoading(true);
    bookingAPI.getAll()
      .then(async (data) => {
        // Sắp xếp theo CreatedAt giảm dần, lấy 5 booking mới nhất
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        // Lấy tất cả customerId và serviceId duy nhất
        const customerIds = [...new Set(sorted.map(b => b.customerId).filter(Boolean))];
        const serviceIds = [...new Set(sorted.map(b => b.serviceId).filter(Boolean))];

        // Tạo map cache
        const userMap = {};
        const serviceMap = {};

        // Lấy thông tin user (song song) với deduplication
        await Promise.all(customerIds.map(async id => {
          try {
            const user = await userAPI.getById(id);
            userMap[id] = user?.fullName || user?.email || '';
          } catch {
            userMap[id] = '';
          }
        }));

        // Lấy thông tin service (song song) với deduplication
        await Promise.all(serviceIds.map(async id => {
          try {
            const service = await serviceAPI.getById(id);
            serviceMap[id] = service?.serviceName || '';
          } catch {
            serviceMap[id] = '';
          }
        }));

        // Gán tên vào booking
        const bookingsWithNames = sorted.map(booking => ({
          ...booking,
          customerName: userMap[booking.customerId] || '',
          serviceName: serviceMap[booking.serviceId] || ''
        }));

        setRecentBookings(bookingsWithNames);
      })
      .catch(() => setRecentBookings([]))
      .finally(() => setRecentBookingsLoading(false));

    setTopTechniciansLoading(true);   
    technicianAPI.getAll()
      .then(async (data) => {
        // Sắp xếp theo ratingAverage giảm dần, lấy top 4
        const sorted = [...data].sort((a, b) => b.ratingAverage - a.ratingAverage).slice(0, 4);
        // Lấy thông tin user cho từng technician với deduplication
        const users = await Promise.all(sorted.map(async t => {
          try {
            if (t.userId && t.userId.length === 24) {
              return await userAPI.getById(t.userId);
            } else {
              return { fullName: '', email: '', avatarUrl: '' };
            }
          } catch {
            return { fullName: '', email: '', avatarUrl: '' };
          }
        }));
        const withUser = sorted.map((t, i) => ({ ...t, user: users[i] }));
        setTopTechnicians(withUser);
      })
      .catch(() => setTopTechnicians([]))
      .finally(() => setTopTechniciansLoading(false));

    // Lấy doanh thu từng tháng cho 2 năm
    async function fetchYearlyRevenue(year) {
      const results = await Promise.all(
        Array.from({ length: 12 }, (_, i) =>
          fetchMonthlyRevenue(year, i + 1).then(res => res.revenue || 0).catch(() => 0)
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
  }, [dispatch, currentYear, lastYear]);

  useEffect(() => {
    if (showDetailModal && selectedBooking && selectedBooking.technicianId) {
      // Use deduplication logic for technician user fetch
      const technicianId = selectedBooking.technicianId;
      if (technicianId && technicianId.length === 24) {
        userAPI.getById(technicianId)
          .then(user => setTechnicianName(user?.fullName || user?.email || ''))
          .catch(() => setTechnicianName(''));
      } else {
        setTechnicianName('');
      }
    } else {
      setTechnicianName('');
    }
  }, [showDetailModal, selectedBooking]);


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
                  {bookingCountLoading ? '...' : totalBookings}
                </div>
                <div className={
                  `px-1 rounded ${percentChange > 0 ? 'bg-success text-white' : percentChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {bookingCountLoading ? '' :
                    percentChange > 0 ? `+${percentChange.toFixed(0)}%` :
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
                  {revenueLoading ? '...' : currentRevenue.toLocaleString()}
                </div>
                <div className={
                  `px-1 rounded ${percentRevenueChange > 0 ? 'bg-success text-white' : percentRevenueChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {revenueLoading ? '' :
                    percentRevenueChange > 0 ? `+${percentRevenueChange.toFixed(0)}%` :
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
                  {technicianCountLoading ? '...' : totalTechnicians}
                </div>
                <div className={
                  `px-1 rounded ${percentTechnicianChange > 0 ? 'bg-success text-white' : percentTechnicianChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {technicianCountLoading ? '' :
                    percentTechnicianChange > 0 ? `+${percentTechnicianChange.toFixed(0)}%` :
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
                  ) : recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.bookingCode}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.customerName}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.serviceName}</td>
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
                               onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                          <EyeOutlined style={{fontSize: '0.6rem'}} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
            width={650}
          >
            <div style={{background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', padding: 0}}>
              {/* Section: Main Info */}
              <div style={{padding: 24, borderBottom: '1px solid #eee', background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16}}>
                <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#222'}}>Booking Detail</div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 24}}>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Booking Code</div>
                    <div>{selectedBooking.bookingCode || selectedBooking.id}</div>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Customer</div>
                    <div>{selectedBooking.customerName || selectedBooking.customerId || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Technician</div>
                    <div>{technicianName}</div>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Service</div>
                    <div>{selectedBooking.serviceName || selectedBooking.serviceId || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Location</div>
                    <div>{selectedBooking.location?.address}</div>
                  </div>
                </div>
              </div>
              {/* Section: Status & Payment */}
              <div style={{padding: 20, borderBottom: '1px solid #eee', background: '#f6faff'}}>
                <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Status</div>
                    <span style={{background: '#e6f7ff', color: '#1890ff', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.status ? selectedBooking.status.replace(/_/g, ' ') : ''}</span>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Payment</div>
                    <span style={{background: '#f6ffed', color: '#52c41a', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.paymentStatus}</span>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Is Urgent</div>
                    <span style={{background: selectedBooking.isUrgent ? '#fffbe6' : '#f0f0f0', color: selectedBooking.isUrgent ? '#faad14' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.isUrgent ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Customer Confirmed</div>
                    <span style={{background: selectedBooking.customerConfirmedDone ? '#f6ffed' : '#f0f0f0', color: selectedBooking.customerConfirmedDone ? '#52c41a' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.customerConfirmedDone ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <div style={{fontWeight: 500, color: '#888'}}>Technician Confirmed</div>
                    <span style={{background: selectedBooking.technicianConfirmedDone ? '#f6ffed' : '#f0f0f0', color: selectedBooking.technicianConfirmedDone ? '#52c41a' : '#888', borderRadius: 6, padding: '2px 12px', fontWeight: 600}}>{selectedBooking.technicianConfirmedDone ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              {/* Section: Schedule & Description */}
              <div style={{padding: 20, borderBottom: '1px solid #eee', background: '#fff'}}>
                <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Schedule</div>
                <div style={{marginBottom: 12}}>
                  {selectedBooking.schedule?.startTime ? new Date(selectedBooking.schedule.startTime).toLocaleString() : ''}
                  {selectedBooking.schedule?.endTime
                    ? ` - ${new Date(selectedBooking.schedule.endTime).toLocaleString()}`
                    : (selectedBooking.schedule?.expectedEndTime ? ` - ${new Date(selectedBooking.schedule.expectedEndTime).toLocaleString()}` : '')}
                </div>
                <div style={{fontWeight: 500, color: '#888', marginBottom: 2}}>Description</div>
                <div>{selectedBooking.description}</div>
              </div>
              {/* Section: Images */}
              <div style={{padding: 20, background: '#f6faff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16}}>
                <div style={{fontWeight: 500, color: '#888', marginBottom: 8}}>Images</div>
                <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', minHeight: 60}}>
                  {selectedBooking.images && selectedBooking.images.length > 0 ? selectedBooking.images.map((img, idx) => (
                    <img key={idx} src={img} alt="img" style={{maxWidth: 120, maxHeight: 120, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover'}} />
                  )) : <span style={{color: '#aaa'}}>N/A</span>}
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
                      <div style={{fontSize: '0.85rem', fontWeight: 500}}>{tech.user?.fullName || tech.user?.email || 'Technician'}</div>
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