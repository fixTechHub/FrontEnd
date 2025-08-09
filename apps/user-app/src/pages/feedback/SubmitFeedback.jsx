import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useEffect } from "react";
import { submitFeedbackThunk, clearMessages } from '../../features/feedbacks/feedbackSlice';
import { fetchBookingById } from '../../features/bookings/bookingSlice';
import Header from '../../components/common/Header';
import BreadcrumbBar from '../../components/common/BreadcrumbBar';
import BookingReportButton from '../../components/common/BookingReportButton';
import FavoriteTechnicianButton from '../../components/common/FavoriteTechnicianButton';
import ImageUploader from "../booking/common/ImageUploader";
import { toast } from 'react-toastify';

const SubmitFeedback = () => {
  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const { loading, successMessage, errorMessage } = useSelector((state) => state.feedback);
  const { booking } = useSelector((state) => state.booking);




  useEffect(() => {
    if (bookingId) {
      dispatch(fetchBookingById(bookingId));
    }
  }, [dispatch, bookingId]);
  console.log("book", booking);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  // ✅ Xử lý chọn file
  // const handleFileChange = (e) => {
  //   const selectedFiles = [...e.target.files];
  //   setFiles(selectedFiles);
  //   console.log('Selected files:', selectedFiles);
  // };


  const handleFilesSelect = (selectedFiles) => {
    setFiles(selectedFiles);
  };

  // ✅ Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('content', content);

    // ✅ ĐÂY LÀ ĐOẠN BẠN YÊU CẦU THÊM VÀO
    files.forEach((file) => formData.append('files', file)); // key 'files' phải trùng multer.array('files')

    dispatch(submitFeedbackThunk({ bookingId, formData }));
    toast.success('Bạn đã đánh giá thành công thợ!')
  };
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      dispatch(clearMessages()); // Clear message after showing toast
    }
    if (errorMessage) {
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      dispatch(clearMessages()); // Clear message after showing toast
    }
  }, [successMessage, errorMessage, dispatch]);
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
                    <h4>Thông tin đơn hàng</h4>
                  </div>


                  <div >
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', rowGap: '12px', columnGap: '16px' }}>
                      <span style={{ color: '#888' }}>Mã đơn</span>
                      <span>{booking.bookingCode}</span>

                      <span style={{ color: '#888' }}>Dịch vụ</span>
                      <span>{booking.serviceId?.serviceName}</span>

                      <span style={{ color: '#888' }}>Mô tả chi tiết</span>
                      <span>{booking.description}</span>

                      <span style={{ color: '#888' }}>Thời gian đặt</span>
                      <span>
                        {new Date(booking.schedule?.startTime).toLocaleString()} - {new Date(booking.schedule?.expectedEndTime).toLocaleString()}
                      </span>

                      <span style={{ color: '#888' }}>Địa điểm</span>
                      <span>{booking.location?.address}</span>

                      <span style={{ color: '#888' }}>Thời gian hoàn thành</span>
                      <span>{new Date(booking.completedAt).toLocaleString()}</span>

                      <span style={{ color: '#888' }}>Thời hạn bảo hành</span>
                      <span>{new Date(booking.warrantyExpiresAt).toLocaleString()}</span>

                      <span style={{ color: '#888' }}>Tổng tiền</span>
                      <span>{booking.finalPrice.toLocaleString()} VND</span>
                    </div>
                  </div>
                  {/* Báo cáo đơn hàng */}
                  <div className="mt-3">
                    <BookingReportButton bookingId={bookingId} reportedUserId={booking.technicianId?.userId?._id} />
                  </div>
                  </div>

                {/* <div className="review-sec listing-review">
                  <div className="review-header">
                    <h4>Reviews</h4>
                  </div>
                  <div className="review-card">
                    <div className="review-head">
                      <h6>Showing 3 guest reviews</h6>
                    </div>
                    <ul>
                      <li>
                        <div className="review-wraps">
                          <div className="review-header-group">
                            <div className="review-widget-header">
                              <span className="review-widget-img">
                                <img src="assets/img/profiles/avatar-01.jpg" className="img-fluid" alt="User" />
                              </span>
                              <div className="review-design">
                                <h6>Johnson</h6>
                                <p>02 Jan 2023</p>
                              </div>
                            </div>
                            <div className="reviewbox-list-rating">
                              <p>
                                <i className="fas fa-star filled"></i>
                                <i className="fas fa-star filled"></i>
                                <i className="fas fa-star filled"></i>
                                <i className="fas fa-star filled"></i>
                                <i className="fas fa-star filled"></i>
                                <span> (5.0)</span>
                              </p>
                            </div>
                          </div>
                          <p>
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and
                            more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                          </p>
                          <div className="review-reply">
                            <a className="btn" href="#">
                              <i className="fa-solid fa-reply"></i>Reply
                            </a>
                            <div className="review-action">
                              <a href="#"><i className="fa-regular fa-thumbs-up"></i>10</a>
                              <a href="#"><i className="fa-regular fa-thumbs-down"></i>12</a>
                              <a href="#"><i className="fa-regular fa-heart"></i>15</a>
                            </div>
                          </div>
                        </div>
                        <ul>
                          <li>
                            <div className="review-wraps">
                              <div className="review-header-group">
                                <div className="review-widget-header">
                                  <span className="review-widget-img">
                                    <img src="assets/img/profiles/avatar-01.jpg" className="img-fluid" alt="User" />
                                  </span>
                                  <div className="review-design">
                                    <h6>Johnson</h6>
                                    <p>02 Jan 2023</p>
                                  </div>
                                </div>
                                <div className="reviewbox-list-rating">
                                  <p>
                                    <i className="fas fa-star filled"></i>
                                    <i className="fas fa-star filled"></i>
                                    <i className="fas fa-star filled"></i>
                                    <i className="fas fa-star filled"></i>
                                    <i className="fas fa-star filled"></i>
                                    <span> (5.0)</span>
                                  </p>
                                </div>
                              </div>
                              <p>
                                It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and
                                more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                              </p>
                              <div className="review-reply">
                                <a className="btn" href="#">
                                  <i className="fa-solid fa-reply"></i>Reply
                                </a>
                                <div className="review-action">
                                  <a href="#"><i className="fa-regular fa-thumbs-up"></i>10</a>
                                  <a href="#"><i className="fa-regular fa-thumbs-down"></i>12</a>
                                  <a href="#"><i className="fa-regular fa-heart"></i>15</a>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </li>

                    </ul>
                  </div>
                </div> */}

                <div className="review-sec leave-reply-form mb-0">
                  <div className="review-header">
                    <h4>Đánh giá</h4>
                  </div>

                  <div className="review-list-rating">
                    <div className="row">
                      {/* Service Rating */}

                    </div>
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
                                    {files.length > 0 &&
                                      files.map((file, i) => <p key={i}>{file.name}</p>)}
                                  </div>
                                </div>
                              </div>
                              <div className="submit-btn text-end">
                                <button className="btn btn-primary submit-review" type="submit" disabled={loading}>
                                  {loading ? 'Submitting...' : 'Submit Review'}
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
                        <img
                          src={booking.technicianId?.userId.avatar}
                          alt="Technician"
                        />
                      </a>

                    </div>
                    <div className="reviewbox-list-rating">
                      <h5 className="d-flex align-items-center gap-2">
                        <a href="#" className="text-decoration-none text-dark">
                          {booking.technicianId?.userId?.fullName || "Unknown Technician"}
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
                              className={`fas fa-star ${i < Math.round(booking.technicianId?.rates?.ratingAverage || 0) ? "filled" : ""}`}
                            ></i>
                          ))}
                        <span> ({booking.technicianId?.ratingAverage?.toFixed(1) || "0.0"})</span>
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
    </>
  );
};

export default SubmitFeedback;
