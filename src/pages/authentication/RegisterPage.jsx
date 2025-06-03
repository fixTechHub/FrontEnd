function RegisterPage() {
    return (
        <>
            <div className="main-wrapper login-body">
                {/* Header */}
                <header className="log-header">
                    <a href="index.html">
                        <img className="img-fluid logo-dark" src="/img/logo.png" alt="Logo" />
                    </a>
                </header>
                {/* /Header */}

                <div className="login-wrapper">
                    <div className="loginbox">
                        <div className="login-auth">
                            <div className="login-auth-wrap">
                                <h1>Đăng Ký</h1>
                                <p className="account-subtitle">
                                    Chúng tôi sẽ gửi mã xác nhận tới email hoặc số điện thoại của bạn.
                                </p>
                                <form action="/">
                                    <div className="input-block">
                                        <label className="form-label">
                                            Email / Số điện thoại <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" className="form-control" placeholder="" />
                                    </div>
                                    <div className="input-block">
                                        <label className="form-label">
                                            Mật khẩu <span className="text-danger">*</span>
                                        </label>
                                        <input type="email" className="form-control" placeholder="" />
                                    </div>
                                    <div className="input-block">
                                        <label className="form-label">
                                            Xác nhận mật khẩu <span className="text-danger">*</span>
                                        </label>
                                        <div className="pass-group">
                                            <input type="password" className="form-control pass-input" placeholder="" />
                                            <span className="fas fa-eye-slash toggle-password"></span>
                                        </div>
                                    </div>
                                    <a href="/choose-role" className="btn btn-outline-light w-100 btn-size mt-1">
                                        ĐĂNG KÝ
                                    </a>
                                    <div className="login-or">
                                        <span className="or-line"></span>
                                        <span className="span-or">hoặc</span>
                                    </div>
                                    {/* Social Login */}
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
                                        Bạn đã có tài khoản? <a className="main-color" href="/login"> Đăng nhập</a>
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
                                <p>© 2024 FixTech. All Rights Reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default RegisterPage;
