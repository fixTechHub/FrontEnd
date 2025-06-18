import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";

function Header() {
    const categories = useSelector((state) => state.categories.categories);
    const services = useSelector((state) => state.services.services);
    const categoryStatus = useSelector((state) => state.categories.status);
    const serviceStatus = useSelector((state) => state.services.status);

    // console.log('--- PUBLIC SERVICE ---', services);
    // console.log('--- PUBLIC CATEGORY ---', categories);

    if (categoryStatus === 'loading' || serviceStatus === 'loading')
        return (
            <>
                <Spinner animation="border" variant="warning" />
                <h6>Đang tải dữ liệu</h6>
            </>
        )

    return (
        <>
            <header className="header font-14">
                <div className="container-fluid">
                    <nav className="navbar navbar-expand-lg header-nav">
                        <div className="navbar-header">
                            <a id="mobile_btn" href="javascript:void(0);">
                                <span className="bar-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </a>
                            <a href="index.html" className="navbar-brand logo">
                                <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                            </a>
                            <a href="index.html" className="navbar-brand logo-small">
                                <img src="/img/logo-small-2.png" className="img-fluid" alt="Logo" />
                            </a>
                        </div>
                        <div className="main-menu-wrapper">
                            <div className="menu-header">
                                <a href="index.html" className="menu-logo">
                                    <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                                </a>
                                <a id="menu_close" className="menu-close" href="javascript:void(0);"> <i className="fas fa-times"></i></a>
                            </div>
                            <ul className="main-nav">
                                <li className="has-submenu megamenu active">
                                    <a href="/">TRANG CHỦ </a>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">DANH MỤC <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        {Array.isArray(categories) && categories.map((category) => (
                                            <li className="has-submenu"
                                                key={category._id}>
                                                <a>{category.categoryName}</a>

                                                <ul className="submenu">
                                                    {Array.isArray(services) && services
                                                        .filter(service => service.categoryId === category._id)
                                                        .map((service) => (
                                                            <li key={service._id}><a href="user-dashboard.html">{service.serviceName}</a></li>
                                                        ))}
                                                </ul>
                                            </li>
                                        ))}
                                    </ul>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">DIỄN ĐÀN </a>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">HỖ TRỢ </a>
                                </li>

                                {/* <li className="has-submenu">
                                    <a href="#">GIỚI THIỆU <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><a href="listing-grid.html">Listing Grid</a></li>
                                        <li><a href="listing-list.html">Listing List</a></li>
                                        <li><a href="listing-map.html">Listing With Map</a></li>
                                        <li><a href="listing-details.html">Listing Details</a></li>
                                    </ul>
                                </li> */}
                                <li className="login-link">
                                    <a href="/register">ĐĂNG KÝ</a>
                                </li>
                                <li className="login-link">
                                    <a href="/login">ĐĂNG NHẬP</a>
                                </li>
                            </ul>
                        </div>
                        <ul className="nav header-navbar-rht">
                            <li className="nav-item">
                                <a className="nav-link header-login" href="/register"><span><i className="fa-regular fa-user"></i></span>Đăng Ký</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link header-reg" href="/login"><span><i className="fa-solid fa-lock"></i></span>Đăng Nhập</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header;
