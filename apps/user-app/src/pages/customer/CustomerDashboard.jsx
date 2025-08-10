import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getFavoritesThunk, removeFavoriteThunk } from '../../features/favorites/favoriteSlice';
import { fetchNotificationsThunk } from '../../features/notifications/notificationSlice';
import BookingHistory from "../booking/common/BookingHistory";
import ReceiptPage from "../receipt/ReceiptPage";
import NotificationPage from '../notifications/NotificationPage'
// ---------- Breadcrumb -----------
const BreadcrumbSection = () => (
	<div className="breadcrumb-bar">
		<div className="container">
			<div className="row align-items-center text-center">
				<div className="col-md-12 col-12">
					<h2 className="breadcrumb-title">Bảng điều khiển</h2>
					<nav aria-label="breadcrumb" className="page-breadcrumb">
						<ol className="breadcrumb">
							<li className="breadcrumb-item"><a href="/">Trang chủ</a></li>
							<li className="breadcrumb-item active" aria-current="page">Bảng điều khiển</li>
						</ol>
					</nav>
				</div>
			</div>
		</div>
	</div>
);

// ---------- Dashboard Menu -----------
const DashboardMenu = ({ activeTab, onSelect }) => (
	<div className="dashboard-section">
		<div className="container">
			<div className="row">
				<div className="col-lg-12">
					<div className="dashboard-menu">
						<ul>
							{[
								{ icon: "dashboard", text: "Bảng điều khiển", section: 'DASHBOARD' },
								{ icon: "booking", text: "Đặt lịch của tôi", section: 'BOOKINGS' },
								{ icon: "tool", text: "Bảo hành", iconPath: "/img/icons/service-07.svg", section: 'WARRANTY' },
								{ icon: "wishlist", text: "KTV yêu thích", section: 'FAVORITES' },
								{ icon: "payment", text: "Phiếu giảm giá", section: 'COUPONS' },
								{ icon: "wallet", text: "Hoá đơn", section: 'PAYMENTS' },
								{ icon: "wallet", text: "Thông báo", section: 'NOTIFICATIONS' },

							].map((item) => (
								<li key={item.text}>
									<a
										href="#" onClick={(e)=>{e.preventDefault();onSelect(item.section);}}
										className={activeTab===item.section? "active" : ""}
									>
										<img
											src={item.iconPath || `/img/icons/${item.icon}-icon.svg`}
											alt="icon"
											style={{
												width: 24,
												height: 24,
												filter: item.active
													? 'brightness(0) invert(1)'
													: 'brightness(0) saturate(0) invert(40%)',
											}}
										/>
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



// ---------- Widget Item component -----------
const WidgetItem = ({ icon, title, value, color, iconPath }) => (
	<div className="col-lg-3 col-md-6 d-flex">
		<div className="widget-box flex-fill">
			<div className="widget-header">
				<div className="widget-content">
					<h6>{title}</h6>
					<h3>{value}</h3>
				</div>
				<div className="widget-icon">
					<span className={color ? `bg-${color}` : ""}>
						<img src={iconPath || `/img/icons/${icon}-icon.svg`} alt="icon" style={{ filter: 'brightness(0) invert(1)' }} />
					</span>
				</div>
			</div>
			<a href="#" className="view-link">
				Xem chi tiết <i className="feather-arrow-right" />
			</a>
		</div>
	</div>
);

// ---------- Widgets Row -----------
const WidgetsRow = ({ stats }) => (
	<div className="row">
		{stats.map((item) => (
			<WidgetItem key={item.title} {...item} />
		))}
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
						<h5>Đơn đặt lịch gần đây</h5>
					</div>
					<div className="col-sm-7 text-sm-end">
						<div className="booking-select">
							<select className="form-control select">
								<option>Last 30 Days</option>
								<option>Last 7 Days</option>
							</select>
							<a href="#" className="view-link">
								Xem tất cả
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
										<h6>Ngày bắt đầu</h6>
										<p>{b.start}</p>
									</td>
									<td>
										<h6>Ngày kết thúc</h6>
										<p>{b.end}</p>
									</td>
									<td>
										<h6>Giá</h6>
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
						<h5>Mã giảm giá hiện có</h5>
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
													<p>Loại thuê : {t.rentType}</p>
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
												<p><span>Trạng thái : </span>{t.detail}</p>
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

// ---------- Favorite Technicians Section -----------
const FavoriteTechniciansSection = ({ favorites, loading, onRemove }) => (
	<div className="card user-card flex-fill mt-4">
		<div className="card-header d-flex justify-content-between align-items-center">
			<h5 className="mb-0">Kỹ thuật viên yêu thích</h5>
			{/* Could add link to full list if needed */}
		</div>
		<div className="card-body">
			{loading ? (
				<p>Loading...</p>
			) : favorites.length === 0 ? (
				<p>Bạn chưa có kỹ thuật viên yêu thích.</p>
			) : (
				<div className="row">
					{favorites.map(fav => {
						const tech = fav.technicianId;
						if (!tech) return null;
						const user = tech.userId || {};
						return (
							<div className="col-md-4 mb-3" key={fav._id}>
								<div className="border rounded p-3 h-100 d-flex flex-column">
									<div className="d-flex align-items-center mb-2">
										<img src={user.avatar} alt="avatar" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginRight: 12 }} />
										<div className="flex-grow-1">
											<h6 className="mb-0">{user.fullName}</h6>
											<small>Kinh nghiệm: {tech.experienceYears} năm</small>
										</div>
									</div>
									<button className="btn btn-outline-danger btn-sm mt-auto align-self-end" onClick={() => onRemove(tech._id)}>
										Bỏ yêu thích
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	</div>
);

// ---------- Main Page -----------
function CustomerDashboard() {
	const dispatch = useDispatch();
	const { list: favorites, loading: favLoading } = useSelector(state => state.favorites);
	const bookingsCount = useSelector(state => state.booking.bookings?.length || 0);
	const warrantyState = useSelector(state => state.warranty);
	const warrantyCount = warrantyState?.warranty ? 1 : 0; // Hiện tại chỉ có 1 bản ghi khi yêu cầu, sau này có thể thay bằng mảng
	const couponsCount = useSelector(state => state.bookingPrice?.userCoupons?.length || 0);

	const favoritesCount = favorites?.length || 0;

	const [activeTab, setActiveTab] = useState('DASHBOARD');

	const handleRemoveFavorite = (technicianId) => {
		dispatch(removeFavoriteThunk(technicianId));
	};

	useEffect(() => {
		dispatch(getFavoritesThunk());
		dispatch(fetchNotificationsThunk());
	}, [dispatch]);

	return (
		<>
			<Header />

			<BreadcrumbSection />
			<DashboardMenu activeTab={activeTab} onSelect={setActiveTab} />

			<div className="content dashboard-content">
				<div className="container">
				


					{activeTab==='DASHBOARD' && (
						<>
							{(() => {
								const widgetsData = [
									{ icon: 'book', title: 'Đơn đã đặt', value: bookingsCount },
									{ icon: 'tool', title: 'Đơn đã bảo hành', value: warrantyCount, color: 'primary', iconPath: '/img/icons/service-07.svg', size: 32 },
									{ icon: 'wishlist', title: 'KTV yêu thích', value: favoritesCount, color: 'danger' },
									{ icon: 'payment', title: 'Phiếu giảm giá', value: couponsCount, color: 'info' },
									{ icon: 'notification', title: 'Thông báo', value: couponsCount, color: 'info' },

								];
								return <WidgetsRow stats={widgetsData} />;
							})()}

							<CardsRow />
						</>
					)}

					{activeTab==='BOOKINGS' && (
						<BookingHistory />
					)}

					{activeTab==='WARRANTY' && (
						<div className="mt-4"><h5>Danh sách bảo hành (đang phát triển)</h5></div>
					)}

					{activeTab==='FAVORITES' && (
						<FavoriteTechniciansSection favorites={favorites} loading={favLoading} onRemove={handleRemoveFavorite} />
					)}

					{activeTab==='COUPONS' && (
						<div className="mt-4"><h5>Phiếu giảm giá (đang phát triển)</h5></div>
					)}
					{activeTab==='PAYMENTS' && (
						<ReceiptPage />
					)}
					{activeTab==='NOTIFICATIONS' && (
						<NotificationPage />
					)}
				</div>
			</div>

			<Footer />
		</>
	);
}

export default CustomerDashboard;