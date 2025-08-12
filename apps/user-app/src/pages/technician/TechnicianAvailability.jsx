import React, { useEffect, useState } from "react";
import { fetchTechnicianAvailability, changeTechnicianAvailability } from '../../features/technicians/technicianSlice';

const AvailabilityToggleButton = () => {
  const dispatch = useDispatch();

  // Lấy tech từ auth: ưu tiên auth.technician, fallback sang auth.user
  const tech = useSelector((s) => s.auth?.technician || s.auth?.user);
  const availabilityState = useSelector((s) => s.technician?.availability);
  const globalLoading = useSelector((s) => s.technician?.loading);
    
  // Chuẩn hoá về boolean
  const isAvailable =
    availabilityState?.status ??
    availabilityState?.isAvailable ??
    availabilityState
      ? true
      : false;

  const [pending, setPending] = React.useState(false);

  useEffect(() => {
    if (tech?._id) {
      dispatch(fetchTechnicianAvailability(tech._id));
    }
  }, [dispatch, tech?._id]);

  const handleToggle = async () => {
    if (!tech?._id || pending) return;
    setPending(true);
    try {
      await dispatch(
        changeTechnicianAvailability({
          technicianId: tech._id,
          status: !isAvailable,
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      setPending(false);
    }
  };

  const disabled = !tech?._id || pending || globalLoading;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`btn ${isAvailable ? 'btn-success' : 'btn-outline-secondary'}`}
      title={
        isAvailable
          ? 'Đang nhận việc - bấm để tạm ngưng'
          : 'Tạm ngưng - bấm để mở nhận việc'
      }
      style={{ minWidth: 240 }}
    >
      {pending
        ? 'Đang cập nhật...'
        : isAvailable
        ? 'Đang nhận việc (Tắt)'
        : 'Tạm ngưng (Bật)'}
    </button>
  );
};
