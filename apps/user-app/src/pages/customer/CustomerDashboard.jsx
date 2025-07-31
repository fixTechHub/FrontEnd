import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getFavoritesThunk, removeFavoriteThunk } from '../../features/favorites/favoriteSlice';
import { fetchNotificationsThunk } from '../../features/notifications/notificationSlice';
import BookingHistory from "../booking/common/BookingHistory";
import ReceiptPage from "../receipt/ReceiptPage";
import { fetchUserCouponsThunk } from '../../features/coupons/couponSlice';
import apiClient from '../../services/apiClient';
import { formatDate } from '../../utils/formatDate';

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
const WidgetItem = ({ icon, title, value, color, iconPath, size = 32 }) => (
	<div className="col-lg-3 col-md-6 d-flex">
		<div className="widget-box flex-fill">
			<div className="widget-header">
				<div className="widget-content">
					<h6>{title}</h6>
					<h3>{value}</h3>
				</div>
				<div className="widget-icon">
					<span className={color ? `bg-${color}` : ""}>
						<img src={iconPath || `/img/icons/${icon}-icon.svg`} alt="icon" style={{ width: size, height: size, filter: 'brightness(0) invert(1)' }} />
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

const bookingStatusUIMap = {
    PENDING: { label: 'Đang chờ', className: 'badge-light-secondary' },
    COMFIRMED: { label: 'Đã xác nhận', className: 'badge-light-info' },
    IN_PROGRESS: { label: 'Đang tiến hành', className: 'badge-light-warning' },
    AWAITING_DONE: { label: 'Chờ xác nhận', className: 'badge-light-primary' },
    AWAITING_CONFIRM: { label: 'Chờ xác nhận', className: 'badge-light-primary' },
    DONE: { label: 'Hoàn thành', className: 'badge-light-success' },
    CANCELLED: { label: 'Đã hủy', className: 'badge-light-danger' },
};

const LastBookingsCard = ({ bookings }) => {
    const data = (bookings && bookings.length) ? bookings : bookingsSample;
    return (
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
                    <div className="table-responsive dashboard-table dashboard-table-info" style={{ overflowX: 'hidden' }}>
                        <table className="table w-100">
                            <colgroup>
                                <col style={{ width: 220 }} />
                                <col style={{ width: 150 }} />
                                <col style={{ width: 150 }} />
                                <col style={{ width: 120 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>
                            <tbody>
                                {data.map((b, idx) => {
                                    // Determine fields based on real booking object or sample
                                    const placeholderImg = '/img/technician.svg';
                                    const imgSrc = b.technicianId?.userId?.avatar
                                        || (Array.isArray(b.images) && b.images.length > 0 ? b.images[0] : null)
                                        || b.serviceId?.icon
                                        || placeholderImg;
                                    const name = b.serviceId?.serviceName || 'Booking';
                                    const isUrgent = b.isUrgent;
                                    const rentTypeLabel = isUrgent ? 'Khẩn cấp' : 'Đặt lịch';

                                    const startDate = b.schedule?.startTime || b.createdAt;
                                    const endDate   = b.schedule?.expectedEndTime || b.completedAt || '';
                                    const start = startDate ? formatDate(startDate) : '';
                                    const end   = endDate   ? formatDate(endDate)   : '';

                                    const priceValue =
                                        b.finalPrice ??
                                        b.quote?.totalAmount ??
                                        b.quote?.laborPrice;
                                    let price;
                                    if (priceValue == null || priceValue === 0) {
                                        price = 'Đang chờ báo giá';
                                    } else {
                                        price = `${priceValue.toLocaleString('vi-VN')}₫`;
                                    }

                                    const statusObj = typeof b.status === 'string'
                                        ? (bookingStatusUIMap[b.status] || { label: b.status, className: 'badge-light-secondary' })
                                        : b.status || { label: '', className: 'badge-light-secondary' };
                                    const { label: statusLabel, className: badgeClass } = statusObj;
                                    const badgeTextClass = badgeClass.includes('light') ? 'text-dark' : '';

                                    const endDisplay = end || '-';
                                    const priceClass = price === 'Đang chờ báo giá' ? 'text-secondary fw-semibold' : 'text-danger';

                                    const technicianName = b.technicianId?.userId?.fullName;

                                    return (
                                        <tr key={b._id || idx}>
                                            <td>
                                                <div className="table-avatar">
                                                    <a href={`/booking/${b._id}`} className="avatar avatar-lg flex-shrink-0">
                                                        <img className="avatar-img" src={imgSrc} alt="Booking" onError={(e)=>{e.target.onerror=null; e.target.src=placeholderImg;}} />
                                                    </a>
                                                    <div className="table-head-name flex-grow-1">
                                                        <a href={`/booking/${b._id}`}>{name}</a>
                                                        <p className="mb-0 small">Thợ: {technicianName || 'Đang tìm'}</p>
                                                        <p className="mb-0 small">Loại : {rentTypeLabel}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <h6>Ngày bắt đầu</h6>
                                                <p>{start}</p>
                                            </td>
                                            <td>
                                                <h6>Ngày kết thúc</h6>
                                                <p>{endDisplay}</p>
                                            </td>
                                            <td>
                                                <h6>Giá</h6>
                                                <h5 className={priceClass}>{price}</h5>
                                            </td>
                                            <td>
                                                <span className={`badge ${badgeClass} ${badgeTextClass}`}>{statusLabel}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

// ---------- Coupon Card -----------
const CouponsCard = ({ coupons }) => {
    const [activeCoupon, setActiveCoupon] = React.useState(null);
    const [copied, setCopied] = React.useState(false);

    const handleOpen = (c) => setActiveCoupon(c);
    const handleClose = () => setActiveCoupon(null);

    const handleCopy = () => {
        if (activeCoupon) {
            navigator.clipboard.writeText(activeCoupon.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="col-lg-4 d-flex">
            <div className="card user-card flex-fill">
                <div className="card-header">
                    <h5 className="mb-0">Mã giảm giá hiện có</h5>
                </div>
                <div className="card-body">
                    {coupons.length === 0 ? (
                        <div className="text-center text-secondary fw-semibold">Chưa có mã giảm giá khả dụng</div>
                    ) : (
                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {coupons.map(coupon => {
                                const borderColor = coupon.type === 'PERCENT' ? 'border-success' : 'border-warning';
                                const badgeColor  = coupon.type === 'PERCENT' ? 'bg-success' : 'bg-warning';
                                const valueLabel  = coupon.type === 'PERCENT' ? `${coupon.value}%` : `${coupon.value.toLocaleString('vi-VN')}₫`;
                                return (
                                    <div className="mb-3" key={coupon._id}>
                                        <div role="button" onClick={() => handleOpen(coupon)} className={`p-3 rounded border ${borderColor} position-relative coupon-card-hover`}>
                                            <span className={`badge position-absolute top-0 end-0 mt-2 me-2 ${badgeColor}`}>{valueLabel}</span>
                                            <h6 className="fw-bold text-primary mb-1">{coupon.code}</h6>
                                            <p className="mb-1 small text-truncate-2">{coupon.description || 'Không có mô tả'}</p>
                                            <p className="mb-0 small text-secondary fw-semibold"><i className="fa-regular fa-clock me-1"></i>HSD: {formatDate(coupon.endDate)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal detail */}
            {activeCoupon && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết Coupon</h5>
                                <button type="button" className="btn-close" onClick={handleClose}></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex align-items-center mb-3">
                                    <h4 className="text-primary fw-bold me-2 mb-0">{activeCoupon.code}</h4>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={handleCopy} title="Sao chép mã">
                                        <i className="fa-regular fa-copy"></i>
                                    </button>
                                    {copied && <span className="ms-2 text-success small">Đã sao chép!</span>}
                                </div>
                                {activeCoupon.description && <p className="mb-3">{activeCoupon.description}</p>}
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Giá trị
                                        <span className="fw-semibold">
                                            {activeCoupon.type === 'PERCENT' ? `${activeCoupon.value}%` : `${activeCoupon.value.toLocaleString('vi-VN')}₫`}
                                        </span>
                                    </li>
                                    {activeCoupon.maxDiscount && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Giảm tối đa
                                            <span className="fw-semibold">{activeCoupon.maxDiscount.toLocaleString('vi-VN')}₫</span>
                                        </li>
                                    )}
                                    {activeCoupon.minOrderValue > 0 && (
                                        <li className="list-group-item d-flex justify-content-between align-items-center">
                                            Đơn tối thiểu
                                            <span className="fw-semibold">{activeCoupon.minOrderValue.toLocaleString('vi-VN')}₫</span>
                                        </li>
                                    )}
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Ngày hết hạn
                                        <span className="fw-semibold">{formatDate(activeCoupon.endDate)}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ---------- Dashboard Cards Row -----------
const CardsRow = ({ bookings, coupons }) => (
    <div className="row">
        <LastBookingsCard bookings={bookings} />
        <CouponsCard coupons={coupons} />
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
	const [bookingsCount, setBookingsCount] = useState(0);
	const warrantyState = useSelector(state => state.warranty);
	const warrantyCount = warrantyState?.warranty ? 1 : 0; // Hiện tại chỉ có 1 bản ghi khi yêu cầu, sau này có thể thay bằng mảng
	const { list: userCoupons, loading: couponsLoading } = useSelector(state => state.coupons);
	const couponsCount = userCoupons.length;

	const favoritesCount = favorites?.length || 0;
	const [recentBookings, setRecentBookings] = useState([]);

	const [activeTab, setActiveTab] = useState('DASHBOARD');

	const handleRemoveFavorite = (technicianId) => {
		dispatch(removeFavoriteThunk(technicianId));
	};

	useEffect(() => {
		dispatch(getFavoritesThunk());
		dispatch(fetchNotificationsThunk());
		dispatch(fetchUserCouponsThunk());
		// fetch last 5 bookings
		(async () => {
			try {
				const res = await apiClient.get('/bookings/user?limit=5');
				const sorted = (res.data.bookings || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
				setRecentBookings(sorted);
				setBookingsCount(sorted.length);
			} catch (err) {
				console.error('Fetch bookings error:', err);
			} finally {
				// setLoadingBookings(false); // This line is removed
			}
		})();

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
								];
								return <WidgetsRow stats={widgetsData} />;
							})()}

							<CardsRow bookings={recentBookings} coupons={userCoupons} />
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
				</div>
			</div>

			<Footer />
		</>
	);
}

export default CustomerDashboard;