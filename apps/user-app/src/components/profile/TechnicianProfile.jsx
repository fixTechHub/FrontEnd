import { Image, Tabs, Tab } from "react-bootstrap";
import Rating from "react-rating";
import { formatDate } from "../../utils/formatDate";
import { useState, useEffect } from "react";

function TechnicianProfile({ technician }) {
    // console.log('--- TECHNICIAN PROFILE ---', technician);
    
    // State cho phân trang đánh giá
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewsPerPage] = useState(3);

    // Reset về trang 1 khi technician thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [technician]);

    // Tính toán đánh giá cho trang hiện tại
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = technician?.recentFeedbacks?.slice(indexOfFirstReview, indexOfLastReview) || [];
    const totalPages = Math.ceil((technician?.recentFeedbacks?.length || 0) / reviewsPerPage);

    // Hàm chuyển trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Hàm chuyển về trang đầu
    const goToFirstPage = () => {
        setCurrentPage(1);
    };

    // Hàm chuyển đến trang cuối
    const goToLastPage = () => {
        setCurrentPage(totalPages);
    };

    // Hàm chuyển trang trước
    const goToPreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    // Hàm chuyển trang sau
    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

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
                                <span className="h5 fw-bold mb-0">{technician?.ratingAverage.toFixed(1) || '0'}</span>
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
                    <div className="content-area p-4">
                        <div className="tab-content" id="technicianTabsContent">

                            <div className="tab-pane fade show active" id="overview" role="tabpanel" aria-labelledby="overview-tab">
                                <div className="row g-4">
                                    <div className="col-12">
                                        <h5 className="fw-semibold text-dark mb-3">Thông tin cơ bản</h5>
                                        {/* <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                    <i className="bi bi-telephone text-primary"></i>
                                                    <span>0912345678</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                    <i className="bi bi-envelope text-primary"></i>
                                                    <span>nam.technician@gmail.com</span>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div className="col-12">
                                            {/* <div className="d-flex align-items-center gap-3 p-3 bg-light rounded">
                                                <i className="bi bi-telephone text-primary"></i>
                                                <span>0912345678</span>
                                            </div> */}
                                            <span>Kinh nghiệm làm việc: {technician?.experienceYears + ' năm' || '0 năm'}</span>
                                        </div>

                                        <div className="col-12">
                                            <span>Việc đã hoàn thành: {technician?.jobCompleted || '0'}</span>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <h5 className="fw-semibold text-dark mb-3">Chuyên môn</h5>
                                        <div className="d-flex flex-wrap">
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

                            {/* <div className="stats-card mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-medium">Phí kiểm tra ban đầu</span>
                                    <span className="h5 fw-bold text-primary mb-0">{technician?.inspectionFee?.toLocaleString() || '0'} VNĐ</span>
                                </div>
                            </div> */}

                            <div className="stats-card mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="fw-medium">Phí sửa chữa dịch vụ</span>
                                        <p className="small mb-0">Có thể sẽ có phát sinh</p>
                                    </div>
                                    <span className="h5 fw-bold mb-0">{technician?.servicePrice?.toLocaleString() || 'Đang cập nhật..'} VNĐ</span>
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
                                <div className="display-4 fw-bold text-primary">{technician?.ratingAverage.toFixed(1) || '0'}</div>
                                <Rating
                                    initialRating={technician?.ratingAverage}
                                    readonly
                                    fullSymbol={<i style={{ color: '#FFA633' }} className="fas fa-star filled" />}
                                    emptySymbol={<i style={{ color: '#FFA633' }} className="far fa-star" />}
                                />
                                <p className="mt-2">Dựa trên {technician?.totalFeedbacks || 'Đang cập nhật..'} đánh giá</p>
                            </div>

                            <h6 className="fw-semibold text-dark mb-3">Đánh giá gần đây</h6>

                            {currentReviews.length > 0 ? (
                                <>
                                    {currentReviews.map((feedback, idx) => (
                                        <div key={idx} className="stats-card mb-3">
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

                                    {totalPages > 1 && (
                                        <div className="pagination-container mt-4" style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <button 
                                                onClick={goToFirstPage} 
                                                disabled={currentPage === 1}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                                                    color: currentPage === 1 ? '#999' : '#333',
                                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Đầu
                                            </button>
                                            <button 
                                                onClick={goToPreviousPage} 
                                                disabled={currentPage === 1}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                                                    color: currentPage === 1 ? '#999' : '#333',
                                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Trước
                                            </button>
                                            <span style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                borderRadius: '4px',
                                                fontSize: '14px',
                                                fontWeight: '500'
                                            }}>
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button 
                                                onClick={goToNextPage} 
                                                disabled={currentPage === totalPages}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                                                    color: currentPage === totalPages ? '#999' : '#333',
                                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Sau
                                            </button>
                                            <button 
                                                onClick={goToLastPage} 
                                                disabled={currentPage === totalPages}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                                                    color: currentPage === totalPages ? '#999' : '#333',
                                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Cuối
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-0">Chưa có đánh giá nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </>
    )
}

export default TechnicianProfile;
