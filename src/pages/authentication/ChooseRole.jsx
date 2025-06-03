function ChooseRole() {
    return (
        <>
            <div className="main-wrapper login-body">
                <header className="log-header">
                    <a href="/">
                        <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
                    </a>
                </header>

                <section className="testimonial-section mtd-30"> 
                    <div className="container">
                        <div className="section-heading heading-four">
                            <h2>Chọn vai trò của bạn</h2>
                            <p>Bạn muốn sử dụng nền tảng với tư cách nào?</p>
                        </div>

                        <div className="row row-gap-4 justify-content-center">
                            <div className="col-lg-4 col-md-6 d-flex">
                                <div className="testimonial-item testimonial-item-two flex-fill">
                                    <div style={{ opacity: 0.4, marginBottom: 25 }}>
                                        <img src="/img/customer.svg" className="img-fluid" alt="img" />
                                    </div>

                                    <div className="user-info">
                                        <h6>Khách hàng</h6>
                                        <p>Đặt dịch vụ, gửi yêu cầu kỹ thuật.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 col-md-6 d-flex">
                                <div className="testimonial-item testimonial-item-two flex-fill">
                                    <div style={{ opacity: 0.4, marginBottom: 25 }}>
                                        <img src="/img/technician.svg" className="img-fluid" alt="img" />
                                    </div>

                                    <div className="user-info">
                                        <h6>Kỹ thuật viên</h6>
                                        <p>Nhận công việc, hỗ trợ khách hàng.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="view-all-btn text-center aos">
                            <a href="listing-grid.html" className="btn btn-secondary">
                                Xác nhận
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default ChooseRole;
