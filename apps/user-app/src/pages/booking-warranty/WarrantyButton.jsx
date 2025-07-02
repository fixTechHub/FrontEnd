import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { requestWarrantyThunk, resetWarrantyState } from '../../features/booking-warranty/warrantySlice';

const WarrantyButton = ({ bookingId = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {  loading, error } = useSelector((state) => state.warranty);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingId) {
      toast.error('Booking ID is required');
      return;
    }
    try {
      const result = await dispatch(requestWarrantyThunk({ bookingId })).unwrap();
      toast.success(
        `Yêu cầu bảo hành thành công, Hết hạn: ${new Date(result.expireAt).toLocaleString('vi-VN')}`
      );
      navigate(`/warranty?bookingWarrantyId=${result._id}`);
      dispatch(resetWarrantyState()); // Reset state after navigation
    } catch (err) {
      toast.error(`Lỗi: ${err}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Yêu cầu bảo hành'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
    </div>
  );
};

export default WarrantyButton;