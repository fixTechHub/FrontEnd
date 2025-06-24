import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';

const TechnicianJob = () => {
  const { technicianId, bookingId } = useParams();  // Lấy param từ URL
  const dispatch = useDispatch();

  const jobDetail = useSelector(state => state.technician.jobDetail);
  const loading = useSelector(state => state.technician.loading);
  const error = useSelector(state => state.technician.error);
console.log("job: "+ jobDetail);

  useEffect(() => {
    if (technicianId && bookingId) {
      dispatch(fetchTechnicianJobDetails({ technicianId, bookingId }));
    }
  }, [technicianId, bookingId, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!jobDetail) return <p>No job detail found.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Thông tin đơn đặt: {jobDetail.bookingCode}</h2>

      <p><strong>Mô tả:</strong> {jobDetail.description}</p>

      <p><strong>Trạng thái:</strong> {jobDetail.status}</p>
      <p><strong>Trạng thái thanh toán:</strong> {jobDetail.paymentStatus}</p>

      <div className="mt-3">
        
        
        <p><strong>Tên khách hàng:</strong> {jobDetail.customerId?.fullName}</p>
        
      </div>

      <div className="mt-3">
        <p><strong>Tên dịch vụ:</strong> {jobDetail.serviceId?.serviceName}</p>
      </div>

      <div className="mt-3">
        <p><strong>Địa chỉ:</strong> {jobDetail.location?.address}</p> 
      </div>

      <div className="mt-3">
        <p><strong>Lịch hẹn</strong> {new Date(jobDetail.schedule).toLocaleString()}</p>
      </div>

      <div className="mt-3">
        <p><strong>Khách xác nhận hoàn thành:</strong> {jobDetail.customerConfirmedDone ? "Có" : "Chưa"}</p>
        <p><strong>Kỹ thuật xác nhận hoàn thành:</strong> {jobDetail.technicianConfirmedDone ? "Có" : "Chưa"}</p>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold">Hình ảnh</h3>
        {jobDetail.images?.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Hình ảnh ${index + 1}`}
            className="w-32 h-32 object-cover mr-2 inline-block"
          />
        ))}
      </div>
    </div>
  );
};

export default TechnicianJob;
