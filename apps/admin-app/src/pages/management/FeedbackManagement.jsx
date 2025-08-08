import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFeedback, updateFeedbackVisibility } from "../../features/feedback/feedbackSlice";
import { message, Modal, Button, Switch, Spin } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import "../../../public/css/ManagementTableStyle.css";

const FeedbackManagement = () => {
  const dispatch = useDispatch();
  const { feedbacks, status, error } = useSelector((state) => state.adminFeedback);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const feedbacksPerPage = 10;

  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage);
  const indexOfLastFeedback = currentPage * feedbacksPerPage;
  const indexOfFirstFeedback = indexOfLastFeedback - feedbacksPerPage;
  const currentFeedbacks = feedbacks.slice(indexOfFirstFeedback, indexOfLastFeedback);

  useEffect(() => {
    dispatch(fetchAllFeedback());
  }, [dispatch]);

  const handleOpenDetail = (feedback) => {
    setSelectedFeedback(feedback);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedFeedback(null);
  };

  const handleToggleVisibility = async (feedbackId, isVisible) => {
    try {
      await dispatch(updateFeedbackVisibility({ feedbackId, isVisible })).unwrap();
      message.success(`Feedback ${isVisible ? 'shown' : 'hidden'} successfully!`);
    } catch (error) {
      message.error('Failed to update feedback visibility: ' + error);
    }
  };

  if (status === 'loading' && feedbacks.length === 0) {
    return (
      <div className="text-center p-5">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="modern-page-wrapper">
      <div className="modern-content-card">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Feedback Management</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Feedback</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>USER</th>
                <th>RATING</th>
                <th>COMMENT</th>
                <th>VISIBLE</th>
                <th>CREATED AT</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentFeedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.userName || feedback.user?.fullName || 'Unknown'}</td>
                  <td>
                    <span className="text-warning">
                      {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}
                    </span>
                    ({feedback.rating}/5)
                  </td>
                  <td>
                    <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {feedback.comment}
                    </div>
                  </td>
                  <td>
                    <Switch
                      checked={feedback.isVisible}
                      onChange={(checked) => handleToggleVisibility(feedback._id, checked)}
                      size="small"
                    />
                  </td>
                  <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      className="management-action-btn" 
                      size="middle" 
                      onClick={() => handleOpenDetail(feedback)}
                    >
                      <EyeOutlined style={{marginRight: 4}} />
                      View Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination mb-0">
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedFeedback && (
        <Modal
          open={showDetailModal}
          onCancel={handleCloseDetail}
          footer={null}
          title="Feedback Detail"
          width={600}
        >
          <div className="p-3">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>User:</strong> {selectedFeedback.userName || selectedFeedback.user?.fullName || 'Unknown'}
              </div>
              <div className="col-md-6">
                <strong>Rating:</strong> 
                <span className="text-warning ms-2">
                  {'★'.repeat(selectedFeedback.rating)}{'☆'.repeat(5 - selectedFeedback.rating)}
                </span>
                ({selectedFeedback.rating}/5)
              </div>
            </div>
            <div className="mb-3">
              <strong>Comment:</strong>
              <div className="mt-2 p-3 bg-light rounded">
                {selectedFeedback.comment}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Visible:</strong> 
                <Switch
                  checked={selectedFeedback.isVisible}
                  onChange={(checked) => handleToggleVisibility(selectedFeedback._id, checked)}
                  className="ms-2"
                />
              </div>
              <div className="col-md-6">
                <strong>Created:</strong> {new Date(selectedFeedback.createdAt).toLocaleString()}
              </div>
            </div>
            {selectedFeedback.booking && (
              <div className="mb-3">
                <strong>Booking Info:</strong>
                <div className="mt-2 p-3 bg-light rounded">
                  <div>Service: {selectedFeedback.booking.serviceName}</div>
                  <div>Technician: {selectedFeedback.booking.technicianName}</div>
                  <div>Date: {new Date(selectedFeedback.booking.scheduledDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FeedbackManagement;