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
				</div>
			</div>
		</div>
	</div>
);

// ---------- Dashboard Menu -----------
const DashboardMenu = ({ activeTab, onSelect }) => (
	<div className="dashboard-section">
		<style jsx>{`
			.dashboard-menu {
				overflow-x: auto !important;
				overflow-y: hidden !important;
				-webkit-overflow-scrolling: touch;
				scrollbar-width: none;
				-ms-overflow-style: none;
			}
			
			.dashboard-menu ul {
				display: flex !important;
				flex-wrap: nowrap !important;
				min-width: max-content !important;
				margin: 0 !important;
				padding: 0 1rem !important;
				gap: 0.5rem !important;
			}
			
			.dashboard-menu ul::-webkit-scrollbar { 
				display: none !important; 
			}
			
			.dashboard-menu li {
				flex-shrink: 0 !important;
				min-width: 130px !important;
			}
			
			.dashboard-menu li a {
				display: block !important;
				padding: 22px 16px !important;
				width: 130px !important;
				text-align: center !important;
				white-space: nowrap !important;
				border-radius: 8px !important;
				transition: all 0.2s ease !important;
			}
			
			@media (max-width: 768px) {
				.dashboard-menu ul {
					padding: 0 1rem !important;
					gap: 0.25rem !important;
				}
				.dashboard-menu li {
					min-width: 110px !important;
				}
				.dashboard-menu li a {
					padding: 16px 12px !important;
					width: 110px !important;
					font-size: 0.85rem !important;
				}
				.dashboard-menu li a img {
					width: 20px !important;
					height: 20px !important;
				}
			}
			
			@media (max-width: 480px) {
				.dashboard-menu li {
					min-width: 100px !important;
				}
				.dashboard-menu li a {
					width: 100px !important;
					padding: 14px 8px !important;
					font-size: 0.8rem !important;
				}
				.dashboard-menu li a span {
					white-space: normal !important;
					line-height: 1.2 !important;
				}
			}
		`}</style>
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
        <div className="col-lg-8 col-12 d-flex">
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
                    <div className="table-responsive dashboard-table dashboard-table-info" style={{ overflowX: 'auto' }}>
                        <table className="table w-100" style={{ minWidth: '600px' }}>
                            <style>{`
                                @media (max-width: 768px) {
                                    .dashboard-table .table {
                                        min-width: 500px !important;
                                        font-size: 0.85rem;
                                    }
                                    .table-avatar .avatar {
                                        width: 40px !important;
                                        height: 40px !important;
                                    }
                                    .table-head-name a {
                                        font-size: 0.9rem !important;
                                    }
                                    .table-head-name p {
                                        font-size: 0.75rem !important;
                                    }
                                }
                            `}</style>
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
        <div className="col-lg-4 col-12 d-flex">
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
	<div className="favorites-list-modern">
		<style jsx>{`
			.favorites-list-modern {
				padding: 2rem 0;
				min-height: 100vh;
				background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
			}
			
			.favorites-header {
				text-align: center;
				margin-bottom: 3rem;
			}
			
			.favorites-title {
				font-size: 2.5rem;
				font-weight: 900;
				background: linear-gradient(135deg, #ff6b6b, #ffa500);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
				margin-bottom: 0.5rem;
			}
			
			.favorites-subtitle {
				color: #64748b;
				font-size: 1.1rem;
				font-weight: 500;
			}
			
			.favorites-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
				gap: 1.5rem;
				margin-top: 2rem;
			}
			
			@media (max-width: 768px) {
				.favorites-grid {
					grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
					gap: 1rem !important;
				}
				.favorites-list-modern {
					padding: 1.5rem 0 !important;
				}
				.favorites-title {
					font-size: 2rem !important;
				}
				.favorites-subtitle {
					font-size: 1rem !important;
				}
			}
			
			@media (max-width: 480px) {
				.favorites-grid {
					grid-template-columns: 1fr !important;
					gap: 1rem !important;
				}
				.favorite-card {
					padding: 1.5rem !important;
				}
				.favorite-avatar {
					width: 80px !important;
					height: 80px !important;
				}
			}
			
			.favorite-card {
				background: #ffffff;
				border: 1px solid #e5e7eb;
				border-radius: 16px;
				padding: 2rem;
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				text-align: center;
			}
			
			.favorite-card:hover {
				transform: translateY(-4px);
				box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
			}
			
			.favorite-avatar {
				width: 100px;
				height: 100px;
				border-radius: 50%;
				object-fit: cover;
				margin: 0 auto 1.5rem;
				border: 4px solid #fff;
				box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			}
			
			.favorite-name {
				font-size: 1.25rem;
				font-weight: 700;
				color: #1f2937;
				margin-bottom: 0.5rem;
			}
			
			.favorite-stats {
				display: flex;
				justify-content: space-between;
				margin: 1rem 0;
				padding: 1rem;
				background: #f8fafc;
				border-radius: 8px;
			}
			
			.stat-item {
				text-align: center;
			}
			
			.stat-value {
				font-size: 1.125rem;
				font-weight: 700;
				color: #1f2937;
				display: block;
			}
			
			.stat-label {
				font-size: 0.75rem;
				color: #6b7280;
				margin-top: 0.25rem;
			}
			
			.favorite-rating {
				display: flex;
				justify-content: center;
				gap: 0.25rem;
				margin-bottom: 1.5rem;
			}
			
			.star {
				color: #fbbf24;
			}
			
			.star-empty {
				color: #d1d5db;
			}
			
			.remove-btn {
				background: linear-gradient(135deg, #ef4444, #dc2626);
				border: none;
				color: white;
				padding: 0.75rem 1.5rem;
				border-radius: 8px;
				font-weight: 600;
				font-size: 0.875rem;
				cursor: pointer;
				transition: all 0.2s ease;
				width: 100%;
			}
			
			.remove-btn:hover {
				background: linear-gradient(135deg, #dc2626, #b91c1c);
				transform: translateY(-1px);
			}
			
			.empty-state {
				text-align: center;
				padding: 4rem 2rem;
				background: #ffffff;
				border: 2px dashed #e5e7eb;
				border-radius: 16px;
				margin-top: 2rem;
			}
			
			.empty-icon {
				font-size: 4rem;
				color: #d1d5db;
				margin-bottom: 1rem;
			}
			
			.empty-title {
				font-size: 1.5rem;
				font-weight: 700;
				color: #374151;
				margin-bottom: 0.5rem;
			}
			
			.empty-text {
				color: #6b7280;
				font-size: 1rem;
			}
			
			.loading-state {
				text-align: center;
				padding: 4rem 2rem;
				color: #6b7280;
			}
		`}</style>
		
		<div className="container">
			<div className="favorites-header">
				<h1 className="favorites-title">Kỹ thuật viên yêu thích</h1>
				<p className="favorites-subtitle">Danh sách các kỹ thuật viên bạn đã đánh dấu yêu thích</p>
			</div>
			
			{loading ? (
				<div className="loading-state">
					<div className="spinner-border text-primary" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
					<p className="mt-3">Đang tải danh sách...</p>
				</div>
			) : favorites.length === 0 ? (
				<div className="empty-state">
					<div className="empty-icon">💙</div>
					<h3 className="empty-title">Chưa có kỹ thuật viên yêu thích</h3>
					<p className="empty-text">Hãy đánh dấu yêu thích các kỹ thuật viên ưng ý để dễ dàng tìm lại sau này!</p>
				</div>
			) : (
				<div className="favorites-grid">
					{favorites.map(fav => {
						const tech = fav.technicianId;
						if (!tech) return null;
						const user = tech.userId || {};
						return (
							<div className="favorite-card" key={fav._id}>
								<img 
									src={user.avatar || '/img/default-avatar.png'} 
									alt="avatar" 
									className="favorite-avatar"
								/>
								<h5 className="favorite-name">{user.fullName || 'Chưa cập nhật'}</h5>
								
								<div className="favorite-stats">
									<div className="stat-item">
										<span className="stat-value">{tech.experienceYears || 0}</span>
										<div className="stat-label">Năm kinh nghiệm</div>
									</div>
									<div className="stat-item">
										<span className="stat-value">{tech.jobCompleted || 0}</span>
										<div className="stat-label">Đơn hoàn thành</div>
									</div>
									<div className="stat-item">
										<span className="stat-value">{tech.ratingAverage?.toFixed(1) || '0.0'}</span>
										<div className="stat-label">Đánh giá</div>
									</div>
								</div>
								
								<div className="favorite-rating">
									{Array.from({length: 5}).map((_, i) => (
										<i 
											key={i} 
											className={`fa fa-star ${i < (tech.ratingAverage || 0) ? 'star' : 'star-empty'}`}
										></i>
									))}
								</div>
								
								<button 
									onClick={() => onRemove(tech._id)} 
									className="remove-btn"
								>
									<i className="fa fa-heart-broken me-2"></i>
									Bỏ yêu thích
								</button>
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
	const [warrantyCount, setWarrantyCount] = useState(0);
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

		// Fetch counts và recent data
		(async () => {
			try {
				// 1. Lấy TOTAL bookings count
				const totalBookingsRes = await apiClient.get('/bookings/user');
				const totalBookings = totalBookingsRes.data.bookings || [];
				setBookingsCount(totalBookings.length);

				// 2. Lấy 5 recent bookings để hiển thị
				const recentBookingsRes = await apiClient.get('/bookings/user?limit=5');
				const sorted = (recentBookingsRes.data.bookings || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
				setRecentBookings(sorted);

				// 3. Lấy warranty count 
				try {
					const warrantyRes = await apiClient.get('/warranties');
					const warranties = warrantyRes.data || []; // Response trực tiếp là array, không có wrapper
					setWarrantyCount(warranties.length);
					console.log('Warranty count:', warranties.length, warranties);
				} catch (warrantyErr) {
					console.log('Warranty API error:', warrantyErr);
					setWarrantyCount(0);
				}

			} catch (err) {
				console.error('Fetch dashboard data error:', err);
				setBookingsCount(0);
				setWarrantyCount(0);
			}
		})();

	}, [dispatch, user?._id]);

	return (
		<>
			<Header />

			<BreadcrumbSection />
			<DashboardMenu activeTab={activeTab} onSelect={setActiveTab} />

			<div className="content dashboard-content">
				<style>{`
					@media (max-width: 768px) {
						.dashboard-content {
							padding: 1rem 0 !important;
						}
						.dashboard-content .container-xl {
							padding: 0 1rem !important;
						}
						.widget-box {
							margin-bottom: 1rem !important;
						}
						.card-header h5 {
							font-size: 1.1rem !important;
						}
					}
				`}</style>
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