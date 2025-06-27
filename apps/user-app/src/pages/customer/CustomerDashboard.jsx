import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import React from "react";

// ---------- Breadcrumb -----------
const BreadcrumbSection = () => (
	<div className="breadcrumb-bar">
		<div className="container">
			<div className="row align-items-center text-center">
				<div className="col-md-12 col-12">
					<h2 className="breadcrumb-title">User Dashboard</h2>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><a href="/">Home</a></li>
							<li className="breadcrumb-item active" aria-current="page">User Dashboard</li>
						</ol>
					</nav>
				</div>
			</div>
		</div>
	</div>
);

// ---------- Dashboard Menu -----------
const DashboardMenu = () => (
	<div className="dashboard-section">
		<div className="container">
			<div className="row">
				<div className="col-lg-12">
					<div className="dashboard-menu">
						<ul>
							{[
								{ icon: "dashboard", text: "Dashboard", active: true },
								{ icon: "booking", text: "My Bookings" },
								{ icon: "review", text: "Reviews" },
								{ icon: "wishlist", text: "Wishlist" },
								{ icon: "message", text: "Messages" },
								{ icon: "wallet", text: "My Wallet" },
								{ icon: "payment", text: "Payments" },
								{ icon: "settings", text: "Settings" },
							].map((item) => (
								<li key={item.text}>
									<a
										href="#" /* TODO: replace with React Router links */
										className={item.active ? "active" : ""}
									>
										<img src={`/img/icons/${item.icon}-icon.svg`} alt="icon" />
										<span>{item.text}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// ---------- Status List -----------
const StatusList = () => (
	<ul className="status-lists">
		<li className="approve-item">
			<div className="status-info">
				<span><i className="fa-solid fa-calendar-days" /></span>
				<p>Your Booking has been Approved by admin</p>
			</div>
			<a href="#" className="view-detail">View Details</a>
		</li>
		<li>
			<div className="status-info">
				<span><i className="fa-solid fa-money-bill" /></span>
				<p>Your Refund request has been approved by admin &amp; your payment will be updated in 3 days.</p>
			</div>
			<a href="#" className="close-link"><i className="feather-x" /></a>
		</li>
		<li className="bg-danger-light">
			<div className="status-info">
				<span><i className="fa-solid fa-money-bill" /></span>
				<p>Your Refund request has been rejected by admin <a href="#">View Reason</a></p>
			</div>
			<a href="#" className="close-link"><i className="feather-x" /></a>
		</li>
	</ul>
);

// ---------- Widget Item component -----------
const WidgetItem = ({ icon, title, value, color }) => (
	<div className="col-lg-3 col-md-6 d-flex">
		<div className="widget-box flex-fill">
			<div className="widget-header">
				<div className="widget-content">
					<h6>{title}</h6>
					<h3>{value}</h3>
				</div>
				<div className="widget-icon">
					<span className={color ? `bg-${color}` : ""}>
						<img src={`/img/icons/${icon}-icon.svg`} alt="icon" />
					</span>
				</div>
			</div>
			<a href="#" className="view-link">
				View Details <i className="feather-arrow-right" />
			</a>
		</div>
	</div>
);

// ---------- Widgets Row -----------
const WidgetsRow = () => (
	<div className="row">
		<WidgetItem icon="book" title="My Bookings" value="450" />
		<WidgetItem icon="balance" title="Wallet Balance" value="$24,665" color="warning" />
		<WidgetItem icon="transaction" title="Total Transactions" value="$15,210" color="success" />
		<WidgetItem icon="cars" title="Wishlist Cars" value="24" color="danger" />
	</div>
);

// ---------- Last 5 Bookings Card -----------
const bookingsSample = [
	{
		img: "/img/cars/car-04.jpg",
		name: "Ferrari 458 MM Speciale",
		rentType: "Hourly",
		start: "15 Sep 2023, 11:30 PM",
		end: "15 Sep 2023, 1:30 PM",
		price: "$200",
		status: { label: "Upcoming", className: "badge-light-secondary" },
	},
	{
		img: "/img/cars/car-05.jpg",
		name: "Kia Soul 2016",
		rentType: "Hourly",
		start: "15 Sep 2023, 09:00 AM",
		end: "15 Sep 2023, 1:30 PM",
		price: "$300",
		status: { label: "Upcoming", className: "badge-light-secondary" },
	},
	{
		img: "/img/cars/car-01.jpg",
		name: "Toyota Camry SE 350",
		rentType: "Day",
		start: "18 Sep 2023, 09:00 AM",
		end: "18 Sep 2023, 05:00 PM",
		price: "$600",
		status: { label: "Inprogress", className: "badge-light-warning" },
	},
	{
		img: "/img/cars/car-03.jpg",
		name: "Audi A3 2019 new",
		rentType: "Weekly",
		start: "10 Oct 2023, 10:30 AM",
		end: "16 Oct 2023, 10:30 AM",
		price: "$800",
		status: { label: "Completed", className: "badge-light-success" },
	},
	{
		img: "/img/cars/car-05.jpg",
		name: "2018 Chevrolet Camaro",
		rentType: "Hourly",
		start: "14 Nov 2023, 02:00 PM",
		end: "14 Nov 2023, 04:00 PM",
		price: "$240",
		status: { label: "Completed", className: "badge-light-success" },
	},
];

const LastBookingsCard = () => (
	<div className="col-lg-8 d-flex">
		<div className="card user-card flex-fill">
			<div className="card-header">
				<div className="row align-items-center">
					<div className="col-sm-5">
						<h5>Last 5 Bookings</h5>
					</div>
					<div className="col-sm-7 text-sm-end">
						<div className="booking-select">
							<select className="form-control select">
								<option>Last 30 Days</option>
								<option>Last 7 Days</option>
							</select>
							<a href="#" className="view-link">
								View all Bookings
							</a>
						</div>
					</div>
				</div>
			</div>
			<div className="card-body p-0">
				<div className="table-responsive dashboard-table dashboard-table-info">
					<table className="table">
						<tbody>
							{bookingsSample.map((b) => (
								<tr key={b.name}>
									<td>
										<div className="table-avatar">
											<a href="#" className="avatar avatar-lg flex-shrink-0">
												<img className="avatar-img" src={b.img} alt="Booking" />
											</a>
											<div className="table-head-name flex-grow-1">
												<a href="#">{b.name}</a>
												<p>Rent Type : {b.rentType}</p>
											</div>
										</div>
									</td>
									<td>
										<h6>Start date</h6>
										<p>{b.start}</p>
									</td>
									<td>
										<h6>End Date</h6>
										<p>{b.end}</p>
									</td>
									<td>
										<h6>Price</h6>
										<h5 className="text-danger">{b.price}</h5>
									</td>
									<td>
										<span className={`badge ${b.status.className}`}>{b.status.label}</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
);

// ---------- Recent Transaction Card -----------
const transactionsSample = [
	{
		img: "/img/cars/car-04.jpg",
		name: "Ferrari 458 MM Speciale",
		rentType: "Hourly",
		status: { label: "Upcoming", className: "badge-light-secondary" },
		detail: "On 15 Sep 2023, 11:30 PM",
	},
	{
		img: "/img/cars/car-07.jpg",
		name: "Chevrolet Pick Truck 3.5L",
		rentType: "Day",
		status: { label: "Refund started", className: "badge-light-warning" },
		detail: "Yet to recieve",
	},
	{
		img: "/img/cars/car-08.jpg",
		name: "Toyota Tacoma 4WD",
		rentType: "Weekly",
		status: { label: "Cancelled", className: "badge-light-danger" },
		detail: "On 15 Sep 2023, 11:30 PM",
	},
	{
		img: "/img/cars/car-01.jpg",
		name: "Ford Mustang 4.0 AT",
		rentType: "Monthly",
		status: { label: "Completed", className: "badge-light-success" },
		detail: "On 20 Dec 2023, 05:20 PM",
	},
];

const RecentTransactionsCard = () => (
	<div className="col-lg-4 d-flex">
		<div className="card user-card flex-fill">
			<div className="card-header">
				<div className="row align-items-center">
					<div className="col-sm-6">
						<h5>Recent Transaction</h5>
					</div>
					<div className="col-sm-6 text-sm-end">
						<div className="booking-select">
							<select className="form-control select">
								<option>Last 30 Days</option>
								<option>Last 7 Days</option>
							</select>
						</div>
					</div>
				</div>
			</div>
			<div className="card-body p-0">
				<div className="table-responsive dashboard-table dashboard-table-info">
					<table className="table">
						<tbody>
							{transactionsSample.map((t, idx) => (
								<React.Fragment key={idx}>
									<tr>
										<td className="border-0">
											<div className="table-avatar">
												<a href="#" className="avatar avatar-md flex-shrink-0">
													<img className="avatar-img" src={t.img} alt="Booking" />
												</a>
												<div className="table-head-name flex-grow-1">
													<a href="#">{t.name}</a>
													<p>Rent Type : {t.rentType}</p>
												</div>
											</div>
										</td>
										<td className="border-0 text-end">
											<span className={`badge ${t.status.className}`}>{t.status.label}</span>
										</td>
									</tr>
									<tr>
										<td colSpan={2} className="pt-0 pb-0 border-0">
											<div className="status-box">
												<p><span>Status : </span>{t.detail}</p>
											</div>
										</td>
									</tr>
								</React.Fragment>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
);

// ---------- Dashboard Cards Row -----------
const CardsRow = () => (
	<div className="row">
		<LastBookingsCard />
		<RecentTransactionsCard />
	</div>
);

// ---------- Main Page -----------
function CustomerDashboard() {
	return (
		<>
			<Header />

			<BreadcrumbSection />
			<DashboardMenu />

			<div className="content dashboard-content">
				<div className="container">
					<StatusList />

					<div className="content-header">
						<h4>Dashboard</h4>
					</div>

					<WidgetsRow />

					<CardsRow />
				</div>
			</div>

			<Footer />
		</>
	);
}

export default CustomerDashboard;