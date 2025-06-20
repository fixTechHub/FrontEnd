import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';

function Header() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận đăng xuất',
            text: 'Bạn có chắc chắn muốn đăng xuất không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            await dispatch(logoutThunk());
            Swal.fire({
                title: 'Đã đăng xuất',
                text: 'Hẹn gặp lại bạn!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        }
    };

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
                            <Link to="/" className="navbar-brand logo">
                                <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                            </Link>
                            <Link to="/" className="navbar-brand logo-small">
                                <img src="/img/logo-small-2.png" className="img-fluid" alt="Logo" />
                            </Link>
                        </div>
                        <div className="main-menu-wrapper">
                            <div className="menu-header">
                                <Link to="/" className="menu-logo">
                                    <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                                </Link>
                                <a id="menu_close" className="menu-close" href="javascript:void(0);"> 
                                    <i className="fas fa-times"></i>
                                </a>
                            </div>
                            <ul className="main-nav">
                                <li className="active">
                                    <Link to="/">TRANG CHỦ</Link>
                                </li>

                                <li className="has-submenu">
                                    <a href="#">DANH MỤC <i className="fas fa-chevron-down"></i></a>
                                    <ul className="submenu">
                                        <li><Link to="/services">Dịch vụ</Link></li>
                                        <li><Link to="/checkout/60d0fe4f7f6a7d001c9a6f71/60d0fe4f7f6a7d001c9a6f51">Sản phẩm</Link></li>
                                    </ul>
                                </li>

                                <li>
                                    <Link to="/forum">DIỄN ĐÀN</Link>
                                </li>

                                <li>
                                    <Link to="/support">HỖ TRỢ</Link>
                                </li>

                                {user && (
                                    <li className="has-submenu">
                                        <a href="#">QUẢN LÝ <i className="fas fa-chevron-down"></i></a>
                                        <ul className="submenu">
                                            <li><Link to="/profile">Thông tin cá nhân</Link></li>
                                            <li><Link to="/bookings">Đơn đặt lịch</Link></li>
                                            <li><Link to="/reviews">Đánh giá</Link></li>
                                            {user.role?.name === 'ADMIN' && (
                                                <li><Link to="/admin">Quản trị viên</Link></li>
                                            )}
                                        </ul>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <ul className="nav header-navbar-rht">
                            {!user ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link header-login" to="/register">
                                            <span><i className="fa-regular fa-user"></i></span>Đăng Ký
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link header-reg" to="/login">
                                            <span><i className="fa-solid fa-lock"></i></span>Đăng Nhập
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link header-login" to="/profile">
                                            <span><i className="fa-regular fa-user"></i></span>{user.fullName || 'Tài khoản'}
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <a 
                                            className="nav-link header-reg" 
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLogout();
                                            }}
                                        >
                                            <span><i className="fa-solid fa-sign-out-alt"></i></span>Đăng xuất
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </header>
        </>
    );
}

export default Header;
