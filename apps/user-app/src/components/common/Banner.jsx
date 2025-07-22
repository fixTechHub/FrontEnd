function Banner() {
    return (
        <>
            {/* <section className="banner-section banner-slider">
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
                                    <a href="/booking" className="btn btn-view d-inline-flex align-items-center">
                                        Đặt ngay{" "}
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
            </section> */}

            <section className="banner-section-four">
                <div className="container">
                    <div className="home-banner">
                        <div className="row align-items-center">
                            <div className="col-lg-5" data-aos="fade-down">
                                <div className="banner-content">
                                    <h1>
                                        Explore our <span>Verified & Professional</span> Cars
                                    </h1>
                                    <p>
                                        Modern design sports cruisers for those who crave adventure & grandeur Cars for relaxing
                                        with your loved ones.
                                    </p>
                         
                                </div>
                            </div>

                            {/* <div className="col-lg-7">
                                <div className="banner-image">
                                    <div className="banner-img" data-aos="fade-down">
                                        <div className="amount-icon">
                                            <span className="day-amt">
                                                <p>Starts From</p>
                                                <h6>$650 <span> /day</span></h6>
                                            </span>
                                        </div>
                                        <span className="rent-tag"><i className="bx bxs-circle"></i> Available for Rent</span>
                                        <img src="/img/banner/banner.png" className="img-fluid" alt="Banner Car" />
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Banner Search Form */}
                    <div className="banner-search">
                        <form action="#" className="form-block d-flex align-items-center">
                            <div className="search-input">
                                <div className="input-block">
                                    <div className="input-wrap">
                                        <input
                                            type="text"
                                            style={{color: '#000'}}
                                            className="form-control"
                                            placeholder="Bạn đang cần giúp gì? Hãy nhập mô tả tình trạng bạn gặp phải tại đây !!!"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="search-btn">
                                <button className="btn btn-primary" type="submit">
                                    <i className="bx bx-search-alt"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="banner-bgs">
                    <img src="/img/bg/banner-bg-01.png" className="bg-01 img-fluid" alt="Decorative background" />
                </div>
            </section>
        </>
    )
}

export default Banner;
