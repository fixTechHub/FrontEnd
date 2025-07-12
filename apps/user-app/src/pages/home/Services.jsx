import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Services() {
    const navigate = useNavigate();
    const { topBookedServices, status: topServicesStatus } = useSelector((state) => state.booking);
    // console.log('--- TOP SERVICE PAGE ---', topBookedServices);

    return (
        <>
            <section className="section popular-services popular-explore">
                <div className="container">
                    <div className="section-heading" data-aos="fade-down">
                        <h2>Các dịch vụ nổi bật</h2>
                        <p>Here's a list of some of the most popular cars globally, based on sales and customer preferences</p>
                    </div>

                    <div className="tab-content">
                        <div className="tab-pane active" id="Carmazda">
                            <div className="row">
                                {topBookedServices && topBookedServices.map((service) => (
                                    <div className="col-lg-4 col-md-6 col-12" data-aos="fade-down">
                                        <div className="listing-item">
                                            <div className="listing-img">
                                                <a href="listing-details.html">
                                                    <img src="/img/cars/car-03.jpg" className="img-fluid" alt="Audi" />
                                                </a>
                                            </div>

                                            <div className="listing-content">
                                                <div className="listing-features d-flex align-items-end justify-content-between">
                                                    <div className="list-rating">
                                                        <h3 className="listing-title">
                                                            <a href="listing-details.html">{service?.service?.serviceName}</a>
                                                        </h3>
                                                        <div className="list-rating">
                                                            <>Tổng số lần đặt: {service?.bookingCount}</>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="listing-location-details">
                                                    <div className="listing-price">
                                                        <span>
                                                            <i className="feather-map-pin"></i>
                                                        </span>
                                                        Mức Giá
                                                    </div>

                                                    {/* <div className="listing-price">
                                                    <h6>$160 <span>/ Day</span></h6>
                                                </div> */}

                                                    <div className="listing-price">
                                                        <h6><span>Liên hệ</span></h6>
                                                    </div>
                                                </div>

                                                <div className="listing-details-group">
                                                    <p>{service?.service?.description}</p>
                                                </div>

                                                <div className="button-container" >
                                                    <button href="listing-details.html" className="custom-button"
                                                        onClick={() => navigate(`/booking?serviceId=${service?._id}&type=scheduled`)}
                                                    >
                                                        <i className="feather-calendar me-2"></i>
                                                        Đặt Lịch
                                                    </button>
                                                    <button href="contact.html" className="custom-button-secondary"
                                                        onClick={() => navigate(`/booking?serviceId=${service?._id}&type=urgent`)}
                                                    >
                                                        <i className="feather-calendar me-2"></i>
                                                        Đặt Ngay
                                                    </button>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="view-all text-center" data-aos="fade-down" data-aos-anchor-placement="top-bottom">
                                <a className="btn btn-view d-inline-flex align-items-center">
                                    Xem tất cả dịch vụ
                                    <span>
                                        <i className="feather-arrow-right ms-2"></i>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
}

export default Services;
