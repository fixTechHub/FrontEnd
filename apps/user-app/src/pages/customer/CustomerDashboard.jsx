import Header from "../../components/common/Header";
// No Link needed now
import Footer from "../../components/common/Footer";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getFavoritesThunk, removeFavoriteThunk } from '../../features/favorites/favoriteSlice';
import { fetchNotificationsThunk } from '../../features/notifications/notificationSlice';
import BookingHistory from "../booking/common/BookingHistory";
import ReceiptPage from "../receipt/ReceiptPage";
import WarrantyList from "../warranty/WarrantyList";
import UserCoupons from "../coupon/UserCoupons";
import { fetchUserCouponsThunk } from '../../features/coupons/couponSlice';
import apiClient from '../../services/apiClient';
import { formatDate } from '../../utils/formatDate';
import Form from 'react-bootstrap/Form';

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
		<style jsx>{`
			.dashboard-menu ul::-webkit-scrollbar { display: none; }
		`}</style>
		<div className="container">
			<div className="row">
				<div className="col-lg-12">
					<div className="dashboard-menu">
						<ul className="d-flex justify-content-center flex-nowrap gap-2" style={{overflowX:'auto', scrollbarWidth:'none', msOverflowStyle:'none'}}>
							{[
								{ icon: "dashboard", text: "Bảng điều khiển", section: 'DASHBOARD' },
								{ icon: "booking", text: "Đặt lịch của tôi", section: 'BOOKINGS' },
								{ icon: "tool", text: "Bảo hành", iconPath: "/img/icons/service-07.svg", section: 'WARRANTY' },
								{ icon: "wishlist", text: "KTV yêu thích", section: 'FAVORITES' },
								{ icon: "payment", text: "Phiếu giảm giá", section: 'COUPONS' },
								{ icon: "wallet", text: "Hoá đơn", section: 'PAYMENTS' },	
								{ icon: "bell", text: "Thông báo", section: 'NOTIFICATIONS' },

							].map((item) => (
								<li key={item.text}>
									<a
										href="#" onClick={(e)=>{e.preventDefault();onSelect(item.section);}}
										className={activeTab===item.section? "active d-block" : "d-block"}
										style={{padding:'22px', width:130, textAlign:'center'}}
									>
										<img
											src={item.iconPath || `/img/icons/${item.icon}-icon.svg`}
											alt="icon"
											style={{
												width:24,
												height:24,
												margin:'0 auto 8px',
												filter: item.active
													? 'brightness(0) invert(1)'
													: 'brightness(0) saturate(0) invert(40%)',
											}}
										/>
										<span style={{whiteSpace:'nowrap'}}>{item.text}</span>
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
const WidgetItem = ({ icon, title, value, color, iconPath, size = 32, section, onSelect }) => (
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
			<a href="#" className="view-link" onClick={(e)=>{e.preventDefault(); onSelect && onSelect(section);}}>
				Xem chi tiết <i className="feather-arrow-right" />
			</a>
		</div>
	</div>
);

// ---------- Widgets Row -----------
const WidgetsRow = ({ stats, onSelect }) => (
	<div className="row">
		{stats.map((item) => (
			<WidgetItem key={item.title} {...item} onSelect={onSelect} />
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

const LastBookingsCard = ({ bookings, onViewAll }) => {
    const data = bookings && bookings.length ? bookings : [];
    return (
        <div className="col-lg-8 d-flex">
            <div className="card user-card flex-fill">
                <div className="card-header">
                    <div className="row align-items-center">
                        <div className="col-6 col-sm-6">
                            <h5>Đơn đặt lịch gần đây</h5>
                        </div>
                        <div className="col-6 col-sm-6 text-end">
                            <a href="#" className="view-link" onClick={(e)=>{e.preventDefault(); onViewAll && onViewAll('BOOKINGS');}}>
                                    Xem tất cả
                                </a>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    {data.length === 0 ? (
                        <div className="p-4 text-center text-secondary">Chưa có đơn đặt lịch nào</div>
                    ) : (
                    <div className="table-responsive dashboard-table dashboard-table-info" style={{ overflowX: 'hidden' }}>
                        <table className="table w-100" style={{ minWidth: '750px' }}>
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
                    )}
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
            <div className="card user-card flex-fill d-flex flex-column">
                <div className="card-header">
                    <h5 className="mb-0">Mã giảm giá hiện có</h5>
                </div>
                <div className="card-body flex-grow-1 overflow-auto" style={{maxHeight:'500px'}}>
                    {coupons.length === 0 ? (
                        <div className="text-center text-secondary fw-semibold">Chưa có mã giảm giá khả dụng</div>
                    ) : (
                        <div>
                            {coupons.map(coupon => {
                                const borderColor = coupon.type === 'PERCENT' ? 'border-success' : 'border-warning';
                                const badgeColor  = coupon.type === 'PERCENT' ? 'bg-success' : 'bg-warning';
                                const valueLabel  = coupon.type === 'PERCENT' ? `${coupon.value}%` : `${coupon.value.toLocaleString('vi-VN')}₫`;
                                return (
                                    <div className="mb-3" key={coupon._id}>
                                        <div role="button" onClick={() => handleOpen(coupon)} className={`p-3 rounded border ${borderColor} position-relative coupon-card-hover`}>
                                            <span style={{color:"white"}} className={`badge position-absolute top-0 end-0 mt-2 me-2 ${badgeColor}`}>{valueLabel}</span>
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
const CardsRow = ({ bookings, coupons, onSelectTab }) => (
    <div className="row">
        <LastBookingsCard bookings={bookings} coupons={coupons} onViewAll={onSelectTab} />
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
							<div className="col-md-4 mb-4" key={fav._id}>
                              <div className="card border-0 shadow-sm hover-lift h-100 text-center p-3" style={{background:'#ffffff'}}> 
                                <img src={user.avatar} alt="avatar" style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',margin:'0 auto',boxShadow:'0 2px 6px rgba(0,0,0,.1)'}} />
                                <h6 className="fw-semibold mt-3 mb-1" style={{color:'#0f172a'}}>{user.fullName}</h6>
                                <small style={{color:'#475569'}}>Kinh nghiệm {tech.experienceYears} năm</small>
                                <small className="d-block" style={{color:'#475569'}}>Đơn hoàn thành: {tech.completedBookings||0}</small>
                                {tech.rating && (
                                  <div className="mb-2" style={{color:'#f59e0b'}}>
                                    {Array.from({length:5}).map((_,i)=>(<i key={i} className={i<tech.rating?"fa fa-star":"fa fa-star-o"}></i>))}
                                  </div>
                                )}
                                <button className="btn btn-sm btn-outline-danger mt-auto w-100" onClick={()=>onRemove(tech._id)}>
                                  <i className="fa fa-heart-broken me-1"></i>Bỏ yêu thích
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
	const { user } = useSelector(state => state.auth);
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
		if (user?._id) {
			dispatch(fetchUserCouponsThunk(user._id));
		}
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

	}, [dispatch, user?._id]);

	return (
		<>
			<Header />

			<BreadcrumbSection />
			<DashboardMenu activeTab={activeTab} onSelect={setActiveTab} />

			<div className="content dashboard-content">
				<div className="container-xl">
				


					{activeTab==='DASHBOARD' && (
						<>
							{(() => {
								const widgetsData = [
									{ icon: 'book', title: 'Đơn đã đặt', value: bookingsCount, section: 'BOOKINGS' },
									{ icon: 'tool', title: 'Đơn đã bảo hành', value: warrantyCount, color: 'primary', iconPath: '/img/icons/service-07.svg', size: 32, section: 'WARRANTY' },
									{ icon: 'wishlist', title: 'KTV yêu thích', value: favoritesCount, color: 'danger', section: 'FAVORITES' },
									{ icon: 'payment', title: 'Phiếu giảm giá', value: couponsCount, color: 'info', section: 'COUPONS' },
								];
								return <WidgetsRow stats={widgetsData} onSelect={setActiveTab} />;
							})()}

							<CardsRow bookings={recentBookings} coupons={userCoupons} onSelectTab={setActiveTab} />
						</>
					)}

					{activeTab==='BOOKINGS' && (
						<BookingHistory />
					)}

					{activeTab==='WARRANTY' && (
						<WarrantyList />
					)}

					{activeTab==='FAVORITES' && (
						<FavoriteTechniciansSection favorites={favorites} loading={favLoading} onRemove={handleRemoveFavorite} />
					)}

					{activeTab==='COUPONS' && (
						<UserCoupons />
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