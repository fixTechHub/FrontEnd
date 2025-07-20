import { Image, Tabs, Tab } from "react-bootstrap";
import Rating from "react-rating";

function TechnicianProfile({ technician }) {
    // console.log('--- TECHNICIAN PROFILE ---', technician);

    const StarRating = ({ rating, size = 16 }) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} style={{ color: '#fbbf24', fontSize: `${size}px` }}>★</span>);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<span key={i} style={{ color: '#fbbf24', fontSize: `${size}px` }}>☆</span>);
            } else {
                stars.push(<span key={i} style={{ color: '#d1d5db', fontSize: `${size}px` }}>☆</span>);
            }
        }
        return <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>{stars}</div>;
    };

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: '🔧' },
        { id: 'services', label: 'Dịch vụ & Giá', icon: '📈' },
        { id: 'reviews', label: 'Đánh giá', icon: '⭐' }
    ];

    return (
        <>
            <div className="header-content">
                <div className="avatar-container">
                    <img
                        src={technician?.userInfo?.avatar}
                        alt={technician?.userInfo?.fullName}
                        className="avatar"
                    />
                    {/* {(technician?.userInfo?.emailVerified || technician?.userInfo?.phoneVerified) && (
                        <div className="verified-badge">
                            🛡️
                        </div>
                    )} */}
                </div>

                <div style={{ flex: 1 }}>
                    <h2 className="technician-name">{technician?.userInfo?.fullName}</h2>
                    <div className="rating-container">
                        <StarRating rating={technician?.ratingAverage} />
                        <span className="rating-score">{technician?.ratingAverage}</span>
                        <span className="rating-count">({technician?.totalReviews} đánh giá)</span>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <span>🕐</span>
                            <span>{technician?.experienceYears} năm kinh nghiệm</span>
                        </div>
                        <div className="stat-item">
                            <span>🏆</span>
                            <span>{technician?.jobCompleted} công việc hoàn thành</span>
                        </div>
                        <div className="stat-item">
                            <span>📍</span>
                            <span>{technician?.userInfo?.location}</span>
                        </div>
                        <div className="stat-item">
                            <span>📈</span>
                            <span>{technician?.completionRate}% tỷ lệ hoàn thành</span>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs
                defaultActiveKey="home"
                id="fill-tab-example"
                className="mb-3"
                fill
            >
                <Tab eventKey="home" title="Tổng quan">
                    <div className="booking-sidebar">
                        <div className="booking-sidebar-card">
                            <div className="booking-sidebar-body p-0">
                                <div className="booking-car-detail" style={{ color: '#FFA633', display: 'flex', flexDirection: 'column', paddingTop: 0, paddingBottom: 0 }}>
                                    {/* <Rating
                                initialRating={technician?.ratingAverage}
                                readonly
                                style={{ padding: 5, fontSize: 25 }}
                                fullSymbol={<i className="fas fa-star filled"></i>}
                                emptySymbol={<i className="far fa-star"></i>}
                            /> */}

                                    <Image
                                        key={technician?.userInfo?.fullName}
                                        src={technician?.userInfo?.avatar}
                                        thumbnail
                                        style={{ maxWidth: 240, height: "auto", objectFit: "contain" }}
                                    />
                                </div>

                                <div className="booking-vehicle-rates">
                                    <ul>
                                        <li>
                                            <h6><span>Tên kỹ thuật viên:</span> {technician?.userInfo?.fullName || 'Chưa cập nhật'}</h6>
                                        </li>
                                        <li>
                                            <h6><span>Trạng thái:</span> {technician?.userInfo?.emailVerified || technician?.userInfo?.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}</h6>
                                        </li>
                                        <li>
                                            <h6><span>Phí kiểm tra:</span> {technician?.rates?.inspectionFee.toLocaleString() + ' VNĐ' || 'Chưa cập nhật'}</h6>
                                        </li>
                                        <li>
                                            <h6><span>Kinh nghiệm:</span> {technician?.experienceYears + ' năm' || '0 năm'}</h6>
                                        </li>
                                        <li>
                                            <h6>
                                                <span>Đánh giá:</span> {technician?.ratingAverage || '0'} <i className="fas fa-star filled"></i>
                                                <span> (150 đánh giá)</span>
                                            </h6>

                                        </li>
                                        <li>
                                            <h6><span>Công việc đã hoàn thành:</span> {technician?.jobCompleted || '0'}</h6>
                                        </li>
                                        <li>
                                            <h6>
                                                <span>Giá công đối với dịch vụ:</span>
                                                <div>
                                                    <li><span>Cơ bản </span> {': ' + technician?.rates?.laborTiers?.tier1.toLocaleString() + ' VNĐ' || '0'}</li>
                                                    <li><span>Trung bình </span> {': ' + technician?.rates?.laborTiers?.tier2.toLocaleString() + ' VNĐ' || '0'}</li>
                                                    <li><span>Phức tạp </span> {': ' + technician?.rates?.laborTiers?.tier3.toLocaleString() + ' VNĐ' || '0'}</li>
                                                </div>
                                            </h6>
                                        </li>
                                        <li>
                                            <h6>
                                                <span>Chuyên môn:</span>
                                                <div className="specialty-tags">
                                                    {technician?.category.map((cate, idx) => (
                                                        <span key={idx} className="specialty-tag">
                                                            {cate?.categoryName || "Đang cập nhật.."}
                                                        </span>
                                                    ))}
                                                </div>
                                            </h6>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey="service" title="Dịch vụ & Giá">
                    Tab content for Profile
                </Tab>
                <Tab eventKey="review" title="Đánh giá">
                    Tab content for Loooonger Tab
                </Tab>
            </Tabs>


        </>
    )
}

export default TechnicianProfile;
