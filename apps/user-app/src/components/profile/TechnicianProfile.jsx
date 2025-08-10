import { Image, Tabs, Tab } from "react-bootstrap";
import Rating from "react-rating";
import { formatDate } from "../../utils/formatDate";

function TechnicianProfile({ technician }) {
    // console.log('--- TECHNICIAN PROFILE ---', technician);

    return (
        <>
            <div className="modal-header modal-header-gradient border-0 p-4 mb-1">
                <div className="container-fluid">
                    <div className="row align-items-start">
                        <div className="col-auto">
                            <div className="avatar-container">
                                <img
                                    src={technician?.userInfo?.avatar}
                                    alt={technician?.userInfo?.fullName}
                                    className="rounded-circle border border-4 border-white shadow"
                                    style={{ width: "96px", height: "96px", objectFit: "cover" }}
                                />
                                <div className="verified-badge">
                                    <i className="bi bi-shield-check text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <h2 className="h3 fw-bold mb-2">{technician?.userInfo?.fullName || 'Đang cập nhật..'}</h2>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Rating
                                    initialRating={technician?.ratingAverage}
                                    readonly
                                    fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                    emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                />
                                <span className="h5 fw-bold mb-0">{technician?.ratingAverage || '0'}</span>
                                <span className="text-light opacity-75">({technician?.totalFeedbacks || 'Đang cập nhật..'} đánh giá)</span>
                            </div>
                            <div className="row g-3 small">
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-clock" />
                                        <span>{technician?.experienceYears || '0'} năm kinh nghiệm</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-award" />
                                        <span>{technician?.jobCompleted || '0'} công việc hoàn thành</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-geo-alt" />
                                        <span>{technician?.userInfo?.address?.city || 'Đang cập nhật..'}</span>
                                    </div>
                                </div>
                                {/* <div className="col-md-6">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-graph-up" />
                                        <span>98% tỷ lệ hoàn thành</span>
                                    </div>
                                </div> */}
                            </div>
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
                    <div class="content-area p-4">
                        <div class="tab-content" id="technicianTabsContent">

                            <div class="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                                <div class="row g-4">
                                    <div class="col-12">
                                        <h5 class="fw-semibold text-dark mb-3">Thông tin cơ bản</h5>
                                        {/* <div class="row g-3">
                                            <div class="col-md-6">
                                                <div class="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                    <i class="bi bi-telephone text-primary"></i>
                                                    <span>0912345678</span>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                    <i class="bi bi-envelope text-primary"></i>
                                                    <span>nam.technician@gmail.com</span>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div class="col-12">
                                            {/* <div class="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                <i class="bi bi-telephone text-primary"></i>
                                                <span>0912345678</span>
                                            </div> */}
                                            <span>Kinh nghiệm làm việc: {technician?.experienceYears + ' năm' || '0 năm'}</span>
                                        </div>

                                        <div class="col-12">
                                            <span>Việc đã hoàn thành: {technician?.jobCompleted || '0'}</span>
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <h5 class="fw-semibold text-dark mb-3">Chuyên môn</h5>
                                        <div class="d-flex flex-wrap">
                                            {technician?.category.map((cate, idx) => (
                                                <span key={idx} className="category-tag">
                                                    {cate?.categoryName || "Đang cập nhật.."}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* <div class="col-12">
                                        <h5 class="fw-semibold text-dark mb-3">Giới thiệu</h5>
                                        <p class=" lh-lg">Kỹ thuật viên có hơn 8 năm kinh nghiệm trong lĩnh vực sửa chữa và bảo dưỡng ô tô. Chuyên về các dòng xe Nhật, Hàn và châu Âu.</p>
                                    </div> */}

                                    {/* <div class="col-12">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <div class="stats-card green">
                                                    <h6 class="fw-semibold text-success mb-1">Thời gian làm việc</h6>
                                                    <p class="text-success mb-0">8:00 - 18:00</p>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="stats-card orange">
                                                    <h6 class="fw-semibold text-warning mb-1">Thời gian phản hồi</h6>
                                                    <p class="text-warning mb-0"> 30 phút</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="service" title="Dịch vụ & Giá">
                    <div className="row g-4">
                        <div className="col-12">
                            <h5 className="fw-semibold text-dark mb-4">Bảng giá dịch vụ</h5>

                            <div className="stats-card mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Phí kiểm tra ban đầu</span>
                                    <span className="h5 fw-bold text-primary mb-0">{technician?.inspectionFee.toLocaleString() || '0'} VNĐ</span>
                                </div>
                            </div>

                            <div className="stats-card mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-medium">Phí sửa chữa dịch vụ</span>
                                        <p className="small mb-0">Có thể sẽ có phát sinh</p>
                                    </div>
                                    <span className="h5 fw-bold mb-0">{technician?.servicePrice.toLocaleString() || 'Đang cập nhật..'} VNĐ</span>
                                </div>
                            </div>

                            <div className="stats-card green mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium text-success">Thời gian bảo hành</span>
                                    <span className="h5 fw-bold text-success mb-0">{technician?.warrantyDuration + ' tháng' || 'Không bảo hành'}</span>
                                </div>
                            </div>

                            {/* <div className="stats-card red">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-medium text-danger">Phức tạp</span>
                                        <p className="small text-danger mb-0">Sửa chữa động cơ, hộp số</p>
                                    </div>
                                    <span className="h5 fw-bold text-danger mb-0">800.000 VNĐ</span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </Tab>

                <Tab eventKey="review" title="Đánh giá">
                    <div className="row g-4">
                        <div className="col-12">
                            <div className="text-center mb-4">
                                <div className="display-4 fw-bold text-primary">{technician?.ratingAverage || '0'}</div>
                                <Rating
                                    initialRating={technician?.ratingAverage}
                                    readonly
                                    fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                    emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                />
                                <p className="mt-2">Dựa trên {technician?.totalFeedbacks || 'Đang cập nhật..'} đánh giá</p>
                            </div>

                            <h6 className="fw-semibold text-dark mb-3">Đánh giá gần đây</h6>

                            {technician?.recentFeedbacks.map((feedback, idx) => (
                                <div className="stats-card mb-3">
                                    <div className="d-flex gap-3">
                                        <img src={feedback?.customerAvatar || '/img/avatar.svg'}
                                            alt="Reviewer" className="review-avatar" />
                                        <div className="flex-grow-1">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="fw-semibold">{feedback?.customerName || 'Đang cập nhật..'}</span>
                                                <Rating
                                                    initialRating={feedback?.rating}
                                                    readonly
                                                    fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                                    emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                                />
                                            </div>
                                            <p className="small mb-2">
                                                {feedback?.content || 'Đang cập nhật..'}
                                            </p>
                                            <span className="small">{formatDate(feedback?.createdAt) || 'Đang cập nhật..'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </Tab>
            </Tabs>
        </>
    )
}

export default TechnicianProfile;
