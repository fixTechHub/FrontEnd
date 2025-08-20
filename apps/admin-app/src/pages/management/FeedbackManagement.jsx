import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFeedback, updateFeedbackVisibility } from "../../features/feedback/feedbackSlice";
import { Button, Select, Spin, Modal, Form, Input, Typography } from "antd";
import { ExclamationCircleTwoTone } from "@ant-design/icons";

function FeedbackAdmin() {
  const dispatch = useDispatch();
  const { feedbacks, status } = useSelector((state) => state.adminFeedback);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [reason, setReason] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbacksPerPage, setFeedbacksPerPage] = useState(10);
  const [form] = Form.useForm();

  // ✅ Load tất cả feedback khi vào trang
  useEffect(() => {
    dispatch(fetchAllFeedback({}));
  }, [dispatch]);

  // ✅ Xử lý mở modal ẩn feedback
  const handleHideClick = (id) => {
    setSelectedFeedbackId(id);
    setShowModal(true);
  };

  // ✅ Xác nhận ẩn feedback
  const handleConfirmHide = () => {
    if (!reason.trim()) {
      alert("Vui lòng nhập lý do ẩn feedback");
      return;
    }
    dispatch(updateFeedbackVisibility({ feedbackId: selectedFeedbackId, isVisible: false, reason }));
    setShowModal(false);
    setReason("");
  };

  // ✅ Lọc dữ liệu hiển thị
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchSearch =
      fb.fromUser?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      fb.content?.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus =
      filterStatus === null
        ? true
        : filterStatus === "VISIBLE"
          ? fb.isVisible
          : !fb.isVisible;

    return matchSearch && matchStatus;
  });

  // ✅ Phân trang
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ✅ Reset trang khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus]);

  if (status === "loading") return <Spin />;

  return (
    <div className="modern-page- wrapper">
      <div className="modern-content-card">
        {/* 🔹 Header & Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Quản lí đánh giá</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/admin">Trang chủ</a>
                </li>
                <li className="breadcrumb-item active">Đánh giá</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* 🔹 Search & Filter */}
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="top-search">
              <div className="top-search-group">
                <span className="input-icon">
                  <i className="ti ti-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Select
              placeholder="Trạng thái"
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: 140 }}
              allowClear
            >
              <Select.Option value="VISIBLE">Hiển thị</Select.Option>
              <Select.Option value="HIDDEN">Ẩn</Select.Option>
            </Select>
          </div>
        </div>

        {/* Filter Info */}
        {(searchText || filterStatus) && (
          <div className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded">
            <span className="text-muted fw-medium">Bộ lọc hiện tại:</span>
            {searchText && (
              <span className="badge bg-primary-transparent">
                <i className="ti ti-search me-1"></i>
                Tìm kiếm: "{searchText}"
              </span>
            )}
            {filterStatus && (
              <span className="badge bg-warning-transparent">
                <i className="ti ti-filter me-1"></i>
                Trạng thái: {filterStatus === 'VISIBLE' ? 'Hiển thị' : 'Ẩn'}
              </span>
            )}
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setSearchText('');
                setFilterStatus(null);
              }}
            >
              <i className="ti ti-x me-1"></i>
              Xóa tất cả
            </button>
          </div>
        )}

        {/* 🔹 Table */}
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>Người dùng</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {status === "loading" ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    <div>
                      <i className="ti ti-message-circle" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                      <p className="mb-0">Không có feedback nào</p>
                    </div>
                  </td>
                </tr>
              ) : currentFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    <div>
                      <i className="ti ti-search" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                      <p className="mb-0">Không tìm thấy feedback nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentFeedbacks.map((fb) => (
                  <tr key={fb._id}>
                    <td>{fb.fromUser?.fullName}</td>
                    <td>{fb.content}</td>
                    <td>
                      <span
                        className={`badge ${fb.isVisible
                          ? "bg-success-transparent"
                          : "bg-danger-transparent"
                          } text-dark`}
                      >
                        {fb.isVisible ? " Đang hiển thị " : "Đã ẩn"}
                      </span>
                    </td>
                    <td>
                      {fb.isVisible && (
                        <Button
                          className="management-action-btn"
                          size="middle"
                          danger
                          onClick={() => handleHideClick(fb._id)}
                        >
                          Ẩn
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info and Controls */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="d-flex align-items-center gap-3">
            <div className="text-muted">
              Hiển thị {indexOfFirstFeedback + 1}-{Math.min(indexOfLastFeedback, filteredFeedbacks.length)} trong tổng số {filteredFeedbacks.length} feedback
            </div>
          </div>
          {filteredFeedbacks.length > 0 && (
            <nav>
              <ul className="pagination mb-0" style={{ gap: '2px' }}>
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ 
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-left"></i>
                  </button>
                </li>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show all pages if total pages <= 7
                  if (totalPages <= 7) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  }
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <li key={i} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                          style={{ 
                            border: '1px solid #dee2e6',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            minWidth: '40px',
                            backgroundColor: currentPage === pageNumber ? '#007bff' : 'white',
                            color: currentPage === pageNumber ? 'white' : '#007bff',
                            borderColor: currentPage === pageNumber ? '#007bff' : '#dee2e6'
                          }}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  } else if (
                    pageNumber === currentPage - 2 || 
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <li key={i} className="page-item disabled">
                        <span className="page-link" style={{ 
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          minWidth: '40px',
                          backgroundColor: '#f8f9fa',
                          color: '#6c757d'
                        }}>...</span>
                      </li>
                    );
                  }
                  return null;
                })}
                
                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{ 
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      minWidth: '40px'
                    }}
                  >
                    <i className="ti ti-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>

        {/* ✅ Modal nhập lý do ẩn Feedback */}
        {showModal && (
          <div className="feedback-modal-overlay">
            <div className="feedback-modal">
              <h3>Nhập lý do ẩn Feedback</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
              />
              <div className="feedback-modal-footer">
                <Button onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="primary" onClick={handleConfirmHide}>
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
  .feedback-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feedback-modal {
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    width: 380px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    animation: fadeInScale 0.25s ease;
  }

  .feedback-modal h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }

  .feedback-modal textarea {
    width: 100%;
    min-height: 100px;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .feedback-modal textarea:focus {
    outline: none;
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.2);
  }

  .feedback-modal-footer {
    text-align: right;
    margin-top: 16px;
  }

  .feedback-modal-footer button {
    margin-left: 8px;
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`}
        </style>

      </div>
    </div>
  );
}

export default FeedbackAdmin;