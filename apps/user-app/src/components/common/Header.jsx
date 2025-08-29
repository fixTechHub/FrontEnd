import { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { Link, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { notifications } = useSelector((state) => state.notifications);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            // Close notification dropdown when clicking outside  
            const notificationNative = document.querySelector('.mobile-notification-native');
            if (notificationNative && !notificationNative.contains(event.target)) {
                // Auto-close handled by Notifications component
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    // Mobile menu toggle functionality
    const toggleMobileMenu = () => {
        const newState = !mobileMenuOpen;
        setMobileMenuOpen(newState);
        
        if (newState) {
            // Lock scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = '0';
            document.body.style.left = '0';
            // Mobile browser specific
            document.body.style.webkitOverflowScrolling = 'touch';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.height = '100%';
        } else {
            safeCloseMobileMenu();
        }
    };



    // Universal mobile viewport fix
    useEffect(() => {
        // Fix viewport height issue on all mobile browsers
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setViewportHeight();
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);
        
        return () => {
            window.removeEventListener('resize', setViewportHeight);
            window.removeEventListener('orientationchange', setViewportHeight);
        };
    }, []);

    // Simplified close mechanism - React-safe
    const safeCloseMobileMenu = () => {
        setMobileMenuOpen(false);
        
        // Only reset body styles, let React handle the rest
        setTimeout(() => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.webkitOverflowScrolling = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
        }, 100);
    };

    // Close mobile menu on window resize & escape key
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 991 && mobileMenuOpen) {
                safeCloseMobileMenu();
            }
        };

        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && mobileMenuOpen) {
                safeCloseMobileMenu();
            }
        };

        // Mobile touch/scroll prevention
        const preventScroll = (e) => {
            if (mobileMenuOpen) {
                e.preventDefault();
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Prevent mobile bounce scrolling when menu is open
        if (mobileMenuOpen) {
            document.addEventListener('touchmove', preventScroll, { passive: false });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('keydown', handleEscapeKey);
            document.removeEventListener('touchmove', preventScroll);
        };
    }, [mobileMenuOpen]);

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
            // Lưu role trước khi logout (vì sau logout user sẽ bị clear)
            const userRole = user?.role?.name;
            
            await dispatch(logoutThunk());
            sessionStorage.removeItem('hasWelcomed');

            // Role-based redirect sau logout
            if (userRole === 'TECHNICIAN') {
                // Technician logout -> về login để security tốt hơn
                navigate('/login', { replace: true });
            } else {
                // Customer logout -> về homepage để continue browsing
                navigate('/', { replace: true });
            }

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

    return (
        <>
            {/* Mobile Menu Overlay - Universal Mobile Optimized */}
            {mobileMenuOpen && (
                <div 
                    className="sidebar-overlay opened" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        safeCloseMobileMenu();
                    }}

                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 998,
                        backdropFilter: 'blur(2px)',
                        WebkitBackdropFilter: 'blur(2px)', // Mobile browsers
                        cursor: 'pointer',
                        touchAction: 'none', // Prevent mobile scroll
                        userSelect: 'none',
                        WebkitTouchCallout: 'none', // Mobile browsers
                        WebkitUserSelect: 'none' // Mobile browsers
                    }}
                />
            )}



            <header className="header font-14">
                <div className="container-fluid">
                    <nav className="navbar navbar-expand-lg header-nav">
                        <div className="navbar-header">
                                                    <button 
                                    id="mobile_btn" 
                                    type="button" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleMobileMenu();
                                    }}

                                    style={{
                                        WebkitTouchCallout: 'none',
                                        WebkitUserSelect: 'none',
                                        touchAction: 'manipulation'
                                    }}
                                >
                                <span className="bar-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                        </button>
                            <Link to="/" className="navbar-brand logo">
                                <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                            </Link>
                            <Link to="/" className="navbar-brand logo-small">
                                <img src="/img/logo-small-2.png" className="img-fluid" alt="Logo" />
                            </Link>
                            
                                                        {/* Mobile Notification - Native Style */}
                            {user && (
                                <div className="mobile-notification-native">
                                    <Notifications userId={user._id} />
                        </div>
                            )}
                        </div>
                        <div 
                            className={`main-menu-wrapper ${mobileMenuOpen ? 'menu-opened' : 'menu-closed'}`}
                            style={{
                                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                                WebkitTransform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
                            }}
                        >
                            <div className="menu-header">
                                <Link to="/" className="menu-logo" onClick={safeCloseMobileMenu}>
                                    <img src="/img/logo.png" className="img-fluid" alt="Logo" />
                                </Link>
                                <button 
                                    id="menu_close" 
                                    type="button" 
                                    className="menu-close" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        safeCloseMobileMenu();
                                    }}

                                    style={{
                                        WebkitTouchCallout: 'none',
                                        WebkitUserSelect: 'none',
                                        touchAction: 'manipulation'
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <ul className="main-nav">
                                {/* Ẩn navigation cho kỹ thuật viên */}
                                {user?.role?.name !== 'TECHNICIAN' && (
                                    <>
                                        <li className="has-submenu megamenu">
                                            <Link to="/" onClick={safeCloseMobileMenu}>
                                                <i className="bi bi-house-door"></i>
                                                TRANG CHỦ 
                                            </Link>
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
                                            <Link to="/services" onClick={safeCloseMobileMenu}>
                                                <i className="bi bi-gear"></i>
                                                DỊCH VỤ
                                            </Link>
                                        </li>

                                        <li>
                                            <Link to="/about" onClick={() => {window.scrollTo(0, 0); safeCloseMobileMenu();}}>
                                                <i className="bi bi-info-circle"></i>
                                                VỀ CHÚNG TÔI
                                            </Link>
                                        </li>

                                        <li>
                                            <Link to="/contact" onClick={() => {window.scrollTo(0, 0); safeCloseMobileMenu();}}>
                                                <i className="bi bi-envelope"></i>
                                                LIÊN HỆ
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {/* Mobile Auth & User Menu - Only visible on mobile */}
                                <li className="mobile-divider">
                                    <hr style={{margin: '15px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)'}} />
                                </li>

                                {!user ? (
                                    // Mobile Login/Register buttons
                                    <>
                                        <li className="mobile-auth-item">
                                            <Link to="/register" onClick={safeCloseMobileMenu} className="mobile-auth-link">
                                                <i className="fa-regular fa-user"></i>
                                                <span>Đăng Ký</span>
                                            </Link>
                                        </li>
                                        <li className="mobile-auth-item">
                                            <Link to="/login" onClick={safeCloseMobileMenu} className="mobile-auth-link">
                                                <i className="fa-solid fa-lock"></i>
                                                <span>Đăng Nhập</span>
                                            </Link>
                                        </li>
                                    </>
                                ) : (
                                    // Mobile User Section
                                    <>




                                        {/* Mobile User Menu Items */}
                                        <li className="mobile-menu-item">
                                            <Link to="/profile" onClick={safeCloseMobileMenu} className="mobile-menu-link">
                                                <i className="bi bi-person-circle"></i>
                                                <span>Thông tin cá nhân</span>
                                            </Link>
                                        </li>

                                        {user.role?.name === 'CUSTOMER' && (
                                            <li className="mobile-menu-item">
                                                <Link to="/dashboard" onClick={safeCloseMobileMenu} className="mobile-menu-link">
                                                    <i className="bi bi-calendar-check"></i>
                                                    <span>Bảng điều khiển</span>
                                                </Link>
                                            </li>
                                        )}

                                        {user.role?.name === 'TECHNICIAN' && (
                                            <li className="mobile-menu-item">
                                                <Link to="/technician/dashboard" onClick={safeCloseMobileMenu} className="mobile-menu-link">
                                                    <i className="bi bi-calendar-check"></i>
                                                    <span>Bảng điều khiển</span>
                                                </Link>
                                            </li>
                                        )}

                                        <li className="mobile-menu-item">
                                            <Link to="/reviews" onClick={safeCloseMobileMenu} className="mobile-menu-link">
                                                <i className="bi bi-star-fill"></i>
                                                <span>Đánh giá</span>
                                            </Link>
                                        </li>

                                        {user.role?.name === 'ADMIN' && (
                                            <li className="mobile-menu-item">
                                                <Link to="/admin" onClick={safeCloseMobileMenu} className="mobile-menu-link">
                                                    <i className="bi bi-shield-lock"></i>
                                                    <span>Quản trị viên</span>
                                                </Link>
                                            </li>
                                        )}

                                        <li className="mobile-menu-item mobile-logout">
                                            <div onClick={() => {safeCloseMobileMenu(); handleLogout();}} className="mobile-menu-link logout-link">
                                                <i className="bi bi-box-arrow-right"></i>
                                                <span>Đăng xuất</span>
                                            </div>
                                        </li>
                                    </>
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
                                                    <DropdownItem to="/reviews" onClick={() => setDropdownOpen(false)}>
                                                        <i className="bi bi-star-fill"></i>
                                                        Đánh giá
                                                    </DropdownItem>
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

                        {/* Modern Header Styles - Enhanced UI/UX */}
                        <style jsx>{`
                            /* Global fixes */
                            html, body {
                                overflow-x: hidden;
                                -webkit-overflow-scrolling: touch;
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }

                            /* Keep desktop header unchanged */

                            /* Desktop styles unchanged - only basic desktop notifications */
                            .notifications-wrapper {
                                position: relative;
                            }

                            /* Mobile Safe Area Support */
                            @supports(padding: max(0px)) {
                                .main-menu-wrapper {
                                    padding-top: env(safe-area-inset-top);
                                    padding-bottom: env(safe-area-inset-bottom);
                                }
                            }

                            .main-menu-wrapper {
                                transition: all 0.3s ease;
                            }

                            @media (max-width: 991.96px) {
                                .main-menu-wrapper {
                                    transform: translateX(-100%) !important;
                                    -webkit-transform: translateX(-100%) !important;
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 280px;
                                    max-width: 280px;
                                    height: 100vh;
                                    height: calc(var(--vh, 1vh) * 100);
                                    height: -webkit-fill-available;
                                    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
                                    backdrop-filter: blur(20px);
                                    -webkit-backdrop-filter: blur(20px);
                                    z-index: 999;
                                    overflow-y: auto;
                                    -webkit-overflow-scrolling: touch;
                                    box-shadow: 0 0 40px rgba(0, 0, 0, 0.12);
                                    border-right: 1px solid rgba(255, 166, 51, 0.1);
                                    -webkit-touch-callout: none;
                                    -webkit-user-select: none;
                                    touch-action: pan-y;
                                    visibility: hidden;
                                    opacity: 0;
                                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                }

                                .main-menu-wrapper.menu-opened {
                                    transform: translateX(0) !important;
                                    -webkit-transform: translateX(0) !important;
                                    visibility: visible !important;
                                    opacity: 1 !important;
                                }

                                .main-menu-wrapper.menu-closed {
                                    transform: translateX(-100%) !important;
                                    -webkit-transform: translateX(-100%) !important;
                                    visibility: hidden !important;
                                    opacity: 0 !important;
                                }

                                body.menu-opened {
                                    overflow: hidden !important;
                                    -webkit-overflow-scrolling: none !important;
                                    position: fixed !important;
                                    width: 100% !important;
                                    height: 100% !important;
                                    top: 0 !important;
                                    left: 0 !important;
                                }

                                html.menu-opened {
                                    overflow: hidden !important;
                                    height: 100% !important;
                                }

                                /* Modern mobile navigation styling */
                                .main-nav {
                                    padding: 32px 0;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }

                                .main-nav > li {
                                    margin: 8px 20px;
                                    border-radius: 16px;
                                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    width: calc(100% - 40px);
                                    max-width: 240px;
                                    position: relative;
                                    overflow: hidden;
                                    background: rgba(255, 255, 255, 0.6);
                                    border: 1px solid rgba(255, 166, 51, 0.1);
                                    backdrop-filter: blur(10px);
                                }

                                .main-nav > li::before {
                                    content: '';
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 6px;
                                    height: 100%;
                                    background: linear-gradient(135deg, #FFA633 0%, #ff8c1a 50%, #FFA633 100%);
                                    transform: scaleY(0);
                                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    border-radius: 0 8px 8px 0;
                                    box-shadow: 2px 0 8px rgba(255, 166, 51, 0.3);
                                }

                                .main-nav > li:hover::before {
                                    transform: scaleY(1);
                                }

                                .main-nav > li:hover {
                                    background: linear-gradient(135deg, rgba(255, 166, 51, 0.12) 0%, rgba(255, 140, 26, 0.08) 50%, rgba(255, 166, 51, 0.05) 100%);
                                    transform: translateX(8px) translateY(-2px);
                                    box-shadow: 0 8px 24px rgba(255, 166, 51, 0.25);
                                    border-color: rgba(255, 166, 51, 0.3);
                                }

                                .main-nav > li a {
                                    color: #111827 !important;
                                    padding: 16px 24px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: flex-start;
                                    gap: 12px;
                                    font-weight: 700;
                                    font-size: 16px;
                                    line-height: 1.2;
                                    letter-spacing: 0.5px;
                                    transition: all 0.3s ease;
                                    position: relative;
                                    border-radius: 10px;
                                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                                    min-height: 56px;
                                }
                                
                                .main-nav > li a i {
                                    font-size: 18px;
                                    width: 20px;
                                    height: 20px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    flex-shrink: 0;
                                    line-height: 1;
                                    vertical-align: middle;
                                    margin-top: -1px;
                                }

                                .main-nav > li a:hover {
                                    color: #FFA633 !important;
                                    background: transparent;
                                    padding-left: 30px;
                                    font-weight: 600;
                                }

                                /* Override any external active states */
                                .main-nav > li.active a,
                                .main-nav > li a.active {
                                    color: #374151 !important;
                                    background: transparent !important;
                                    font-weight: 600 !important;
                                }

                                .main-nav > li.active a:hover,
                                .main-nav > li a.active:hover {
                                    color: #FFA633 !important;
                                }

                                /* Modern Mobile Auth Styles */
                                .mobile-divider {
                                    list-style: none;
                                    margin: 24px 0;
                                }

                                .mobile-divider hr {
                                    margin: 0 25px;
                                    border: none;
                                    height: 2px;
                                    background: linear-gradient(90deg, transparent, rgba(255, 166, 51, 0.3), rgba(255, 140, 26, 0.3), transparent);
                                    border-radius: 2px;
                                }

                                .mobile-auth-item {
                                    margin: 12px 20px;
                                }

                                .mobile-auth-link {
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                    padding: 18px 28px;
                                    color: #000000 !important;
                                    text-decoration: none;
                                    font-weight: 700;
                                    font-size: 15px;
                                    border-radius: 16px;
                                    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                                    border: 2px solid rgba(255, 166, 51, 0.3);
                                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                                    position: relative;
                                    overflow: hidden;
                                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                }

                                .mobile-auth-link::before {
                                    content: '';
                                    position: absolute;
                                    top: 0;
                                    left: -100%;
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                                    transition: left 0.5s ease;
                                }

                                .mobile-auth-link:hover::before {
                                    left: 100%;
                                }

                                .mobile-auth-link:hover {
                                    background: linear-gradient(135deg, #FFA633 0%, #ff8c1a 100%);
                                    border-color: #FFA633;
                                    color: #ffffff !important;
                                    transform: translateY(-2px) scale(1.02);
                                    box-shadow: 0 8px 25px rgba(255, 166, 51, 0.4);
                                }

                                .mobile-auth-link i {
                                    font-size: 18px;
                                    width: 20px;
                                    text-align: center;
                                    transition: transform 0.3s ease;
                                }

                                .mobile-auth-link:hover i {
                                    transform: scale(1.2) rotate(5deg);
                                }

                                /* Mobile User Profile - Clean */
                                .mobile-user-profile {
                                    background: #ffffff;
                                    border: 1px solid rgba(0, 0, 0, 0.08);
                                    margin: 15px 20px;
                                    border-radius: 12px;
                                    overflow: hidden;
                                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
                                }

                                .mobile-user-info {
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    padding: 16px;
                                }

                                .mobile-avatar {
                                    position: relative;
                                }

                                .mobile-user-details {
                                    display: flex;
                                    flex-direction: column;
                                    gap: 4px;
                                    flex: 1;
                                }

                                .mobile-user-name {
                                    color: #000000;
                                    font-weight: 800;
                                    font-size: 17px;
                                    margin: 0;
                                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                                }

                                .mobile-user-role {
                                    color: #1f2937;
                                    font-size: 14px;
                                    font-weight: 700;
                                    margin: 0;
                                    padding: 4px 12px;
                                    background: rgba(255, 166, 51, 0.15);
                                    border-radius: 8px;
                                    display: inline-block;
                                    width: fit-content;
                                    border: 1px solid rgba(255, 166, 51, 0.3);
                                }

                                /* Revolutionary Notification Badge */
                                .mobile-notification-badge {
                                    margin: 12px 20px;
                                    background: linear-gradient(135deg, #FFA633 0%, #ff8c1a 100%);
                                    border-radius: 20px;
                                    padding: 16px 20px;
                                    box-shadow: 0 8px 24px rgba(255, 166, 51, 0.3);
                                    border: 2px solid rgba(255, 255, 255, 0.2);
                                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                    cursor: pointer;
                                }

                                .mobile-notification-badge:hover {
                                    transform: translateY(-2px) scale(1.02);
                                    box-shadow: 0 12px 32px rgba(255, 166, 51, 0.4);
                                }

                                .notification-counter-container {
                                    display: flex;
                                    align-items: center;
                                    gap: 12px;
                                    position: relative;
                                }

                                .notification-bell {
                                    font-size: 20px;
                                    color: #ffffff;
                                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                    animation: bellPulse 2s infinite;
                                }

                                @keyframes bellPulse {
                                    0%, 100% { transform: scale(1); }
                                    50% { transform: scale(1.1); }
                                }

                                .notification-counter {
                                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                                    color: #ffffff;
                                    font-size: 14px;
                                    font-weight: 800;
                                    min-width: 28px;
                                    height: 28px;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
                                    border: 2px solid #ffffff;
                                    animation: counterPulse 1.5s infinite;
                                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                                }

                                @keyframes counterPulse {
                                    0%, 100% { transform: scale(1); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); }
                                    50% { transform: scale(1.15); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.6); }
                                }

                                .notification-text {
                                    color: #ffffff;
                                    font-weight: 700;
                                    font-size: 16px;
                                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                    letter-spacing: 0.5px;
                                }

                                /* Notification Modal Styles */
                                .notification-modal-overlay {
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    width: 100%;
                                    height: 100%;
                                    background: rgba(0, 0, 0, 0.6);
                                    backdrop-filter: blur(8px);
                                    z-index: 1060;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    padding: 20px;
                                    animation: modalFadeIn 0.3s ease;
                                }

                                @keyframes modalFadeIn {
                                    from { opacity: 0; }
                                    to { opacity: 1; }
                                }

                                .notification-modal {
                                    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                                    border-radius: 20px;
                                    width: 100%;
                                    max-width: 400px;
                                    max-height: 80vh;
                                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                                    border: 1px solid rgba(255, 166, 51, 0.2);
                                    overflow: hidden;
                                    animation: modalSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                }

                                @keyframes modalSlideUp {
                                    from {
                                        opacity: 0;
                                        transform: translateY(30px) scale(0.95);
                                    }
                                    to {
                                        opacity: 1;
                                        transform: translateY(0) scale(1);
                                    }
                                }

                                .notification-modal-header {
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 20px 24px;
                                    background: linear-gradient(135deg, #FFA633 0%, #ff8c1a 100%);
                                    color: #ffffff;
                                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                                }

                                .notification-modal-header h3 {
                                    margin: 0;
                                    font-size: 18px;
                                    font-weight: 700;
                                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                                }

                                .close-modal-btn {
                                    background: rgba(255, 255, 255, 0.2);
                                    border: none;
                                    color: #ffffff;
                                    width: 32px;
                                    height: 32px;
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    cursor: pointer;
                                    transition: all 0.2s ease;
                                    backdrop-filter: blur(10px);
                                }

                                .close-modal-btn:hover {
                                    background: rgba(255, 255, 255, 0.3);
                                    transform: scale(1.1);
                                }

                                .notification-modal-content {
                                    max-height: 60vh;
                                    overflow-y: auto;
                                    -webkit-overflow-scrolling: touch;
                                }

                                .notification-modal-content::-webkit-scrollbar {
                                    width: 6px;
                                }

                                .notification-modal-content::-webkit-scrollbar-track {
                                    background: rgba(0, 0, 0, 0.05);
                                    border-radius: 3px;
                                }

                                .notification-modal-content::-webkit-scrollbar-thumb {
                                    background: linear-gradient(135deg, #FFA633 0%, #ff8c1a 100%);
                                    border-radius: 3px;
                                }

                                .notification-modal-content::-webkit-scrollbar-thumb:hover {
                                    background: linear-gradient(135deg, #ff8c1a 0%, #FFA633 100%);
                                }

                                /* Mobile Notification Positioning - Prevent Overflow */
                                .mobile-notification-native {
                                    position: absolute;
                                    right: 15px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    z-index: 1000;
                                }

                                /* Fix Mobile Dropdown Overflow */
                                .noti-wrapper .dropdown-menu.notifications {
                                    position: absolute !important;
                                    top: 45px !important;
                                    right: 0 !important;
                                    left: auto !important;
                                    width: 350px !important;
                                    max-width: calc(100vw - 20px) !important;
                                    max-height: 400px !important;
                                    overflow-y: auto !important;
                                    transform: translateX(0) !important;
                                    margin: 0 !important;
                                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
                                    border: none !important;
                                    border-radius: 12px !important;
                                }
                                
                                /* Mobile specific adjustments */
                                @media (max-width: 768px) {
                                    .noti-wrapper .dropdown-menu.notifications {
                                        right: -10px !important;
                                        width: 320px !important;
                                        max-width: calc(100vw - 30px) !important;
                                    }
                                    
                                    .noti-wrapper .noti-content {
                                        width: 100% !important;
                                        max-height: 350px !important;
                                    }
                                    
                                    .noti-wrapper .notification-message {
                                        padding: 12px 15px !important;
                                        word-wrap: break-word !important;
                                        overflow-wrap: break-word !important;
                                    }
                                    
                                    .noti-wrapper .noti-details {
                                        white-space: normal !important;
                                        word-wrap: break-word !important;
                                        overflow-wrap: break-word !important;
                                        line-height: 1.4 !important;
                                    }
                                    
                                    .noti-wrapper .noti-title {
                                        white-space: normal !important;
                                        word-wrap: break-word !important;
                                        overflow-wrap: break-word !important;
                                        display: block !important;
                                    }
                                }

                                /* Ensure dropdown fits on small screens */
                                @media (max-width: 480px) {
                                    .noti-wrapper .dropdown-menu.notifications {
                                        right: -15px !important;
                                        width: 280px !important;
                                        max-width: calc(100vw - 40px) !important;
                                    }
                                }
                                
                                @media (max-width: 320px) {
                                    .noti-wrapper .dropdown-menu.notifications {
                                        width: 250px !important;
                                        right: -20px !important;
                                        max-width: calc(100vw - 50px) !important;
                                    }
                                }









                                /* All custom styles removed - using desktop notification styles */

                                /* Mobile Menu Items - Clean */
                                .mobile-menu-item {
                                    margin: 4px 20px;
                                }

                                .mobile-menu-link {
                                    display: flex;
                                    align-items: center;
                                    gap: 14px;
                                    padding: 16px 20px;
                                    color: #000000 !important;
                                    text-decoration: none;
                                    font-weight: 700;
                                    font-size: 15px;
                                    border-radius: 12px;
                                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                    cursor: pointer;
                                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%);
                                    border: 1px solid rgba(0, 0, 0, 0.05);
                                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                                }

                                .mobile-menu-link:hover {
                                    background: linear-gradient(135deg, rgba(255, 166, 51, 0.1) 0%, rgba(255, 140, 26, 0.05) 100%);
                                    color: #FFA633 !important;
                                    transform: translateX(4px) translateY(-1px);
                                    box-shadow: 0 4px 12px rgba(255, 166, 51, 0.2);
                                    border-color: rgba(255, 166, 51, 0.2);
                                }

                                .mobile-menu-link i {
                                    font-size: 16px;
                                    width: 20px;
                                    text-align: center;
                                }

                                /* Logout Button - Clean */
                                .mobile-logout {
                                    margin: 20px;
                                    border-bottom: none;
                                }

                                .mobile-logout .logout-link {
                                    background: #ffffff;
                                    border: 1px solid #dc3545;
                                    margin: 0;
                                    border-radius: 6px;
                                    justify-content: center;
                                    font-weight: 600;
                                    font-size: 14px;
                                    padding: 12px 16px;
                                    color: #dc3545 !important;
                                }

                                .mobile-logout .logout-link:hover {
                                    background: #dc3545;
                                    color: #ffffff !important;
                                }

                                .menu-header {
                                    display: flex;
                                    align-items: center;
                                    justify-content: space-between;
                                    padding: 16px 20px;
                                    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
                                    background: #ffffff;
                                }

                                .menu-close {
                                    color: #6b7280;
                                    font-size: 20px;
                                    background: transparent;
                                    border: none;
                                    width: 36px;
                                    height: 36px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 6px;
                                    transition: all 0.2s ease;
                                }

                                .menu-close:hover {
                                    color: #374151;
                                    background: rgba(0, 0, 0, 0.05);
                                }

                                #mobile_btn {
                                    display: block;
                                    cursor: pointer;
                                    padding: 6px;
                                    border: none;
                                    background: transparent;
                                    transition: all 0.2s ease;
                                }

                                #mobile_btn:hover .bar-icon span {
                                    background-color: #FFA633;
                                }
                            }

                            @media (min-width: 992px) {
                                .main-menu-wrapper {
                                    position: relative;
                                    transform: none;
                                    width: auto;
                                    height: auto;
                                    background: transparent;
                                    overflow: visible;
                                }

                                .menu-header {
                                    display: none;
                                }

                                #mobile_btn {
                                    display: none;
                                }

                                /* Hide all mobile-only elements on desktop */
                                .mobile-divider,
                                .mobile-auth-item,
                                .mobile-user-profile,
                                .mobile-notifications,
                                .mobile-menu-item {
                                    display: none !important;
                                }
                            }

                            /* Desktop header navbar - ensure normal behavior */
                            @media (min-width: 992px) {
                                .header-navbar-rht {
                                    display: flex !important;
                                }
                                
                                .header-navbar-rht .nav-item {
                                    display: flex;
                                }
                            }

                            /* Hide desktop header navbar on mobile and tablet */
                            @media (max-width: 991.96px) {
                                .header-navbar-rht {
                                    display: none !important;
                                }
                            }
                            
                            @media (min-width: 992px) {
                                /* Hide all mobile-only elements */
                                .mobile-divider,
                                .mobile-auth-item,
                                .mobile-user-profile,
                                .mobile-notification-badge,
                                .mobile-menu-item,
                                .mobile-notification-native {
                                    display: none !important;
                                }
                                .header-navbar-rht {
                                    display: flex !important;
                                }
                                
                                /* Reset any mobile styles that might affect desktop */
                                .main-menu-wrapper {
                                    position: relative !important;
                                    transform: none !important;
                                    -webkit-transform: none !important;
                                    width: auto !important;
                                    max-width: none !important;
                                    height: auto !important;
                                    background: none !important;
                                    backdrop-filter: none !important;
                                    -webkit-backdrop-filter: none !important;
                                    box-shadow: none !important;
                                    border: none !important;
                                    visibility: visible !important;
                                    opacity: 1 !important;
                                    transition: none !important;
                                }
                                
                                .main-nav {
                                    padding: 0 !important;
                                }
                                
                                .main-nav > li {
                                    margin: 0 !important;
                                    border-radius: 0 !important;
                                    background: none !important;
                                    transform: none !important;
                                    box-shadow: none !important;
                                    border-bottom: none !important;
                                    position: relative !important;
                                    overflow: visible !important;
                                }
                                
                                .main-nav > li::before {
                                    display: none !important;
                                }
                                
                                .main-nav > li a {
                                    padding: 15px 20px !important;
                                    color: inherit !important;
                                    font-weight: 500 !important;
                                    font-size: 14px !important;
                                    letter-spacing: normal !important;
                                    border-radius: 0 !important;
                                    background: none !important;
                                    text-shadow: none !important;
                                    transition: color 0.3s ease !important;
                                    display: block !important;
                                    line-height: normal !important;
                                    min-height: auto !important;
                                }
                                
                                .main-nav > li a i {
                                    display: none !important;
                                }
                                
                                .main-nav > li a:hover {
                                    color: #FFA633 !important;
                                    background: none !important;
                                    padding: 15px 20px !important;
                                    transform: none !important;
                                }
                            }

                            /* Mobile fixes + Large screen mobile devices */
                            @media (max-width: 575.96px) {
                                .navbar-brand.logo img {
                                    max-width: 120px;
                                }

                                .container-fluid {
                                    padding-left: 15px;
                                    padding-right: 15px;
                                }


                            }

                            /* Large mobile devices (like iPhone 14 Pro Max, Samsung S23 Ultra, etc.) */
                            @media only screen and (max-width: 480px) and (min-height: 800px) {
                                .main-menu-wrapper {
                                    height: calc(100vh - env(safe-area-inset-bottom, 0px)) !important;
                                    padding-top: env(safe-area-inset-top, 20px) !important;
                                }
                            }

                            /* Fix sidebar overlay z-index */
                            .sidebar-overlay {
                                position: fixed !important;
                                top: 0 !important;
                                left: 0 !important;
                                width: 100vw !important;
                                height: 100vh !important;
                                background-color: rgba(0,0,0,0.5) !important;
                                z-index: 998 !important;
                            }
                        `}</style>

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