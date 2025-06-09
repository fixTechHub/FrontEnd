function Categories() {
    return (
        <>
            <div className="main-wrapper login-body">
                <section className="section popular-car-type">
                    <div className="container">
                        {/* Heading title */}
                        <div className="section-heading" data-aos="fade-down">
                            <h2>Danh Mục Nổi Bật</h2>
                            <p>Giải pháp sửa chữa nhanh chóng và chuyên nghiệp.</p>
                        </div>
                        {/* /Heading title */}
                        <div className="row">
                            <div className="popular-slider-group">
                                <div className="owl-carousel popular-cartype-slider owl-theme">
                                    {/* owl carousel item */}
                                    <div className="listing-owl-item">
                                        <div className="listing-owl-group">
                                            <div className="listing-owl-img">
                                                <img src="/img/cars/mp-vehicle-01.svg" className="img-fluid" alt="Popular Cartypes" />
                                            </div>
                                            <h6>Crossover</h6>
                                            <p>35 Cars</p>
                                        </div>
                                    </div>
                                    {/* /owl carousel item */}

                                    {/* owl carousel item */}
                                    <div className="listing-owl-item">
                                        <div className="listing-owl-group">
                                            <div className="listing-owl-img">
                                                <img src="/img/cars/mp-vehicle-02.svg" className="img-fluid" alt="Popular Cartypes" />
                                            </div>
                                            <h6>Sports Coupe</h6>
                                            <p>45 Cars</p>
                                        </div>
                                    </div>
                                    {/* /owl carousel item */}

                                    {/* owl carousel item */}
                                    <div className="listing-owl-item">
                                        <div className="listing-owl-group">
                                            <div className="listing-owl-img">
                                                <img src="/img/cars/mp-vehicle-03.svg" className="img-fluid" alt="Popular Cartypes" />
                                            </div>
                                            <h6>Sedan</h6>
                                            <p>15 Cars</p>
                                        </div>
                                    </div>
                                    {/* /owl carousel item */}

                                    {/* owl carousel item */}
                                    <div className="listing-owl-item">
                                        <div className="listing-owl-group">
                                            <div className="listing-owl-img">
                                                <img src="/img/cars/mp-vehicle-04.svg" className="img-fluid" alt="Popular Cartypes" />
                                            </div>
                                            <h6>Pickup</h6>
                                            <p>17 Cars</p>
                                        </div>
                                    </div>
                                    {/* /owl carousel item */}

                                    {/* owl carousel item */}
                                    <div className="listing-owl-item">
                                        <div className="listing-owl-group">
                                            <div className="listing-owl-img">
                                                <img src="/img/cars/mp-vehicle-05.svg" className="img-fluid" alt="Popular Cartypes" />
                                            </div>
                                            <h6>Family MPV</h6>
                                            <p>24 Cars</p>
                                        </div>
                                    </div>
                                    {/* /owl carousel item */}
                                </div>
                            </div>
                        </div>
                        {/* View More */}
                        <div className="view-all text-center" data-aos="fade-down" data-aos-anchor-placement="top-bottom">
                            <a href="listing-grid.html" className="btn btn-view d-inline-flex align-items-center">
                                Xem tất cả danh mục
                                <span>
                                    <i className="feather-arrow-right ms-2"></i>
                                </span>
                            </a>
                        </div>
                        {/* View More */}
                    </div>
                </section>
            </div>
        </>
    )
}

export default Categories;
