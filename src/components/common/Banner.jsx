function Banner() {
    return (
        <>
            <section className="banner-section banner-slider">
                <div className="container">
                    <div className="home-banner">
                        <div className="row align-items-center">
                            <div className="col-lg-6" data-aos="fade-down">
                                <p className="explore-text">
                                    <span>
                                        <i className="fa-solid fa-thumbs-up me-2"></i>
                                    </span>
                                    Nền tảng kết nối thợ sửa chữa đáng tin cậy hàng đầu
                                </p>
                                <h1>
                                    <span>Kết Nối Kỹ Thuật Viên</span> <br />
                                    Phù Hợp Nhất Với Nhu Cầu Của Bạn
                                </h1>
                                <p>
                                    Trải nghiệm sự tiện lợi, chuyên nghiệp và nhanh chóng với đội ngũ kỹ thuật viên uy tín. 
                                    Dù bạn cần sửa điện, nước, điện lạnh hay các thiết bị gia đình khác – chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.
                                </p>
                                <div className="view-all">
                                    <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
                                        Xem dịch vụ{" "}
                                        <span>
                                            <i className="feather-arrow-right ms-2"></i>
                                        </span>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6" >
                                <div className="banner-imgs" data-aos="fade-down">
                                    <img src="/img/man-right.png" className="img-fluid aos" alt="bannerimage" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Banner;
