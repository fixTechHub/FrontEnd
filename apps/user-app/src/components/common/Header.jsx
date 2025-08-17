import { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../../features/auth/authSlice';
import Swal from 'sweetalert2';
import styled from '@emotion/styled';
import Notifications from './Notifications';
import { FaUserCircle } from 'react-icons/fa';
// Styled-components for the dropdown
const UserMenuWrapper = styled.div`
    position: relative;
    cursor: pointer;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 10px;
    border-radius: 50px;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f0f0;
    }
`;

const Avatar = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
`;

const UserName = styled.span`
    font-weight: 500;
    color: #333;
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 110%;
    right: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    width: 200px;
    z-index: 1000;
    overflow: hidden;
    padding: 8px 0;
`;

const DropdownItem = styled(Link)`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #333;
    font-size: 15px;
    text-decoration: none;

    &:hover {
        background-color: #f5f5f5;
        color: #111;
    }
`;

const DropdownItemButton = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #333;
    font-size: 15px;
    cursor: pointer;

    &:hover {
        background-color: #f5f5f5;
        color: #111;
    }
`;

const Divider = styled.hr`
    margin: 8px 0;
    border: none;
    border-top: 1px solid #e0e0e0;
`;


function Header() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const categories = useSelector((state) => state.categories.categories);
    const services = useSelector((state) => state.services.services);
    const categoryStatus = useSelector((state) => state.categories.status);
    const serviceStatus = useSelector((state) => state.services.status);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleLogout = async () => {
        setDropdownOpen(false);
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

            sessionStorage.removeItem('hasWelcomed');

            Swal.fire({
                title: 'Đã đăng xuất',
                text: 'Hẹn gặp lại bạn!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                position: 'bottom-end',
                toast: true
            });
        }
    };

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
                                <li className="has-submenu megamenu">
                                    <Link to="/">TRANG CHỦ </Link>
                                </li>

                                {/* <li className="has-submenu">
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
                                </li> */}

                                <li>
                                    <Link to="/services">DỊCH VỤ</Link>
                                </li>

                                <li>
                                    <Link to="/about" onClick={() => window.scrollTo(0, 0)}>VỀ CHÚNG TÔI</Link>
                                </li>

                                <li>
                                    <Link to="/contact" onClick={() => window.scrollTo(0, 0)}>LIÊN HỆ</Link>
                                </li>
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
                                    <li className="nav-item"> <Notifications userId={user._id} /></li>
                                    <li className="nav-item" ref={menuRef}>
                                        <UserMenuWrapper onClick={() => setDropdownOpen(!dropdownOpen)}>
                                            <UserInfo>
                                                {user.avatar && !avatarError ? (
                                                    <Avatar src={user.avatar} alt="Avatar" onError={() => setAvatarError(true)} />
                                                ) : (
                                                    <FaUserCircle size={36} color="#000" />
                                                )}
                                                <UserName>{user.fullName || 'Tài khoản'}</UserName>
                                                <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '12px' }}></i>
                                            </UserInfo>
                                            {dropdownOpen && (
                                                <DropdownMenu>
                                                    <DropdownItem to="/profile" onClick={() => setDropdownOpen(false)}>
                                                        <i className="bi bi-person-circle"></i>
                                                        Thông tin cá nhân
                                                    </DropdownItem>
                                                    {/* <DropdownItem to="/bookings" onClick={() => setDropdownOpen(false)}>
                                                        <i className="bi bi-calendar-check"></i>
                                                        Đơn đặt lịch
                                                    </DropdownItem> */}
                                                    {user.role.name === 'CUSTOMER' && (
                                                        <DropdownItem to="/dashboard" onClick={() => setDropdownOpen(false)}>
                                                            <i className="bi bi-calendar-check"></i>
                                                            Bảng điều khiển
                                                        </DropdownItem>
                                                    )}
                                                    {user.role.name === 'TECHNICIAN' && (
                                                        <DropdownItem to="/technician/dashboard" onClick={() => setDropdownOpen(false)}>
                                                            <i className="bi bi-calendar-check"></i>
                                                            Bảng điều khiển
                                                        </DropdownItem>
                                                    )

                                                    }
                                                    {/* <DropdownItem to="/reviews" onClick={() => setDropdownOpen(false)}>
                                                        <i className="bi bi-star-fill"></i>
                                                        Đánh giá
                                                    </DropdownItem> */}
                                                    {user.role?.name === 'ADMIN' && (
                                                        <DropdownItem to="/admin" onClick={() => setDropdownOpen(false)}>
                                                            <i className="bi bi-shield-lock"></i>
                                                            Quản trị viên
                                                        </DropdownItem>
                                                    )}
                                                    <Divider />
                                                    <DropdownItemButton onClick={handleLogout}>
                                                        <i className="bi bi-box-arrow-right"></i>
                                                        Đăng xuất
                                                    </DropdownItemButton>
                                                </DropdownMenu>
                                            )}
                                        </UserMenuWrapper>
                                    </li>
                                </>
                            )}
                        </ul>
                        {/* <ul className="nav header-navbar-rht">
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
                                    <li className="nav-item"><Notifications userId={user._id} /></li>
                                    <li className="nav-item" ref={menuRef}>
                                        <UserMenuWrapper onClick={() => setDropdownOpen(!dropdownOpen)}>
                                            <UserInfo>
                                                <Avatar src={user.avatar || '/img/profiles/avatar-01.jpg'} alt="Avatar" />
                                                <UserName>{user.fullName || 'Tài khoản'}</UserName>
                                                <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '12px' }}></i>
                                            </UserInfo>
                                            {dropdownOpen && (
                                                <DropdownMenu>
                                                    {/* Menu khác nhau theo role */}
                                                    {/* {user?.role?.name === 'technician' ? (
                                                        <>
                                                            <DropdownItem to="/technician/dashboard" onClick={() => setDropdownOpen(false)}>
                                                                <i className="bi bi-speedometer2"></i>
                                                                Bảng điều khiển
                                                            </DropdownItem>
                                                            <DropdownItem to="/technician/profile" onClick={() => setDropdownOpen(false)}>
                                                                <i className="bi bi-person-fill"></i>
                                                                Hồ sơ kỹ thuật viên
                                                            </DropdownItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownItem to="/dashboard" onClick={() => setDropdownOpen(false)}>
                                                                <i className="bi bi-speedometer2"></i>
                                                                Bảng điều khiển
                                                            </DropdownItem>
                                                            <DropdownItem to="/profile" onClick={() => setDropdownOpen(false)}>
                                                                <i className="bi bi-gear-fill"></i>
                                                                Cài đặt
                                                            </DropdownItem>
                                                        </>
                                                    )}

                                                    <Divider />
                                                    <DropdownItemButton onClick={handleLogout}>
                                                        <i className="bi bi-box-arrow-right"></i>
                                                        Đăng xuất
                                                    </DropdownItemButton>
                                                </DropdownMenu>
                                            )}
                                        </UserMenuWrapper>
                                    </li>
                                </>
                            )}
                        </ul> */} 
                    </nav>
                </div>
            </header>
        </>
    );
}
export default Header;