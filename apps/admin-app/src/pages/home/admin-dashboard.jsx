import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import ReactApexChart from 'react-apexcharts';
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
import axios from 'axios';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'antd';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { userAPI } from '../../features/users/userAPI';
import { useDispatch, useSelector } from 'react-redux';
import { getBookingCountByMonth } from "../../features/bookings/bookingSlice";
import { getMonthlyRevenue } from "../../features/statistics/statisticSlice";
import { fetchMonthlyRevenue } from "../../features/statistics/statisticAPI";
import { getTechnicianCountByMonth } from "../../features/technicians/technicianSlice";
// Add Bootstrap CSS import
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Descriptions } from 'antd';
import { serviceAPI } from '../../features/service/serviceAPI';

// Register ChartJS components
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

const ReservationStatistics = ({ data, labels }) => (
  <Bar
    data={{
      labels: labels,
      datasets: [
        {
          label: "Số lượng đặt chỗ",
          data: data,
          backgroundColor: "#127384",
        },
      ],
    }}
    options={{
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: { title: { display: true, text: "Ngày" } },
        y: { title: { display: true, text: "Số lượng" }, beginAtZero: true },
      },
    }}
    height={360}
  />
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
        display: true, // Đảm bảo hiển thị trục X
        ticks: {
          display: true, // Đảm bảo hiển thị tên tháng
          font: { size: 12 }, // Có thể tăng size nếu muốn
          maxRotation: 0
        }
      },
      y: { display: false },
    },
    elements: {
      point: { radius: 0 },
    },
  };

  // const recentReservations = [
  //   {
  //     id: 1,
  //     days: 3,
  //     car: 'Ford Endeavour',
  //     route: 'Newyork → Vegas',
  //     date: '15 Jan 2025',
  //     price: 280,
  //     status: 'Active',
  //   },
  //   {
  //     id: 2,
  //     days: 4,
  //     car: 'Ferrari 458 MM',
  //     route: 'Chicago → Houston',
  //     date: '07 Feb 2025',
  //     price: 225,
  //     status: 'Active',
  //   },
  //   {
  //     id: 3,
  //     days: 5,
  //     car: 'Ford Mustang',
  //     route: 'LA → New York',
  //     date: '14 Feb 2025',
  //     price: 259,
  //     status: 'Pending',
  //   },
  //   {
  //     id: 4,
  //     days: 6,
  //     car: 'Toyota Tacoma',
  //     route: 'Phoenix → Antonio',
  //     date: '08 Jan 2025',
  //     price: 180,
  //     status: 'Active',
  //   },
  //   {
  //     id: 5,
  //     days: 7,
  //     car: 'Chevrolet Truck',
  //     route: 'Newyork → Chicago',
  //     date: '17 Feb 2025',
  //     price: 300,
  //     status: 'Completed',
  //   },
  // ];

  const dispatch = useDispatch();
  const { bookingCount, bookingCountLoading } = useSelector(state => state.bookings);
  const { monthlyRevenue, loading: revenueLoading } = useSelector(state => state.statistics);
  const { technicianCount, technicianCountLoading } = useSelector(state => state.technicians);

  // Lưu state cho tháng trước
  const [percentChange, setPercentChange] = useState(0);
  const [percentTechnicianChange, setPercentTechnicianChange] = useState(0);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [percentRevenueChange, setPercentRevenueChange] = useState(0);
  const [bookingCounts, setBookingCounts] = useState(Array(12).fill(0));
  const [revenueCounts, setRevenueCounts] = useState(Array(12).fill(0));
  const [technicianCounts, setTechnicianCounts] = useState(Array(12).fill(0));
  const [lastMonthBookingCount, setLastMonthBookingCount] = useState(null);
  const [lastMonthTechnicianCount, setLastMonthTechnicianCount] = useState(null);
  const [lastMonthRevenue, setLastMonthRevenue] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentBookingsLoading, setRecentBookingsLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [topTechnicians, setTopTechnicians] = useState([]);
  const [topTechniciansLoading, setTopTechniciansLoading] = useState(false);
  const navigate = useNavigate();
  const [revenueThisYear, setRevenueThisYear] = useState(Array(12).fill(0));
  const [revenueLastYear, setRevenueLastYear] = useState(Array(12).fill(0));
  const [revenueChartLoading, setRevenueChartLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [serviceName, setServiceName] = useState('');

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
        setLastMonthBookingCount(prev);
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
        setLastMonthTechnicianCount(prev);
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
        setLastMonthRevenue(prev);
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
      console.log('BookingCounts:', counts);
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

        // Lấy thông tin user (song song)
        await Promise.all(customerIds.map(async id => {
          try {
            const user = await userAPI.getById(id);
            userMap[id] = user.fullName || user.email || id;
          } catch {
            userMap[id] = id;
          }
        }));

        // Lấy thông tin service (song song)
        await Promise.all(serviceIds.map(async id => {
          try {
            const service = await serviceAPI.getById(id);
            serviceMap[id] = service.serviceName || id;
          } catch {
            serviceMap[id] = id;
          }
        }));

        // Gán tên vào booking
        const bookingsWithNames = sorted.map(booking => ({
          ...booking,
          customerName: userMap[booking.customerId] || booking.customerId || 'N/A',
          serviceName: serviceMap[booking.serviceId] || booking.serviceId || 'N/A'
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
        // Lấy thông tin user cho từng technician, nếu lỗi thì trả về user mặc định
        const users = await Promise.all(sorted.map(async t => {
          try {
            return await userAPI.getById(t.userId);
          } catch {
            return { fullName: 'Unknown', email: '', avatarUrl: '' };
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
    // Xóa useEffect fetch tên user/service khi mở modal
  }, [selectedBooking, showDetailModal]);

  // Tính tổng booking của tháng hiện tại
  const nowForBooking = new Date();
  const currentMonthIndex = nowForBooking.getMonth(); // 0-based
  const totalBookings = bookingCounts[currentMonthIndex] || 0;

  // Tính tổng technician của tháng hiện tại
  const nowForTechnician = new Date();
  const currentMonthIndexTechnician = nowForTechnician.getMonth(); // 0-based
  const totalTechnicians = technicianCounts[currentMonthIndexTechnician] || 0;

  // Heatmap options và series mẫu
  // const heatmapOptions = {
  //   chart: {
  //     type: 'heatmap',
  //     toolbar: { show: false }
  //   },
  //   dataLabels: { enabled: false },
  //   xaxis: {
  //     categories: ["25 Jan", "26 Jan", "27 Jan", "28 Jan", "29 Jan", "30 Jan"]
  //   },
  //   yaxis: {
  //     categories: ["10 PM", "08 PM", "06 PM", "04 PM", "02 PM", "12 PM", "10 AM", "08 AM"]
  //   },
  //   colors: ["#127384"],
  //   grid: { show: false },
  // };
  // const heatmapSeries = [
  //   { name: "10 PM", data: [0, 0, 0, 0, 3, 3] },
  //   { name: "08 PM", data: [0, 4, 0, 0, 0, 1] },
  //   { name: "06 PM", data: [2, 0, 0, 0, 3, 0] },
  //   { name: "04 PM", data: [2, 0, 0, 0, 3, 0] },
  //   { name: "02 PM", data: [0, 1, 0, 5, 0, 0] },
  //   { name: "12 PM", data: [0, 0, 3, 0, 0, 2] },
  //   { name: "10 AM", data: [2, 0, 4, 3, 0, 0] },
  //   { name: "08 AM", data: [0, 0, 2, 0, 0, 3] },
  // ];

  return (
    <div className="modern-page-  wrapper">
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

        {/* <!-- Reservation Statistics -->
					<div className="col-xl-4 d-flex">
						<div className="card flex-fill">
							<div className="card-body pb-0">
								<div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
									<h5 className="mb-1">Reservation Statistics</h5>
									<a href="reservations.html" className="text-decoration-underline fw-medium mb-1">View All</a>
								</div>
								<div id="statistics_chart"></div>
							</div>
						</div>
					</div>
					<!-- /Reservation Statistics --> */}

        {/* Recent Bookings Table */}
        <div className="mb-3" style={{minWidth: '680px'}}>
          <Card style={{border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom d-flex justify-content-between align-items-center position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Recent Bookings</span>
              <Button variant="outline-primary" size="sm" className="py-0 px-1" style={{fontSize: '0.6rem'}} onClick={() => navigate('/admin/booking-management')}>View</Button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover small mb-0">
                <thead className="position-sticky top-0 bg-white" style={{zIndex: 5}}>
                  <tr>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>CODE</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>DESCRIPTION</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>ADDRESS</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>START TIME</th>
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
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.description}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.location?.address}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.schedule ? new Date(booking.schedule.startTime).toLocaleString() : ''}</td>
                      <td style={{padding: '0.5rem'}}>
                        <span className={`badge rounded-pill ${
                          booking.status === 'Active' ? 'bg-success' : 
                          booking.status === 'Pending' ? 'bg-warning' : 
                          'bg-info'}`} 
                          style={{fontSize: '0.55rem', padding: '3px 6px'}}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{booking.paymentStatus}</td>
                      <td style={{padding: '0.5rem', textAlign: 'right'}}>
                        <button className="btn btn-light btn-sm p-0 me-1" 
                               style={{width: "20px", height: "20px"}}
                               onClick={() => { setSelectedBooking(booking); setShowDetailModal(true); }}>
                          <i className="bi bi-eye" style={{fontSize: '0.6rem'}}></i>
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
            title="Booking Detail"
            width={600}
          >
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Booking Code">{selectedBooking.bookingCode || selectedBooking.id}</Descriptions.Item>
              <Descriptions.Item label="Customer">{selectedBooking.customerName || selectedBooking.customerId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Service">{selectedBooking.serviceName || selectedBooking.serviceId || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedBooking.status}</Descriptions.Item>
              <Descriptions.Item label="Schedule">
                {selectedBooking.schedule?.startTime ? new Date(selectedBooking.schedule.startTime).toLocaleString() : ''}
                {selectedBooking.schedule?.endTime
                  ? ` - ${new Date(selectedBooking.schedule.endTime).toLocaleString()}`
                  : (selectedBooking.schedule?.expectedEndTime ? ` - ${new Date(selectedBooking.schedule.expectedEndTime).toLocaleString()}` : '')}
              </Descriptions.Item>
            </Descriptions>
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
            <div className="py-2 px-2 border-bottom position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Top Technicians Rating</span>
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

        {/* <div className="col-xl-4 d-flex">
          <div className="card flex-fill">
            <div className="card-body pb-0">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
                <h5 className="mb-1">Reservation Statistics</h5>
                <a href="/admin/reservations" className="text-decoration-underline fw-medium mb-1">View All</a>
              </div>
              <div style={{ minHeight: 375 }}>
                <ReactApexChart
                  options={heatmapOptions}
                  series={heatmapSeries}
                  type="heatmap"
                  height={360}
                />
              </div>
            </div>
          </div>
        </div> */}

        {/* <!-- /Recent Invoices -->*/}
        {/* <div className="col-md-12">
						<div className="card">
							<div className="card-body">
								<div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-3">
									<h5 className="mb-1">Recent Invoices</h5>
									<a href="invoices.html" className="text-decoration-underline fw-medium mb-1">View All</a>
								</div>
								<div className="custom-table table-responsive">
									<table className="table">
										<thead>
											<tr>
												<th>INVOICE NO</th>
												<th>NAME</th>
												<th>EMAIL</th>
												<th>CREATED DATE</th>
												<th>DUE DATE</th>
												<th>INVOICE AMOUNT</th>
												<th>STATUS</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<a href="invoice-details.html" className="fs-12 fw-medium">#12345</a>
												</td>
												<td>
													<div className="d-flex align-items-center">
														<a href="customer-details.html" className="avatar flex-shrink-0">
															<img src="assets/img/profiles/avatar-20.jpg" className="rounded-circle" alt="" />
														</a>
														<div className="flex-grow-1 ms-2">
															<h6 className="fs-14 fw-semibold mb-1"><a href="customer-details.html">Andrew Simons </a></h6>
														</div>
													</div>
												</td>
												<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="ed8c83899f889aad88958c809d8188c38e8280">[email&#160;protected]</a></td>
												<td>24 Jan 2025</td>
												<td>24 Jan 2025</td>
												<td>$120.00</td>												
												<td>
													<span className="badge badge-md bg-success-transparent d-inline-flex align-items-center"><i className="ti ti-circle-filled fs-6 me-2"></i>Paid</span>
												</td>
											</tr>
											<tr>
												<td>
													<a href="invoice-details.html" className="fs-12 fw-medium">#12346</a>
												</td>
												<td>
													<div className="d-flex align-items-center">
														<a href="customer-details.html" className="avatar flex-shrink-0">
															<img src="assets/img/profiles/avatar-21.jpg" className="rounded-circle" alt="" />
														</a>
														<div className="flex-grow-1 ms-2">
															<h6 className="fs-14 fw-semibold mb-1"><a href="customer-details.html">David Steiger</a></h6>
														</div>
													</div>
												</td>
												<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="d2b6b3a4bbb692b7aab3bfa2beb7fcb1bdbf">[email&#160;protected]</a></td>
												<td>19 Dec 2024</td>
												<td>19 Dec 2024</td>
												<td>$85.00</td>												
												<td>
													<span className="badge badge-md bg-info-transparent d-inline-flex align-items-center"><i className="ti ti-circle-filled fs-6 me-2"></i>Pending</span>
												</td>
											</tr>
											<tr>
												<td>
													<a href="invoice-details.html" className="fs-12 fw-medium">#12347</a>
												</td>
												<td>
													<div className="d-flex align-items-center">
														<a href="customer-details.html" className="avatar flex-shrink-0">
															<img src="assets/img/profiles/avatar-12.jpg" className="rounded-circle" alt="" />
														</a>
														<div className="flex-grow-1 ms-2">
															<h6 className="fs-14 fw-semibold mb-1"><a href="customer-details.html">Virginia Phu</a></h6>
														</div>
													</div>
												</td>
												<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b0c0d8c5f0d5c8d1ddc0dcd59ed3dfdd">[email&#160;protected]</a></td>
												<td>11 Dec 2024</td>
												<td>11 Dec 2024</td>
												<td>$250.00</td>												
												<td>
													<span className="badge badge-md bg-success-transparent d-inline-flex align-items-center"><i className="ti ti-circle-filled fs-6 me-2"></i>Paid</span>
												</td>
											</tr>
											<tr>
												<td>
													<a href="invoice-details.html" className="fs-12 fw-medium">#12348</a>
												</td>
												<td>
													<div className="d-flex align-items-center">
														<a href="customer-details.html" className="avatar flex-shrink-0">
															<img src="assets/img/profiles/avatar-03.jpg" className="rounded-circle" alt="" />
														</a>
														<div className="flex-grow-1 ms-2">
															<h6 className="fs-14 fw-semibold mb-1"><a href="customer-details.html">Walter Hartmann</a></h6>
														</div>
													</div>
												</td>
												<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="b4c3d5d8c0d1c6f4d1ccd5d9c4d8d19ad7dbd9">[email&#160;protected]</a></td>
												<td>29 Nov 2024</td>
												<td>229 Nov 2024</td>
												<td>$175.00</td>												
												<td>
													<span className="badge badge-md bg-purple-transparent d-inline-flex align-items-center"><i className="ti ti-circle-filled fs-6 me-2"></i>Overdue</span>
												</td>
											</tr>
											<tr>
												<td>
													<a href="invoice-details.html" className="fs-12 fw-medium">#12349</a>
												</td>
												<td>
													<div className="d-flex align-items-center">
														<a href="customer-details.html" className="avatar flex-shrink-0">
															<img src="assets/img/profiles/avatar-07.jpg" className="rounded-circle" alt="" />
														</a>
														<div className="flex-grow-1 ms-2">
															<h6 className="fs-14 fw-semibold mb-1"><a href="customer-details.html">Andrea Jermaine</a></h6>
														</div>
													</div>
												</td>
												<td><a href="/cdn-cgi/l/email-protection" className="__cf_email__" data-cfemail="f39996819e929a9d96b3968b929e839f96dd909c9e">[email&#160;protected]</a></td>
												<td>03 Nov 2024</td>
												<td>03 Nov 2024</td>
												<td>$200.00</td>												
												<td>
													<span className="badge badge-md bg-success-transparent d-inline-flex align-items-center"><i className="ti ti-circle-filled fs-6 me-2"></i>Paid</span>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
				</div>			 */}
        
			</div>
    </div>
  );
};

export default AdminDashboard;