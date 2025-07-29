import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchTechnicianJobDetails } from '../../features/technicians/technicianSlice';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import Header from '../../components/common/Header';

const TechnicianJob = () => {
  const technician = useSelector((state) => state.auth);
  const { bookingId } = useParams(); // ✅ FIXED
  const technicianId = technician?.technician?._id; // ✅ an toàn

  const dispatch = useDispatch();

  const jobDetail = useSelector(state => state.technician.jobDetail);
  const loading = useSelector(state => state.technician.loading);
  const error = useSelector(state => state.technician.error);
  console.log(jobDetail);


  useEffect(() => {
    if (technicianId && bookingId) {
      dispatch(fetchTechnicianJobDetails({ technicianId, bookingId }));
    }
  }, [technicianId, bookingId, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!jobDetail) return <p>No job detail found.</p>;

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <BreadcrumbBar />
        <div className="p-6 max-w-3xl mx-auto bg-white shadow-lg rounded-xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            📄 Thông tin đơn đặt: <span className="text-blue-600">{jobDetail.bookingCode}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p><strong>Mô tả:</strong> {jobDetail.description || 'Chưa có mô tả'}</p>
              <p><strong>Trạng thái:</strong> {jobDetail.status || 'Chưa rõ'}</p>
              <p><strong>Thanh toán:</strong> {jobDetail.paymentStatus || 'Chưa rõ'}</p>
            </div>

            <div>
              <p><strong>Khách hàng:</strong> {jobDetail.customerId?.fullName || 'Ẩn danh'}</p>
              <p><strong>Dịch vụ:</strong> {jobDetail.serviceId?.serviceName || 'Không rõ'}</p>
              <p><strong>Địa chỉ:</strong> {jobDetail.location?.address || 'Không có địa chỉ'}</p>
            </div>

            <div>
              <p>
                <strong>Lịch hẹn:</strong>{' '}
                {jobDetail.schedule ? new Date(jobDetail.schedule).toLocaleString() : 'Không có'}
              </p>
            </div>

            <div>
              <p><strong>Xác nhận khách:</strong> {jobDetail.customerConfirmedDone ? "✅ Có" : "❌ Chưa"}</p>
              <p><strong>Xác nhận kỹ thuật:</strong> {jobDetail.technicianConfirmedDone ? "✅ Có" : "❌ Chưa"}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📷 Hình ảnh</h3>
            {jobDetail.images?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {jobDetail.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Hình ảnh ${index + 1}`}
                    className="w-full h-40 object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có hình ảnh nào được tải lên.</p>
            )}
          </div>
        </div>

      </div>
    </>
  );
};


export default TechnicianJob;
