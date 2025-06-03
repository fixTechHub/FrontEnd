function LogInPage() {
    return (
        <>
            <div className="main-wrapper login-body">
                <header className="log-header">
                    <a href="/">
                        <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
                    </a>
                </header>

                <div className="login-wrapper">
                    <div className="loginbox">
                        <div className="login-auth">
                            <div className="login-auth-wrap">
                                <h3>Đăng Nhập</h3>
                                <p className="account-subtitle">Chào mừng bạn trở lại.</p>

                                <form action="/login">
                                    <div className="input-block">
                                        <label className="form-label">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <input type="email" className="form-control" placeholder="" />
                                    </div>
                                    <div className="input-block">
                                        <label className="form-label">
                                            Mật khẩu <span className="text-danger">*</span>
                                        </label>
                                        <div className="pass-group">
                                            <input type="password" className="form-control pass-input" placeholder="" />
                                            <span className="fas fa-eye-slash toggle-password"></span>
                                        </div>
                                    </div>
                                    <div className="input-block">
                                        <a className="forgot-link" href="forgot-password.html">
                                            Quên mật khẩu?
                                        </a>
                                    </div>
                                    <div className="input-block m-0">
                                        <label className="custom_check d-inline-flex">
                                            <span>Ghi nhớ đăng nhập</span>
                                            <input type="checkbox" name="remember" />
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>
                                    <a href="index.html" className="btn btn-outline-light w-100 btn-size mt-1">
                                        ĐĂNG NHẬP
                                    </a>
                                    <div className="login-or">
                                        <span className="or-line"></span>
                                        <span className="span-or-log">hoặc</span>
                                    </div>

                                    <div className="social-login">
                                        <a
                                            href="#"
                                            className="d-flex align-items-center justify-content-center input-block btn google-login w-100"
                                        >
                                            <span>
                                                <img src="/img/icons/google.svg" className="img-fluid" alt="Google" />
                                            </span>
                                            Đăng nhập với Google
                                        </a>
                                    </div>
                                   
                                    <div className="text-center dont-have">
                                        Bạn chưa có tài khoản? <a className="main-color" href="/register">Đăng ký</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="log-footer">
                    <div className="container-fluid">
                        <div className="copyright">
                            <div className="copyright-text">
                                <p>© 2025 FixTech. All Rights Reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default LogInPage;
