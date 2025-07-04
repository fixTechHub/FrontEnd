import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { bookingAPI } from '../../features/bookings/bookingAPI';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { useDispatch, useSelector } from 'react-redux';
import { getBookingCountByMonth } from "../../features/bookings/bookingSlice";
import { getMonthlyRevenue } from "../../features/statistics/statisticSlice";
import { getTechnicianCountByMonth } from "../../features/technicians/technicianSlice";
// Add Bootstrap CSS import
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
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

  const recentReservations = [
    {
      id: 1,
      days: 3,
      car: 'Ford Endeavour',
      route: 'Newyork → Vegas',
      date: '15 Jan 2025',
      price: 280,
      status: 'Active',
    },
    {
      id: 2,
      days: 4,
      car: 'Ferrari 458 MM',
      route: 'Chicago → Houston',
      date: '07 Feb 2025',
      price: 225,
      status: 'Active',
    },
    {
      id: 3,
      days: 5,
      car: 'Ford Mustang',
      route: 'LA → New York',
      date: '14 Feb 2025',
      price: 259,
      status: 'Pending',
    },
    {
      id: 4,
      days: 6,
      car: 'Toyota Tacoma',
      route: 'Phoenix → Antonio',
      date: '08 Jan 2025',
      price: 180,
      status: 'Active',
    },
    {
      id: 5,
      days: 7,
      car: 'Chevrolet Truck',
      route: 'Newyork → Chicago',
      date: '17 Feb 2025',
      price: 300,
      status: 'Completed',
    },
  ];

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
      setBookingCounts(results.map(r => r.payload?.count || 0));
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
  }, [dispatch]);

  return (
    <div className="modern-page-wrapper">
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
                  {bookingCountLoading ? '...' : bookingCount?.count}
                </div>
                <div className={
                  `px-1 rounded ${percentChange > 0 ? 'bg-success text-white' : percentChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {bookingCountLoading ? '' :
                    percentChange > 0 ? `+${percentChange.toFixed(0)}%` :
                    percentChange < 0 ? `${percentChange.toFixed(0)}%` : '0%'}
                </div>
              </div>
              <div style={{fontSize: '0.55rem', color: '#666'}}>So với tháng trước</div>
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
              <div style={{fontSize: '0.55rem', color: '#666'}}>So với tháng trước</div>
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
                  {technicianCountLoading ? '...' : technicianCount?.count}
                </div>
                <div className={
                  `px-1 rounded ${percentTechnicianChange > 0 ? 'bg-success text-white' : percentTechnicianChange < 0 ? 'bg-danger text-white' : 'bg-secondary text-white'}`
                } style={{fontSize: '0.55rem'}}>
                  {technicianCountLoading ? '' :
                    percentTechnicianChange > 0 ? `+${percentTechnicianChange.toFixed(0)}%` :
                    percentTechnicianChange < 0 ? `${percentTechnicianChange.toFixed(0)}%` : '0%'}
                </div>
              </div>
              <div style={{fontSize: '0.55rem', color: '#666'}}>So với tháng trước</div>
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

        {/* Recent Reservations Table */}
        <div className="mb-3" style={{minWidth: '680px'}}>
          <Card style={{border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom d-flex justify-content-between align-items-center position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Recent Reservations</span>
              <Button variant="outline-primary" size="sm" className="py-0 px-1" style={{fontSize: '0.6rem'}}>View</Button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover small mb-0">
                <thead className="position-sticky top-0 bg-white" style={{zIndex: 5}}>
                  <tr>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Car</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Days</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Route</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Date</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Price</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', fontWeight: 'normal', color: '#666'}}>Status</th>
                    <th style={{fontSize: '0.65rem', padding: '0.5rem', textAlign: 'right', fontWeight: 'normal', color: '#666'}}>Act</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{reservation.car}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{reservation.days}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{reservation.route}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>{reservation.date}</td>
                      <td style={{padding: '0.5rem', fontSize: '0.65rem'}}>${reservation.price}</td>
                      <td style={{padding: '0.5rem'}}>
                        <span className={`badge rounded-pill ${
                          reservation.status === 'Active' ? 'bg-success' : 
                          reservation.status === 'Pending' ? 'bg-warning' : 
                          'bg-info'}`} 
                          style={{fontSize: '0.55rem', padding: '3px 6px'}}>
                          {reservation.status}
                        </span>
                      </td>
                      <td style={{padding: '0.5rem', textAlign: 'right'}}>
                        <button className="btn btn-light btn-sm p-0 me-1" 
                               style={{width: "20px", height: "20px"}}>
                          <i className="bi bi-eye" style={{fontSize: '0.6rem'}}></i>
                        </button>
                        <button className="btn btn-light btn-sm p-0" 
                               style={{width: "20px", height: "20px"}}>
                          <i className="bi bi-pencil" style={{fontSize: '0.6rem'}}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </Card>
        </div>

        {/* Revenue Chart and Categories */}
        <div className="d-flex" style={{gap: '8px', minWidth: '680px'}}>
          <Card style={{flex: '2', minWidth: '440px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Monthly Revenue</span>
            </div>
            <Card.Body className="p-2">
              <div style={{ height: '120px', position: 'relative', width: '100%' }}>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [
                      {
                        label: '2024',
                        data: [30000, 45000, 38000, 55000, 48000, 62000, 59000, 68000, 64000, 72000, 68000, 76000],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        borderWidth: 1.5,
                      },
                      {
                        label: '2023',
                        data: [22000, 28000, 25000, 35000, 32000, 40000, 45000, 50000, 48000, 55000, 52000, 60000],
                        borderColor: '#9E9E9E',
                        backgroundColor: 'rgba(158, 158, 158, 0.1)',
                        borderDash: [3, 3],
                        tension: 0.4,
                        borderWidth: 1.5,
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
              </div>
            </Card.Body>
          </Card>
          
          <Card style={{flex: '1', minWidth: '220px', border: 'none', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <div className="py-2 px-2 border-bottom position-sticky top-0 bg-white" style={{zIndex: 10}}>
              <span className="fw-medium small">Top Technicians Rating</span>
            </div>
            <Card.Body className="p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-primary-subtle" 
                      style={{width: "16px", height: "16px"}}>
                    <i className="bi bi-car-front text-primary" style={{fontSize: '0.5rem'}}></i>
                  </div>
                  <div>
                    <div style={{fontSize: '0.65rem'}}>Luxury Cars</div>
                    <div className="text-muted" style={{fontSize: '0.55rem'}}>145 Reservations</div>
                  </div>
                </div>
                <div style={{fontSize: '0.65rem'}}>32%</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-success-subtle" 
                      style={{width: "16px", height: "16px"}}>
                    <i className="bi bi-truck text-success" style={{fontSize: '0.5rem'}}></i>
                  </div>
                  <div>
                    <div style={{fontSize: '0.65rem'}}>SUVs</div>
                    <div className="text-muted" style={{fontSize: '0.55rem'}}>120 Reservations</div>
                  </div>
                </div>
                <div style={{fontSize: '0.65rem'}}>28%</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-warning-subtle" 
                      style={{width: "16px", height: "16px"}}>
                    <i className="bi bi-car-front-fill text-warning" style={{fontSize: '0.5rem'}}></i>
                  </div>
                  <div>
                    <div style={{fontSize: '0.65rem'}}>Sports Cars</div>
<div className="text-muted" style={{fontSize: '0.55rem'}}>98 Reservations</div>
                  </div>
                </div>
                <div style={{fontSize: '0.65rem'}}>22%</div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle me-2 bg-info-subtle" 
                      style={{width: "16px", height: "16px"}}>
                    <i className="bi bi-minecart text-info" style={{fontSize: '0.5rem'}}></i>
                  </div>
                  <div>
                    <div style={{fontSize: '0.65rem'}}>Economy Cars</div>
                    <div className="text-muted" style={{fontSize: '0.55rem'}}>82 Reservations</div>
                  </div>
                </div>
                <div style={{fontSize: '0.65rem'}}>18%</div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* <!-- /Recent Invoices -->*/}
        <div className="col-md-12">
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
				</div>			
        
			</div>
    </div>
  );
};

export default AdminDashboard;