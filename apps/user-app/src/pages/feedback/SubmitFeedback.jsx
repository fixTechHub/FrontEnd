import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ thêm useNavigate
import { submitFeedbackThunk, clearMessages } from '../../features/feedbacks/feedbackSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingReportButton from '../../components/common/BookingReportButton';
import FavoriteTechnicianButton from '../../components/common/FavoriteTechnicianButton';
import ImageUploader from "../booking/common/ImageUploader";
import { toast, ToastContainer } from 'react-toastify'; // ✅ đảm bảo Container có mặt
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

const SubmitFeedback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅
  const { bookingId } = useParams();
  const { loading } = useSelector((state) => state.feedback);
  const { booking } = useSelector((state) => state.booking);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [dispatch, bookingId]);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  const handleFilesSelect = (selectedFiles) => setFiles(selectedFiles);

  // ✅ Chỉ toast khi BE trả thành công thật sự
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    const formData = new FormData();
    formData.append('rating', String(rating)); // ép chuỗi cho chắc
    formData.append('content', content);
    files.forEach((file) => formData.append('files', file)); // key 'files' trùng multer.array('files')

    try {
      const res = await dispatch(submitFeedbackThunk({ bookingId, formData })).unwrap();
      console.log('[Feedback] success:', res);
      toast.success(res?.message || 'Bạn đã đánh giá thành công!', {
        autoClose: 1500,
        onClose: () => navigate('/'), // ✅ đóng toast thì điều hướng
      });
    } catch (err) {
      console.error('[Feedback] error:', err);
      toast.error(err?.message || 'Gửi đánh giá thất bại, vui lòng thử lại.');
    }
  };

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <BreadcrumbBar />

        <section className="section product-details">
          <div className="container">
            <div className="row">
              <div className="col-lg-8">
                <div className="review-sec">
                  <div className="review-header">
                    <div className="d-flex align-items-center gap-2">
                      <h4 className="mb-0">Thông tin đơn hàng</h4>
                      <BookingReportButton bookingId={bookingId} reportedUserId={booking.technicianId?._id} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', rowGap: '12px', columnGap: '16px' }}>
                      <span style={{ color: '#888' }}>Mã đơn</span>
                      <span>{booking.bookingCode}</span>

                      <span style={{ color: '#888' }}>Dịch vụ</span>
                      <span>{booking.serviceId?.serviceName}</span>

                      <span style={{ color: '#888' }}>Mô tả chi tiết</span>
                      <span>{booking.description}</span>

                      <span style={{ color: '#888' }}>Thời gian đặt</span>
                      <span>
                        {dayjs(booking.schedule?.startTime).format('HH:mm DD/MM/YYYY')} - {dayjs(booking.schedule?.expectedEndTime).format('HH:mm DD/MM/YYYY')}
                      </span>

                      <span style={{ color: '#888' }}>Địa điểm</span>
                      <span>{booking.location?.address}</span>

                      <span style={{ color: '#888' }}>Thời gian hoàn thành</span>
                      <span>{dayjs(booking.completedAt).format('HH:mm DD/MM/YYYY')}</span>

                      <span style={{ color: '#888' }}>Thời hạn bảo hành</span>
                      <span>{dayjs(booking.warrantyExpiresAt).format('HH:mm DD/MM/YYYY')}</span>

                      <span style={{ color: '#888' }}>Tổng tiền</span>
                      <span>{booking.finalPrice.toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>

                <div className="review-sec leave-reply-form mb-0">
                  <div className="review-header">
                    <h4>Đánh giá</h4>
                  </div>

                  <div className="card-body">
                    <div className="review-list">
                      <ul>
                        <li className="review-box feedbackbox mb-0">
                          <div className="review-details">
                            <form onSubmit={handleSubmit}>
                              <div className="col-xl-4 col-md-6">
                                <div className="set-rating">
                                  <p>Đánh giá dịch vụ</p>
                                  <div className="rating-selection">
                                    {[5, 4, 3, 2, 1].map((num) => (
                                      <React.Fragment key={`service${num}`}>
                                        <input
                                          type="radio"
                                          id={`service${num}`}
                                          name="rating"
                                          value={num}
                                          checked={rating === num}
                                          onChange={(e) => setRating(Number(e.target.value))}
                                          required
                                        />
                                        <label htmlFor={`service${num}`}></label>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-lg-12">
                                  <div className="input-block">
                                    <label>Viết đánh giá</label>
                                    <textarea
                                      rows="4"
                                      className="form-control"
                                      placeholder="Comments"
                                      value={content}
                                      onChange={(e) => setContent(e.target.value)}
                                      required
                                    ></textarea>
                                  </div>
                                </div>
                              </div>

                              <div className="col-lg-6">
                                <div className="input-block">
                                  <ImageUploader onFilesSelect={handleFilesSelect} />
                                  <div style={{ marginTop: '10px' }}>
                                    {files.length > 0 && files.map((file, i) => <p key={i}>{file.name}</p>)}
                                  </div>
                                </div>
                              </div>

                              <div className="submit-btn text-end">
                                <button className="btn btn-primary submit-review" type="submit" disabled={loading}>
                                  {loading ? 'Submitting...' : 'Gửi đánh giá'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 theiaStickySidebar">
                <div className="review-sec extra-service mt-0">
                  <div className="review-header">
                    <h4 className="mb-0">Kỹ thuật viên</h4>
                  </div>
                  <div className="owner-detail">
                    <div className="owner-img">
                      <a href="#">
                        <img src={booking.technicianId?.userId.avatar} alt="Technician" />
                      </a>
                    </div>
                    <div className="reviewbox-list-rating">
                      <h5 className="d-flex align-items-center gap-2">
                        <a href="#" className="text-decoration-none text-dark">
                          {booking.technicianId?.userId?.fullName || 'Unknown Technician'}
                        </a>
                        {booking.technicianId?.userId?._id && (
                          <FavoriteTechnicianButton technicianId={booking.technicianId._id} />
                        )}
                      </h5>
                      <p>
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < Math.round(booking.technicianId?.rates?.ratingAverage || 0) ? 'filled' : ''}`}
                            ></i>
                          ))}
                        <span> ({booking.technicianId?.ratingAverage?.toFixed(1) || '0.0'})</span>
                      </p>
                    </div>
                  </div>

                  <ul className="booking-list">
                    <li>
                      <span>Địa chỉ</span>
                      <span>
                        {booking.technicianId?.userId?.address
                          ? `${booking.technicianId.userId.address.street}, ${booking.technicianId.userId.address.district}, ${booking.technicianId.userId.address.city}`
                          : 'N/A'}
                      </span>
                    </li>
                    <li>
                      <span>Kinh nghiệm</span>
                      <span>{booking.technicianId?.experienceYears || 0} years</span>
                    </li>
                    <li>
                      <span>Chuyên môn</span>
                      <span>
                        <div style={{ flex: 1 }}>
                          {booking.technicianId?.specialtiesCategories?.map((category, index) => (
                            <div key={index}>• {category.categoryName}</div>
                          ))}
                        </div>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* ✅ Gắn tạm Container ngay trang này để chắc chắn toast hiện */}
      <ToastContainer position="top-right" limit={1} />

      <style>{`
        /* giữ sao cùng hàng */
        .review-sec .set-rating{ display:flex; align-items:center; flex-wrap:nowrap; gap:12px; }
        .review-sec .set-rating p{ margin:0 10px 0 0; white-space:nowrap; color:#676767; font-size:14px; }
        .review-sec .set-rating .rating-selection{ display:flex; flex-wrap:nowrap; gap:6px; direction: rtl; }
        .review-sec .set-rating .rating-selection input{ position:absolute; left:-9999px; }
        .review-sec .set-rating .rating-selection label{ cursor:pointer; display:inline-block; line-height:1; font-size:22px; user-select:none; }
        .review-sec .set-rating .rating-selection label::before{ content:'★'; opacity:.35; transition:opacity .15s ease, transform .15s ease; }
        .review-sec .set-rating .rating-selection label:hover::before,
        .review-sec .set-rating .rating-selection label:hover ~ label::before{ opacity:1; color:#ff9f43; transform:scale(1.02); }
        .review-sec .set-rating .rating-selection input:checked ~ label::before{ opacity:1; color:#ff9f43; }
      `}</style>
    </>
  );
};

export default SubmitFeedback;
