import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requestWarrantyThunk, resetWarrantyState } from '../../features/booking-warranty/warrantySlice';

const WarrantyButton = ({ bookingId = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.warranty);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(null);

  const handleCloseModal = () => {
    setReason('');
    setReasonError(null);
    dispatch(resetWarrantyState());
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    setReasonError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      toast.error('Booking ID is required');
      return;
    }
    try {
      const formData = { bookingId, reportedIssue: reason || undefined };
      const result = await dispatch(requestWarrantyThunk(formData)).unwrap();
      toast.success(
        `Yêu cầu bảo hành thành công, Vui lòng đợi trong vòng 24h để thợ phản hồi`
      );
      handleCloseModal();
      navigate(`/warranty?bookingWarrantyId=${result._id}`);
      dispatch(resetWarrantyState());
    } catch (err) {
      setReasonError(err || 'Đã xảy ra lỗi khi yêu cầu bảo hành');
    }
  };

  return (
    <div>
      <a
        href="javascript:void(0);"
        className="dropdown-item"
        data-bs-toggle="modal"
        data-bs-target={`#warranty_modal_${bookingId}`}
        onClick={() => {
          if (!bookingId) {
            toast.error('Booking ID is required');
            return false; // Prevent modal from opening
          }
          handleCloseModal(); // Reset form state when opening
        }}
      >
        <i className="feather-help-circle"></i> Yêu cầu bảo hành
      </a>
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      <div
        className="modal new-modal fade"
        id={`warranty_modal_${bookingId}`}
        data-bs-keyboard="false"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Yêu cầu bảo hành</h4>
              <button
                type="button"
                className="close-btn"
                data-bs-dismiss="modal"
                onClick={handleCloseModal}
              >
                <span>×</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="modal-form-group">
                      <label>
                        Lý do bảo hành <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Nhập lý do bảo hành"
                        value={reason}
                        onChange={handleReasonChange}
                        rows="4"
                      />
                      {reasonError && (
                        <small className="text-danger">{reasonError}</small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-btn modal-btn-sm">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={handleCloseModal}
                  >
                    Thoát
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Xử lý...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarrantyButton;