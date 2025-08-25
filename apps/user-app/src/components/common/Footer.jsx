import { 
  RiToolsFill as Wrench,
  RiShieldCheckFill as Shield,
  RiPhoneFill as Phone,
  RiMailFill as Mail,
  RiMapPinFill as MapPin,
  RiTimeFill as Clock,
  RiFacebookFill as Facebook,
  RiInstagramFill as Instagram,
  RiTwitterFill as Twitter,
  RiYoutubeFill as Youtube,
  RiStarFill as Star,
  RiCustomerServiceFill as Support,
  RiTrophyFill as Trophy,
  RiHome2Fill as Home,
  RiTempColdFill as Refrigerator,
  RiTvFill as Tv,
  RiSettings4Fill as WashingMachine
} from "react-icons/ri";

function Footer() {
    return (
        <footer className="nhp-footer-modern">
            {/* Footer Background Decorations */}
            <div className="nhp-footer-bg-decorations">
                <div className="nhp-footer-bg-circle nhp-footer-bg-circle-1"></div>
                <div className="nhp-footer-bg-circle nhp-footer-bg-circle-2"></div>
                <div className="nhp-footer-bg-gradient"></div>
            </div>



            {/* Footer Main */}
            <div className="nhp-footer-main">
                <div className="nhp-container">
                    <div className="nhp-footer-grid">
                        {/* Company Info */}
                        <div className="nhp-footer-column nhp-footer-brand">
                            <div className="nhp-footer-logo">
                                <div className="nhp-logo-icon">
                                    <Wrench size={32} />
                                </div>
                                <div className="nhp-logo-text">
                                    <h4>FixTech</h4>
                                    <span>Nền tảng kết nối thợ sửa chữa</span>
                                </div>
                            </div>
                            <p className="nhp-footer-description">
                                Nền tảng kết nối khách hàng với các thợ sửa chữa thiết bị gia dụng 
                                có kinh nghiệm tại TP. Đà Nẵng. Đặt lịch dễ dàng, tìm thợ nhanh chóng.
                            </p>
                            <div className="nhp-footer-stats">
                                <div className="nhp-stat-item">
                                    <Trophy size={16} />
                                    <span>50+ kết nối thành công</span>
                                </div>
                                <div className="nhp-stat-item">
                                    <Shield size={16} />
                                    <span>Thợ đã xác thực</span>
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="nhp-footer-column">
                            <h5 className="nhp-footer-title">
                                <Home size={20} />
                                Thiết bị hỗ trợ
                            </h5>
                            <ul className="nhp-footer-links">
                                <li>
                                    <Refrigerator size={16} />
                                    <span>Tủ lạnh & Tủ đông</span>
                                </li>
                                <li>
                                    <WashingMachine size={16} />
                                    <span>Máy giặt & Máy sấy</span>
                                </li>
                                <li>
                                    <Tv size={16} />
                                    <span>TV & Điện tử</span>
                                </li>
                                <li>
                                    <Wrench size={16} />
                                    <span>Thiết bị gia dụng khác</span>
                                </li>
                                <li>
                                    <Support size={16} />
                                    <span>Lò vi sóng & khác</span>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="nhp-footer-column">
                            <h5 className="nhp-footer-title">
                                <Support size={20} />
                                Tính năng chính
                            </h5>
                            <ul className="nhp-footer-links">
                                <li>
                                    <span>Đặt lịch tự động</span>
                                </li>
                                <li>
                                    <span>Tìm thợ gần nhà</span>
                                </li>
                                <li>
                                    <span>Kết nối nhanh chóng</span>
                                </li>
                                <li>
                                    <span>Thông tin minh bạch</span>
                                </li>
                                <li>
                                    <span>Hỗ trợ trực tuyến</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="nhp-footer-column">
                            <h5 className="nhp-footer-title">
                                <Phone size={20} />
                                Liên hệ
                            </h5>
                            <div className="nhp-footer-contact">
                                <div className="nhp-contact-item">
                                    <Phone size={18} />
                                    <div className="nhp-contact-info">
                                        <span className="nhp-contact-label">Hotline hỗ trợ</span>
                                        <a href="tel:+84236123456">0913 978 802</a>
                                    </div>
                                </div>
                                <div className="nhp-contact-item">
                                    <Mail size={18} />
                                    <div className="nhp-contact-info">
                                        <span className="nhp-contact-label">Email hỗ trợ</span>
                                        <a href="mailto:support@fixtech.vn">support@fixtech.vn</a>
                                    </div>
                                </div>
                                <div className="nhp-contact-item">
                                    <MapPin size={18} />
                                    <div className="nhp-contact-info">
                                        <span className="nhp-contact-label">Khu vực hỗ trợ</span>
                                        <span>6 quận chính TP. Đà Nẵng</span>
                                    </div>
                                </div>
                                <div className="nhp-contact-item">
                                    <Clock size={18} />
                                    <div className="nhp-contact-info">
                                        <span className="nhp-contact-label">Giờ hỗ trợ</span>
                                        <span>8:00 - 20:00 thứ 2-7</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="nhp-footer-bottom">
                <div className="nhp-container">
                    <div className="nhp-footer-bottom-content" style={{ justifyContent: 'center' }}>
                        <div className="nhp-footer-copyright">
                            <p>© 2024 <strong>FixTech</strong> - Nền tảng kết nối thợ sửa chữa thiết bị gia dụng tại Đà Nẵng.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="nhp-footer-floating-elements">
                <div className="nhp-float-wrench">
                    <Wrench size={24} />
                </div>
                <div className="nhp-float-star">
                    <Star size={20} />
                </div>
                <div className="nhp-float-shield">
                    <Shield size={18} />
                </div>
            </div>
        </footer>
    )
}

export default Footer;
