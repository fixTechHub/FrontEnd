import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Select, Spin } from "antd";
import { fetchAllFeedback, updateFeedbackVisibility } from "../../features/feedback/feedbackSlice";

function FeedbackAdmin() {
  const dispatch = useDispatch();
  const { feedbacks, status } = useSelector((state) => state.adminFeedback);

  const [showModal, setShowModal] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [reason, setReason] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);

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

  if (status === "loading") return <Spin />;

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        {/* 🔹 Header & Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Feedback Management</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/admin">Home</a>
                </li>
                <li className="breadcrumb-item active">Feedback</li>
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
                  placeholder="Search by user or content"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
            <Select
              placeholder="Status"
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value)}
              style={{ width: 140 }}
              allowClear
            >
              <Select.Option value="VISIBLE">VISIBLE</Select.Option>
              <Select.Option value="HIDDEN">HIDDEN</Select.Option>
            </Select>
          </div>
        </div>

        {/* 🔹 Table */}
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>USER</th>
                <th>CONTENT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    Không có feedback nào
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((fb) => (
                  <tr key={fb._id}>
                    <td>{fb.fromUser?.fullName}</td>
                    <td>{fb.content}</td>
                    <td>
                      <span
                        className={`badge ${
                          fb.isVisible
                            ? "bg-success-transparent"
                            : "bg-danger-transparent"
                        } text-dark`}
                      >
                        {fb.isVisible ? "VISIBLE" : "HIDDEN"}
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
                          Hide
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Modal nhập lý do ẩn Feedback */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-3">
                Nhập lý do ẩn Feedback
              </h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do..."
                className="w-full border rounded-md p-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              />
              <div className="text-right space-x-2">
                <Button onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="primary" onClick={handleConfirmHide}>
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedbackAdmin;